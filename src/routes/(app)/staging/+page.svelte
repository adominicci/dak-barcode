<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { ScanBarcode, ChevronDown, MapPin, TriangleAlert } from '@lucide/svelte';
	import DepartmentSelectionModal from '$lib/components/workflow/department-selection-modal.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import StagingListPanel from '$lib/components/workflow/staging-list-panel.svelte';
	import { processStagingScan } from '$lib/scan.remote';
	import { withTimeout } from '$lib/workflow/async-timeout';
	import { createStagingScanController } from '$lib/workflow/staging-scan-controller';
	import { createStagingListController } from '$lib/workflow/staging-list-controller.svelte';
	import {
		workflowStores,
		type WorkflowDepartment,
		type WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	let selectedDepartment = $state<WorkflowDepartment>(null);
	let currentDropArea = $state<WorkflowDropAreaSelection>(null);
	let isDepartmentGateOpen = $state(true);
	let isLocationModalOpen = $state(false);
	let stagingListController = $state<ReturnType<typeof createStagingListController> | null>(null);
	let stagingScanController = $state<ReturnType<typeof createStagingScanController> | null>(null);
	let scanInputValue = $state('');
	let scanError = $state<string | null>(null);
	let scanInputElement = $state<HTMLInputElement | null>(null);
	let isScanning = $state(false);
	let pendingTimedOutScan = $state<Promise<unknown> | null>(null);

	const STAGING_SCAN_TIMEOUT_MS = 8000;
	const STAGING_SCAN_TIMEOUT_MESSAGE = 'We could not process that scan right now.';
	const STAGING_LOCATION_REQUIRED_MESSAGE = 'Please scan a location first';

	$effect(() => {
		if (!isScanning && pendingTimedOutScan === null && !isLocationModalOpen) {
			void focusScanInput();
		}
	});

	onMount(() => {
		workflowStores.prepareForStagingEntry();
		stagingListController = createStagingListController();
		stagingScanController = createStagingScanController({
			processScan: processStagingScan,
			refreshActiveList: async () => {
				await stagingListController?.refreshActiveList();
			}
		});

		const unsubscribeDepartment = workflowStores.selectedDepartment.subscribe((department) => {
			selectedDepartment = department;
			isDepartmentGateOpen = department === null;
			if (department) {
				scanError = null;
				void focusScanInput();
			}
		});
		const unsubscribeDropArea = workflowStores.currentDropArea.subscribe((dropArea) => {
			currentDropArea = dropArea;
		});

		return () => {
			unsubscribeDepartment();
			unsubscribeDropArea();
			stagingListController?.destroy();
			stagingListController = null;
			stagingScanController = null;
		};
	});

	async function focusScanInput() {
		if (isDepartmentGateOpen) {
			return;
		}

		await tick();
		scanInputElement?.focus();
	}

	function clearScanInput() {
		scanInputValue = '';
		workflowStores.clearScannedText();
	}

	async function applyScanAction(
		action: ReturnType<NonNullable<typeof stagingScanController>['submitScan']> extends Promise<infer T>
			? T
			: never
	) {
		if (!action) {
			await focusScanInput();
			return;
		}

		scanError =
			action.kind === 'error'
				? action.message
				: action.kind === 'needs-location'
					? STAGING_LOCATION_REQUIRED_MESSAGE
					: null;

		if (action.kind === 'location-updated') {
			workflowStores.setCurrentDropArea(action.dropArea);
		}

		if (action.clearCurrentDropArea) {
			workflowStores.clearCurrentDropArea();
		}

		if (action.showSuccessToast) {
			toast.success(action.message);
		}

		isLocationModalOpen = action.openLocationModal;

		if (!action.openLocationModal && !isScanning) {
			await focusScanInput();
		}
	}

	async function retryPendingScanWithDropArea(dropAreaId: number) {
		if (!selectedDepartment || !stagingScanController?.hasPendingScan()) {
			return false;
		}

		const retryPromise = stagingScanController.retryPendingScan({
			department: selectedDepartment,
			dropAreaId
		});

		try {
			const action = await withTimeout(
				retryPromise,
				STAGING_SCAN_TIMEOUT_MS,
				STAGING_SCAN_TIMEOUT_MESSAGE
			);
			if (action) {
				await applyScanAction(action);
			}
			return action !== null;
		} catch (error) {
			stagingScanController?.cancelPendingScan();
			scanError = STAGING_SCAN_TIMEOUT_MESSAGE;

			if (error instanceof Error && error.message === STAGING_SCAN_TIMEOUT_MESSAGE) {
				pendingTimedOutScan = retryPromise.finally(() => {
					pendingTimedOutScan = null;
				});
			} else {
				await focusScanInput();
			}
			return false;
		}
	}

	async function submitScan(rawValue: string) {
		if (!selectedDepartment || !stagingScanController || isScanning || pendingTimedOutScan !== null) {
			return;
		}

		const scannedText = rawValue.trim();
		clearScanInput();

		if (scannedText.length === 0) {
			scanError = null;
			await focusScanInput();
			return;
		}

		workflowStores.setScannedText(scannedText);
		isScanning = true;
		let shouldRefocusAfterScan = false;
		const scanPromise = stagingScanController.submitScan({
			scannedText,
			department: selectedDepartment,
			dropAreaId: currentDropArea?.dropAreaId ?? null
		});
		try {
			const action = await withTimeout(
				scanPromise,
				STAGING_SCAN_TIMEOUT_MS,
				STAGING_SCAN_TIMEOUT_MESSAGE
			);
			await applyScanAction(action);
			shouldRefocusAfterScan = !action?.openLocationModal;

			if (action?.kind === 'location-updated') {
				await retryPendingScanWithDropArea(action.dropArea.dropAreaId);
			}
		} catch (error) {
			stagingScanController?.cancelPendingScan();
			scanError = STAGING_SCAN_TIMEOUT_MESSAGE;
			if (error instanceof Error && error.message === STAGING_SCAN_TIMEOUT_MESSAGE) {
				pendingTimedOutScan = scanPromise.finally(() => {
					pendingTimedOutScan = null;
				});
			} else {
				shouldRefocusAfterScan = true;
			}
		} finally {
			isScanning = false;
		}

		if (shouldRefocusAfterScan) {
			await focusScanInput();
		}
	}

	async function handleScanKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();
		await submitScan(scanInputValue);
	}

	function handleDepartmentSelect(department: NonNullable<WorkflowDepartment>) {
		if (selectedDepartment !== department) {
			workflowStores.clearCurrentDropArea();
		}

		workflowStores.setSelectedDepartment(department);
		isDepartmentGateOpen = false;
		isLocationModalOpen = false;
		scanError = null;
		void focusScanInput();
	}

	async function handleLocationSelect(dropArea: NonNullable<WorkflowDropAreaSelection>) {
		workflowStores.setCurrentDropArea(dropArea);
		isLocationModalOpen = false;
		scanError = null;

		if (await retryPendingScanWithDropArea(dropArea.dropAreaId)) {
			return;
		}

		await focusScanInput();
	}

	async function handleLocationModalClose() {
		if (stagingScanController?.cancelPendingScan()) {
			scanError = null;
		}

		isLocationModalOpen = false;
		await focusScanInput();
	}
