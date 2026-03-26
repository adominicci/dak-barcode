<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		ArrowRight,
		Clock3,
		ClipboardList,
		LoaderCircle,
		PackageSearch,
		ScanBarcode,
		Scale,
		TriangleAlert,
		UserRound
	} from '@lucide/svelte';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import { getLoadViewDetailAll, getLoadViewUnion } from '$lib/load-view.remote';
	import { getLoaderInfo, endLoaderSession } from '$lib/loader-session.remote';
	import { processLoadingScan } from '$lib/scan.remote';
	import {
		createLoadingDropNavigationState,
		moveLoadingDropSelection
	} from '$lib/workflow/loading-drop-navigation';
	import { withTimeout } from '$lib/workflow/async-timeout';
	import { createLoadingScanController } from '$lib/workflow/loading-scan-controller';
	import { getLoadingUnionKey } from '$lib/workflow/loading-union-key';
	import {
		buildEndLoaderSessionInput,
		hasLoadingWorkflowContext,
		parseLoadingEntryContext,
		toNavigationHref
	} from '$lib/workflow/loading-lifecycle';
	import {
		workflowStores,
		type WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	const WEIGHT_FORMATTER = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1
	});

	const LOADING_SCAN_TIMEOUT_MS = 8000;
	const LOADING_SCAN_TIMEOUT_MESSAGE = 'We could not process that scan right now.';

	const selectedDepartment = get(workflowStores.selectedDepartment);
	const currentLoader = get(workflowStores.currentLoader);

	let redirectHandled = $state(false);
	let allowNavigation = $state(false);
	let isEndingSession = $state(false);
	let lifecycleError = $state<string | null>(null);
	let selectedDropIndex = $state(0);
	let currentDropArea = $state<WorkflowDropAreaSelection>(null);
	let loadingScanController = $state<ReturnType<typeof createLoadingScanController> | null>(null);
	let scanInputValue = $state('');
	let scanError = $state<string | null>(null);
	let scanPrompt = $state<string | null>(null);
	let isLocationModalOpen = $state(false);
	let scanInputElement = $state<HTMLInputElement | null>(null);
	let isScanning = $state(false);
	let pendingTimedOutScan = $state<Promise<unknown> | null>(null);

	const loadingEntry = $derived(parseLoadingEntryContext(page.url));
	const hasWorkflowContext = hasLoadingWorkflowContext({
		selectedDepartment,
		currentLoader
	});
	const shouldRedirectHome = $derived(loadingEntry === null || !hasWorkflowContext);
	const loaderInfoQuery = $derived(
		loadingEntry && hasWorkflowContext ? getLoaderInfo(loadingEntry.loaderSessionId) : null
	);
	const loaderInfo = $derived(loaderInfoQuery?.current ?? null);
	const dropDetailsQuery = $derived(
		loadingEntry && hasWorkflowContext
			? getLoadViewDetailAll({
					dropSheetId: loadingEntry.dropSheetId,
					locationId: loadingEntry.locationId
				})
			: null
	);
	const dropDetails = $derived(dropDetailsQuery?.current ?? []);
	const dropNavigation = $derived(
		createLoadingDropNavigationState(dropDetails.length, selectedDropIndex)
	);
	const selectedDropDetail = $derived(
		dropNavigation.selectedIndex >= 0 ? dropDetails[dropNavigation.selectedIndex] : null
	);
	const loadNumber = $derived(selectedDropDetail?.loadNumber ?? loadingEntry?.loadNumber ?? null);
	const dropLabelsQuery = $derived(
		selectedDropDetail
			? getLoadViewUnion({
					loadNumber: selectedDropDetail.loadNumber,
					sequence: selectedDropDetail.sequence,
					locationId: selectedDropDetail.locationId
				})
			: null
	);
	const dropLabels = $derived(dropLabelsQuery?.current ?? []);
	const isLoadingDropLabels = $derived((dropLabelsQuery?.loading ?? false) && dropLabels.length === 0);
	const showSoNumberSummary = $derived(!dropLabelsQuery?.error && !isLoadingDropLabels);
	const soNumbers = $derived(
		Array.from(
			new Set(
				dropLabels
					.map((label) => label.orderSoNumber.trim())
					.filter((orderSoNumber) => orderSoNumber.length > 0)
			)
		)
	);

	$effect(() => {
		if (!isScanning && pendingTimedOutScan === null && !isLocationModalOpen) {
			void focusScanInput();
		}
	});

	onMount(() => {
		if (redirectHandled || !shouldRedirectHome) {
			loadingScanController = createLoadingScanController({
				processScan: processLoadingScan,
				refreshActiveDropData
			});
		}

		if (!redirectHandled && shouldRedirectHome) {
			redirectHandled = true;
			allowNavigation = true;
			void goto(resolve('/home'), { replaceState: true });
		}

		const unsubscribeDropArea = workflowStores.currentDropArea.subscribe((dropArea) => {
			currentDropArea = dropArea;
		});

		return () => {
			unsubscribeDropArea();
			loadingScanController?.cancelPendingScan();
			loadingScanController = null;
		};
	});

	beforeNavigate((navigation) => {
		if (
			allowNavigation ||
			navigation.willUnload ||
			navigation.to?.url.pathname === '/loading' ||
			isEndingSession ||
			loadingEntry === null
		) {
			return;
		}

		const destinationHref = navigation.to ? toNavigationHref(navigation.to.url) : null;
		const endInput = buildEndLoaderSessionInput({
			loaderInfo,
			loadingEntry,
			selectedDepartment,
			currentLoader,
			endedAt: new Date().toISOString()
		});

		if (endInput === null || destinationHref === null) {
			return;
		}

		navigation.cancel();
		isEndingSession = true;
		lifecycleError = null;

		void (async () => {
			try {
				await endLoaderSession(endInput);
				workflowStores.resetOperationalState();
				allowNavigation = true;
				await goto((resolve as (href: string) => string)(destinationHref), { replaceState: true });
			} catch (error) {
				lifecycleError =
					error instanceof Error ? error.message : 'Unable to end the loader session.';
			} finally {
				isEndingSession = false;
			}
		})();
	});

	function formatTimestamp(timestamp: string | null) {
		if (!timestamp) {
			return 'Not recorded';
		}

		return DATE_TIME_FORMATTER.format(new Date(timestamp));
	}

	function formatWeight(weight: number | null) {
		if (weight === null) {
			return '--';
		}

		return `${WEIGHT_FORMATTER.format(weight)} lbs`;
	}

	async function focusScanInput() {
		if (
			shouldRedirectHome ||
			loaderInfo === null ||
			selectedDropDetail === null ||
			isLocationModalOpen ||
			pendingTimedOutScan !== null
		) {
			return;
		}

		await tick();
		scanInputElement?.focus();
	}

	function clearScanInput() {
		scanInputValue = '';
		workflowStores.clearScannedText();
	}

	async function refreshActiveDropData() {
		if (selectedDropDetail === null || dropDetailsQuery === null) {
			return;
		}

		const activeUnionQuery = getLoadViewUnion({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: selectedDropDetail.locationId
		});

		await Promise.all([dropDetailsQuery.refresh(), activeUnionQuery.refresh()]);
	}

	async function applyScanAction(
		action: ReturnType<NonNullable<typeof loadingScanController>['submitScan']> extends Promise<infer T>
			? T
			: never
	) {
		if (!action) {
			await focusScanInput();
			return;
		}

		scanError = action.kind === 'error' ? action.message : null;
		scanPrompt = action.kind === 'needs-location' ? action.message : null;
		isLocationModalOpen = action.kind === 'needs-location';

		if (action.kind === 'location-updated') {
			workflowStores.setCurrentDropArea(action.dropArea);
			scanPrompt = null;
		}

		if (action.clearCurrentDropArea) {
			workflowStores.clearCurrentDropArea();
		}

		if (action.showSuccessToast) {
			scanError = null;
			scanPrompt = null;
			toast.success(action.message);
		}

		if (!isScanning && pendingTimedOutScan === null) {
			await focusScanInput();
		}
	}

	function monitorTimedOutScanSettlement(
		scanPromise: ReturnType<NonNullable<typeof loadingScanController>['submitScan']>
	) {
		pendingTimedOutScan = (async () => {
			try {
				const action = await scanPromise;
				await applyScanAction(action);

				if (action?.kind === 'location-updated' && loadingScanController?.hasPendingScan()) {
					await retryPendingScanWithDropArea(action.dropArea.dropAreaId);
				}
			} catch {
				// Keep the timeout fallback in place if the request also fails.
			} finally {
				pendingTimedOutScan = null;
			}
		})();
	}

	async function retryPendingScanWithDropArea(dropAreaId: number) {
		if (!loadingScanController || !loaderInfo || selectedDropDetail === null) {
			return false;
		}

		const retryPromise = loadingScanController.retryPendingScan({
			department: loaderInfo.department,
			dropAreaId,
			loadNumber: selectedDropDetail.loadNumber,
			loaderName: loaderInfo.loaderName
		});

		try {
			const action = await withTimeout(
				retryPromise,
				LOADING_SCAN_TIMEOUT_MS,
				LOADING_SCAN_TIMEOUT_MESSAGE
			);
			if (action) {
				await applyScanAction(action);
			}
			return action !== null;
		} catch (error) {
			scanPrompt = null;

			if (error instanceof Error && error.message === LOADING_SCAN_TIMEOUT_MESSAGE) {
				scanError = LOADING_SCAN_TIMEOUT_MESSAGE;
				monitorTimedOutScanSettlement(retryPromise);
			} else {
				scanError =
					error instanceof Error ? error.message : 'The loading scan request failed.';
				loadingScanController.cancelPendingScan();
				await focusScanInput();
			}
			return false;
		}
	}

	async function submitScan(rawValue: string) {
		if (
			!loadingScanController ||
			!loaderInfo ||
			selectedDropDetail === null ||
			isLocationModalOpen ||
			isScanning ||
			pendingTimedOutScan !== null
		) {
			return;
		}

		const scannedText = rawValue.trim();
		clearScanInput();

		if (scannedText.length === 0) {
			scanError = null;
			scanPrompt = null;
			await focusScanInput();
			return;
		}

		workflowStores.setScannedText(scannedText);
		isScanning = true;
		let shouldRefocusAfterScan = false;
		const scanPromise = loadingScanController.submitScan({
			scannedText,
			department: loaderInfo.department,
			dropAreaId: currentDropArea?.dropAreaId ?? null,
			loadNumber: selectedDropDetail.loadNumber,
			loaderName: loaderInfo.loaderName
		});

		try {
			const action = await withTimeout(
				scanPromise,
				LOADING_SCAN_TIMEOUT_MS,
				LOADING_SCAN_TIMEOUT_MESSAGE
			);
			await applyScanAction(action);
			shouldRefocusAfterScan = true;

			if (action?.kind === 'location-updated' && loadingScanController.hasPendingScan()) {
				shouldRefocusAfterScan = !(await retryPendingScanWithDropArea(action.dropArea.dropAreaId));
			}
		} catch (error) {
			scanPrompt = null;

			if (error instanceof Error && error.message === LOADING_SCAN_TIMEOUT_MESSAGE) {
				scanError = LOADING_SCAN_TIMEOUT_MESSAGE;
				monitorTimedOutScanSettlement(scanPromise);
				shouldRefocusAfterScan = false;
			} else {
				scanError =
					error instanceof Error ? error.message : 'The loading scan request failed.';
				loadingScanController.cancelPendingScan();
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

	function moveToDrop(direction: 'previous' | 'next') {
		if (loadingScanController?.hasPendingScan() && loadingScanController.cancelPendingScan()) {
			scanPrompt = null;
		}

		scanError = null;
		isLocationModalOpen = false;
		selectedDropIndex = moveLoadingDropSelection({
			selectedIndex: dropNavigation.selectedIndex,
			totalDrops: dropNavigation.totalDrops,
			direction
		});
	}

	async function handleLocationSelect(dropArea: NonNullable<WorkflowDropAreaSelection>) {
		workflowStores.setCurrentDropArea(dropArea);
		scanError = null;
		scanPrompt = null;
		isScanning = true;
		isLocationModalOpen = false;

		try {
			await retryPendingScanWithDropArea(dropArea.dropAreaId);
		} finally {
			isScanning = false;
		}

		await focusScanInput();
	}

	async function handleLocationModalClose() {
		loadingScanController?.cancelPendingScan();
		scanError = null;
		scanPrompt = null;
		isLocationModalOpen = false;
		await focusScanInput();
	}

	function getLabelStatusClasses(scanned: boolean) {
		return scanned
			? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
			: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
	}
</script>

<div class="space-y-8">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-slate-950">Loading</h2>
			<p class="mt-2 text-sm text-on-surface-variant">
				Keep the scanner flowing: update driver locations, load labels, and refresh the active drop without leaving this screen.
			</p>
		</div>

		{#if loadingEntry}
			<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-2xl bg-surface-container-low px-5 py-4">
					<p class="ui-label text-xs">Dropsheet</p>
					<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
						{loadingEntry.dropSheetId}
					</p>
				</div>
				<div class="rounded-2xl bg-surface-container-low px-5 py-4">
					<p class="ui-label text-xs">Location</p>
					<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
						{loadingEntry.locationId}
					</p>
				</div>
				<div class="rounded-2xl bg-surface-container-low px-5 py-4">
					<p class="ui-label text-xs">Load</p>
					<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
						{loadNumber ?? '--'}
					</p>
				</div>
				<div class="rounded-2xl bg-surface-container-low px-5 py-4">
					<p class="ui-label text-xs">Weight</p>
					<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
						{formatWeight(loadingEntry.dropWeight)}
					</p>
				</div>
			</div>
		{/if}
	</div>

	{#if lifecycleError}
		<div class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
			<TriangleAlert class="mt-0.5 size-4 shrink-0" />
			<p>{lifecycleError}</p>
		</div>
	{/if}

	<div class="rounded-[2rem] bg-surface-container-low p-6 sm:p-8">
		{#if shouldRedirectHome}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Returning to Home...</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					Loading requires an active dropsheet handoff from the current session.
				</p>
			</div>
		{:else if loaderInfoQuery?.error}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Unable to load the loader session.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">{loaderInfoQuery.error.message}</p>
			</div>
		{:else if loaderInfoQuery?.loading || loaderInfo === null}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					Loading session details...
				</p>
			</div>
		{:else if dropDetailsQuery?.error}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Unable to load the drop list.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">{dropDetailsQuery.error.message}</p>
			</div>
		{:else if dropDetailsQuery?.loading && dropDetails.length === 0}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					Loading drop navigation...
				</p>
			</div>
		{:else if selectedDropDetail === null}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<PackageSearch class="size-8" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					No drops are ready for this loading session.
				</p>
			</div>
		{:else}
			<div class="space-y-6">
				<div class="rounded-[2rem] bg-white p-6 shadow-sm">
					<div class="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
						<div class="space-y-5">
							<div class="flex items-center gap-3">
								<div class="flex size-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
									<ClipboardList class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Active drop</p>
									<h3 class="text-2xl font-bold tracking-tight text-slate-950">
										Drop {dropNavigation.activeDropNumber} of {dropNavigation.totalDrops}
									</h3>
								</div>
							</div>

							<div class="grid gap-3 sm:grid-cols-2">
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Customer</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{selectedDropDetail.customerName}
									</p>
								</div>
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Driver</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{selectedDropDetail.driverName || 'Unassigned'}
									</p>
								</div>
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Load number</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{selectedDropDetail.loadNumber}
									</p>
								</div>
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Drop detail</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{selectedDropDetail.totalCountText || 'Pending'}
									</p>
								</div>
							</div>
						</div>

						<div class="rounded-[1.75rem] bg-surface-container-low p-5">
							<div class="flex items-center gap-3">
								<div class="flex size-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
									<Clock3 class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Started</p>
									<p class="mt-1 text-lg font-bold tracking-tight text-slate-950">
										{formatTimestamp(loaderInfo.startedAt)}
									</p>
								</div>
							</div>

							<div class="mt-5 grid gap-3">
								<div class="rounded-2xl bg-white px-4 py-4 shadow-sm">
									<p class="ui-label text-xs">Loader</p>
									<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
										{loaderInfo.loaderName}
									</p>
								</div>
								<div class="rounded-2xl bg-white px-4 py-4 shadow-sm">
									<p class="ui-label text-xs">Session ID</p>
									<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
										{loaderInfo.id}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
					<div class="rounded-[2rem] bg-white p-5 shadow-sm">
						<p class="ui-label text-xs">Drop navigation</p>
						<p class="mt-2 text-sm leading-6 text-slate-600">
							Move through the active drops without leaving the loading session.
						</p>

						<div class="mt-5 grid gap-3">
							<button
								type="button"
								aria-label="Previous drop"
								class="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-4 text-left font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoPrevious}
								onclick={() => moveToDrop('previous')}
							>
								<span class="flex items-center gap-3">
									<ArrowLeft class="size-4" />
									<span>Previous drop</span>
								</span>
								<span class="text-xs text-slate-500">
									{dropNavigation.canGoPrevious ? `Drop ${dropNavigation.activeDropNumber - 1}` : 'First'}
								</span>
							</button>

							<button
								type="button"
								aria-label="Next drop"
								class="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-4 text-left font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoNext}
								onclick={() => moveToDrop('next')}
							>
								<span class="flex items-center gap-3">
									<ArrowRight class="size-4" />
									<span>Next drop</span>
								</span>
								<span class="text-xs text-slate-500">
									{dropNavigation.canGoNext ? `Drop ${dropNavigation.activeDropNumber + 1}` : 'Last'}
								</span>
							</button>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="flex size-10 items-center justify-center rounded-2xl bg-primary/5 text-primary">
									<UserRound class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Department</p>
									<p class="mt-1 text-lg font-bold tracking-tight text-slate-950">
										{loaderInfo.department}
									</p>
								</div>
							</div>
						</div>

						<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
							<p class="ui-label text-xs">Labels</p>
							<p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
								{selectedDropDetail.labelCount}
							</p>
						</div>

						<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
							<p class="ui-label text-xs">Scanned</p>
							<p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
								{selectedDropDetail.scannedCount}
							</p>
						</div>

						<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
							<div class="flex items-center gap-3">
								<div class="flex size-10 items-center justify-center rounded-2xl bg-primary/5 text-primary">
									<Scale class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Need pick</p>
									<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
										{selectedDropDetail.needPickCount}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="rounded-[2rem] bg-white p-6 shadow-sm">
					<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div class="space-y-2">
							<p class="ui-label text-xs">Label list</p>
							<h3 class="text-xl font-bold tracking-tight text-slate-950">
								Union labels for the active drop
							</h3>
							<p class="text-sm leading-6 text-slate-600">
								Each row shows the SO, part list, drop area, and whether the label is already scanned.
							</p>
						</div>

						<div class="flex min-w-[16rem] items-center gap-3 rounded-[1.5rem] bg-surface-container-low px-4 py-4">
							<div class="flex size-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
								<ScanBarcode class="size-5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-slate-900">Scanner ready</p>
								<p class="text-xs text-slate-600">
									{currentDropArea?.dropAreaLabel
										? `Driver location ${currentDropArea.dropAreaLabel}`
										: 'Scan a driver location or label to keep loading.'}
								</p>
							</div>
						</div>
					</div>

					<div class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
						<div class="space-y-2">
							<label class="ui-label px-1 text-xs" for="loading-scan-input">Scan Barcode</label>
							<div class="relative">
								<ScanBarcode class="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
								<input
									id="loading-scan-input"
									data-testid="loading-scan-input"
									type="text"
									bind:value={scanInputValue}
									bind:this={scanInputElement}
									placeholder={currentDropArea?.dropAreaLabel
										? 'Scan or type loading barcode...'
										: 'Scan a driver location or loading barcode...'}
									disabled={isScanning || pendingTimedOutScan !== null || isLocationModalOpen}
									onkeydown={handleScanKeydown}
									class="h-16 w-full rounded-2xl border-none bg-surface-container-highest pl-14 pr-6 text-lg transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
								/>
							</div>
							{#if scanError}
								<div
									class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-[0_12px_30px_-24px_rgba(190,24,93,0.48)]"
								>
									<TriangleAlert class="mt-0.5 size-4 shrink-0" />
									<p>{scanError}</p>
								</div>
							{:else if scanPrompt}
								<div
									class="flex gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-800 shadow-[0_12px_30px_-24px_rgba(180,83,9,0.42)]"
								>
									<TriangleAlert class="mt-0.5 size-4 shrink-0" />
									<p>{scanPrompt}</p>
								</div>
							{/if}
						</div>

						<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
							<div class="rounded-[1.5rem] bg-surface-container-low px-4 py-4">
								<p class="ui-label text-xs">Driver location</p>
								<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
									{currentDropArea?.dropAreaLabel ?? 'Waiting for scan'}
								</p>
								<p class="mt-1 text-xs text-slate-500">
									{loaderInfo.department === 'Roll'
										? 'Roll clears after each successful label or pallet scan.'
										: 'Location stays active until you scan a new one.'}
								</p>
							</div>

							<div class="rounded-[1.5rem] bg-surface-container-low px-4 py-4">
								<p class="ui-label text-xs">Scan state</p>
								<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
									{pendingTimedOutScan !== null
										? 'Retrying'
										: isScanning
											? 'Processing'
											: scanPrompt
												? 'Need location'
												: 'Ready'}
								</p>
								<p class="mt-1 text-xs text-slate-500">
									{pendingTimedOutScan !== null
										? 'The last request timed out but the page is still monitoring it.'
										: scanPrompt
											? 'Scan a numeric driver location next to retry the pending label.'
											: 'Press Enter from the scanner to submit immediately.'}
								</p>
							</div>
						</div>
					</div>

					{#if showSoNumberSummary}
						<div class="mt-6 flex flex-wrap gap-2">
							{#if soNumbers.length > 0}
								{#each soNumbers as orderSoNumber (orderSoNumber)}
									<span class="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-slate-700">
										{orderSoNumber}
									</span>
								{/each}
							{:else}
								<span class="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-slate-500">
									No SO numbers available
								</span>
							{/if}
						</div>
					{/if}

					{#if dropLabelsQuery?.error}
						<div class="mt-6 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
							{dropLabelsQuery.error.message}
						</div>
					{:else if isLoadingDropLabels}
						<div class="mt-6 rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-slate-600">
							Loading label list...
						</div>
					{:else if dropLabels.length === 0}
						<div class="mt-6 rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-slate-600">
							No labels are attached to this drop yet.
						</div>
					{:else}
						<div class="mt-6 grid gap-3">
							{#each dropLabels as label, index (getLoadingUnionKey(label, index))}
								<div class="rounded-[1.5rem] bg-surface-container-low p-4">
									<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
										<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
											<div>
												<p class="ui-label text-xs">SO</p>
												<p class="mt-1 text-sm font-bold text-slate-950">
													{label.orderSoNumber || '--'}
												</p>
											</div>
											<div>
												<p class="ui-label text-xs">Part list</p>
												<p class="mt-1 text-sm font-bold text-slate-950">
													{label.partListId || '--'}
												</p>
											</div>
											<div>
												<p class="ui-label text-xs">Drop area</p>
												<p class="mt-1 text-sm font-bold text-slate-950">
													{label.dropAreaName || '--'}
												</p>
											</div>
											<div>
												<p class="ui-label text-xs">Length</p>
												<p class="mt-1 text-sm font-bold text-slate-950">
													{label.lengthText || '--'}
												</p>
											</div>
										</div>

										<span class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getLabelStatusClasses(label.scanned)}`}>
											{label.scanned ? 'Scanned' : 'Unscanned'}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if isLocationModalOpen && loaderInfo}
		<StagingLocationModal
			department={loaderInfo.department}
			mode="loading"
			onClose={handleLocationModalClose}
			onSelect={handleLocationSelect}
		/>
	{/if}
</div>
