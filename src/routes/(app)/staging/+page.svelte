<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { ChevronDown, MapPin, TriangleAlert } from '@lucide/svelte';
	import DepartmentSelectionModal from '$lib/components/workflow/department-selection-modal.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import StagingListPanel from '$lib/components/workflow/staging-list-panel.svelte';
	import WorkflowScanField from '$lib/components/workflow/workflow-scan-field.svelte';
	import { processStagingScan } from '$lib/scan.remote';
	import { withTimeout } from '$lib/workflow/async-timeout';
	import { createStagingScanController } from '$lib/workflow/staging-scan-controller';
	import { createStagingListController } from '$lib/workflow/staging-list-controller.svelte';
	import {
		workflowStores,
		type WorkflowDepartment,
		type WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	const activeTarget = $derived(page.data?.activeTarget ?? null);

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
			processScan: async (input) => await processStagingScan(input),
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

		if (!action.openLocationModal && !isScanning && pendingTimedOutScan === null) {
			await focusScanInput();
		}
	}

	function monitorTimedOutScanSettlement(
		scanPromise: ReturnType<NonNullable<typeof stagingScanController>['submitScan']>
	) {
		pendingTimedOutScan = (async () => {
			try {
				const action = await scanPromise;
				await applyScanAction(action);

				if (action?.kind === 'location-updated') {
					await retryPendingScanWithDropArea(action.dropArea.dropAreaId);
				}
			} catch {
				// The timeout fallback is already visible; keep it in place if the request also fails.
			} finally {
				pendingTimedOutScan = null;
			}
		})();
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
			scanError = STAGING_SCAN_TIMEOUT_MESSAGE;

			if (error instanceof Error && error.message === STAGING_SCAN_TIMEOUT_MESSAGE) {
				monitorTimedOutScanSettlement(retryPromise);
			} else {
				stagingScanController?.cancelPendingScan();
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
			scanError = STAGING_SCAN_TIMEOUT_MESSAGE;
			if (error instanceof Error && error.message === STAGING_SCAN_TIMEOUT_MESSAGE) {
				monitorTimedOutScanSettlement(scanPromise);
			} else {
				stagingScanController?.cancelPendingScan();
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

<div class="space-y-5">
	<!-- Scan & Filters (reference: staging-strict-v4) -->
	<section class="grid grid-cols-1 items-end gap-4 lg:grid-cols-12">
		<div class="lg:col-span-6">
			<WorkflowScanField
				id="scan-input"
				label="Scan Barcode"
				bind:value={scanInputValue}
				placeholder="Scan or type item barcode..."
				disabled={isDepartmentGateOpen || isScanning || pendingTimedOutScan !== null}
				onKeydown={handleScanKeydown}
				onInputElement={(element) => {
					scanInputElement = element;
				}}
				testId="staging-scan"
			/>
			{#if scanError}
				<div
					data-testid="staging-scan-error"
					class="mt-3 flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700"
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
				disabled={pendingTimedOutScan !== null || isScanning}
				class="ds-control flex h-14 w-full items-center justify-between px-4 font-semibold transition-colors hover:bg-ds-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
				disabled={isDepartmentGateOpen || pendingTimedOutScan !== null || isScanning}
				class="ds-control flex h-14 w-full items-center justify-between px-4 font-semibold transition-colors hover:bg-ds-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
	<DepartmentSelectionModal
		onSelect={handleDepartmentSelect}
		onClose={() => void goto(resolve('/home'))}
	/>
{/if}

{#if isLocationModalOpen && selectedDepartment}
	<StagingLocationModal
		department={selectedDepartment}
		target={activeTarget}
		onClose={handleLocationModalClose}
		onSelect={handleLocationSelect}
	/>
{/if}