</script>

<div class="space-y-8">
	<!-- Scan & Filters (reference: staging-strict-v4) -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
		<div class="lg:col-span-6 space-y-2">
			<label class="ui-label text-xs px-1" for="scan-input">Scan Barcode</label>
			<div class="relative">
				<ScanBarcode class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary" />
				<input
					id="scan-input"
					data-testid="staging-scan-input"
					type="text"
					bind:value={scanInputValue}
					bind:this={scanInputElement}
					placeholder="Scan or type item barcode..."
					disabled={isDepartmentGateOpen || isScanning || pendingTimedOutScan !== null}
					onkeydown={handleScanKeydown}
					class="w-full h-16 pl-14 pr-6 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-lg placeholder:text-on-surface-variant/50"
				/>
			</div>
			{#if scanError}
				<div
					data-testid="staging-scan-error"
					class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-[0_12px_30px_-24px_rgba(190,24,93,0.48)]"
				>
					<TriangleAlert class="mt-0.5 size-4 shrink-0" />
					<p>{scanError}</p>
				</div>
			{/if}
		</div>
		<div class="lg:col-span-3 space-y-2">
			<p class="ui-label text-xs px-1">Department</p>
			<button
				data-testid="staging-department-trigger"
				type="button"
				class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
				onclick={() => {
					stagingScanController?.cancelPendingScan();
					scanError = null;
					isLocationModalOpen = false;
					isDepartmentGateOpen = true;
				}}
			>
				<span>{selectedDepartment ?? 'Select Department'}</span>
				<ChevronDown class="size-5 text-on-surface-variant" />
			</button>
		</div>
		<div class="lg:col-span-3 space-y-2">
			<p class="ui-label text-xs px-1">Location</p>
			<button
				data-testid="staging-location-trigger"
				type="button"
				disabled={isDepartmentGateOpen}
				class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
				onclick={() => (isLocationModalOpen = true)}
			>
				<span>{currentDropArea?.dropAreaLabel ?? 'Select Location'}</span>
				<MapPin class="size-5 text-on-surface-variant" />
			</button>
		</div>
	</section>

	<StagingListPanel
		department={selectedDepartment}
		items={stagingListController?.activeItems ?? []}
		loading={stagingListController?.activeLoading ?? false}
		error={stagingListController?.activeError ?? null}
	/>
</div>

{#if isDepartmentGateOpen}
	<DepartmentSelectionModal onSelect={handleDepartmentSelect} />
{/if}

{#if isLocationModalOpen && selectedDepartment}
	<StagingLocationModal
		department={selectedDepartment}
		onClose={handleLocationModalClose}
		onSelect={handleLocationSelect}
	/>
{/if}
