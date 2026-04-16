<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		ArrowRight,
		ClipboardList,
		LoaderCircle,
		PackageSearch,
		PenLine,
		ScanBarcode,
		Truck,
		TriangleAlert
	} from '@lucide/svelte';
	import { onMount, settled } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { getOperatorErrorMessage } from '$lib/operator-error';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import { getDepartmentStatus } from '$lib/department-status.remote';
	import { getLoadViewDetailAll, getLoadViewUnion } from '$lib/load-view.remote';
	import { getLoaderInfo, endLoaderSession } from '$lib/loader-session.remote';
	import { processLoadingScan } from '$lib/scan.remote';
	import {
		createLoadingDropNavigationState,
		moveLoadingDropSelection
	} from '$lib/workflow/loading-drop-navigation';
	import {
		getLoadingDepartmentStatusEntries
	} from '$lib/workflow/loading-department-status';
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
	import type { LoadingScanRequest } from '$lib/types';

	const LOADING_SCAN_TIMEOUT_MS = 8000;
	const LOADING_SCAN_TIMEOUT_MESSAGE = 'We could not process that scan right now.';

	type LoadingRetryState =
		| {
				mode: 'direct';
				request: LoadingScanRequest;
		  }
		| {
				mode: 'pending';
				dropAreaId: number;
		  };

	type LoadingScanErrorState = {
		title: string;
		message: string;
		errorKind: 'business' | 'api' | 'transport';
		retryState: LoadingRetryState | null;
	};

	const selectedDepartment = get(workflowStores.selectedDepartment);
	const currentLoader = get(workflowStores.currentLoader);
	const activeTarget = $derived(page.data?.activeTarget ?? null);

	let redirectHandled = $state(false);
	let allowNavigation = $state(false);
	let isEndingSession = $state(false);
	let lifecycleError = $state<string | null>(null);
	let selectedDropIndex = $state<number | undefined>(undefined);
	let currentDropArea = $state<WorkflowDropAreaSelection>(null);
	let loadingScanController = $state<ReturnType<typeof createLoadingScanController> | null>(null);
	let scanInputValue = $state('');
	let scanError = $state<LoadingScanErrorState | null>(null);
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
	const loaderInfoState = $derived.by(() => {
		if (!(loadingEntry && hasWorkflowContext)) {
			return {
				current: null,
				error: null,
				loading: false,
				refresh: null
			};
		}

		const query = getLoaderInfo(loadingEntry.loaderSessionId);
		return {
			current: query.current ?? null,
			error: query.error,
			loading: query.loading,
			refresh: () => query.refresh()
		};
	});
	const loaderInfo = $derived(loaderInfoState.current);
	const dropDetailsState = $derived.by(() => {
		if (!(loadingEntry && hasWorkflowContext)) {
			return {
				current: [],
				error: null,
				loading: false,
				refresh: null
			};
		}

		const query = getLoadViewDetailAll({
			dropSheetId: loadingEntry.dropSheetId,
			locationId: loadingEntry.locationId
		});
		return {
			current: query.current ?? [],
			error: query.error,
			loading: query.loading,
			refresh: () => query.refresh()
		};
	});
	const dropDetails = $derived(dropDetailsState.current);
	const dropNavigation = $derived(
		createLoadingDropNavigationState(dropDetails.length, selectedDropIndex)
	);
	const selectedDropDetail = $derived(
		dropNavigation.selectedIndex >= 0 ? dropDetails[dropNavigation.selectedIndex] : null
	);
	const departmentStatusState = $derived.by(() => {
		if (!(loadingEntry && hasWorkflowContext && selectedDropDetail)) {
			return {
				current: null,
				error: null,
				loading: false
			};
		}

		const query = getDepartmentStatus(selectedDropDetail.dropSheetCustomerId);
		return {
			current: query.current ?? null,
			error: query.error,
			loading: query.loading
		};
	});
	const departmentStatus = $derived(departmentStatusState.current);
	const departmentStatusEntries = $derived(getLoadingDepartmentStatusEntries(departmentStatus));
	const loadNumber = $derived(selectedDropDetail?.loadNumber ?? loadingEntry?.loadNumber ?? null);
	const dropLabelsState = $derived.by(() => {
		if (!selectedDropDetail) {
			return {
				current: [],
				error: null,
				loading: false,
				refresh: null
			};
		}

		const query = getLoadViewUnion({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: selectedDropDetail.locationId
		});
		return {
			current: query.current ?? [],
			error: query.error,
			loading: query.loading,
			refresh: () => query.refresh()
		};
	});
	const dropLabels = $derived(dropLabelsState.current);
	const isLoadingDropLabels = $derived(dropLabelsState.loading && dropLabels.length === 0);
	const unscannedDropLabels = $derived(dropLabels.filter((label) => !label.scanned));
	const isEmptyDrop = $derived(!isLoadingDropLabels && dropLabels.length === 0);
	const isFullyScannedDrop = $derived(
		!isLoadingDropLabels && dropLabels.length > 0 && unscannedDropLabels.length === 0
	);

	$effect(() => {
		if (shouldRedirectHome || loadingEntry === null || selectedDropDetail === null) {
			workflowStores.clearCurrentLoadingHeaderContext();
			return;
		}

		workflowStores.setCurrentLoadingHeaderContext({
			driverName: selectedDropDetail.driverName?.trim() || null,
			dropWeight: loadingEntry.dropWeight
		});
	});

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
			workflowStores.clearCurrentLoadingHeaderContext();
			loadingScanController = null;
		};
	});

	beforeNavigate((navigation) => {
		if (
			allowNavigation ||
			navigation.willUnload ||
			navigation.to?.url.pathname === '/loading' ||
			navigation.to?.url.pathname.startsWith('/order-status') ||
			navigation.to?.url.pathname.startsWith('/move-orders') ||
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
				await goto(resolve(destinationHref as any), { replaceState: true });
			} catch (error) {
				lifecycleError =
					error instanceof Error ? error.message : 'Unable to end the loader session.';
			} finally {
				isEndingSession = false;
			}
		})();
	});

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

		await settled();
		scanInputElement?.focus();
	}

	function clearScanInput() {
		scanInputValue = '';
		workflowStores.clearScannedText();
	}

	function clearScanError() {
		scanError = null;
	}

	function buildLegacyActionSearchParams(input: {
		loadNumber: string | null;
		dropWeight: number | null;
		driverName: string | null;
	}) {
		const searchParams = new URLSearchParams({
			loadNumber: input.loadNumber ?? ''
		});

		if (input.dropWeight !== null) {
			searchParams.set('dropWeight', String(input.dropWeight));
		}

		if (input.driverName) {
			searchParams.set('driverName', input.driverName);
		}

		searchParams.set('returnTo', toNavigationHref(page.url));

		return searchParams;
	}

	function setTransportError(message: string, retryState: LoadingRetryState | null) {
		scanError = {
			title: 'Connection issue',
			message,
			errorKind: 'transport',
			retryState
		};
	}

	async function refreshActiveDropData() {
		if (selectedDropDetail === null || !dropDetailsState.refresh) {
			return;
		}

		const activeUnionQuery = getLoadViewUnion({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: selectedDropDetail.locationId
		});

		await Promise.all([dropDetailsState.refresh(), activeUnionQuery.refresh()]);
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

		scanError =
			action.kind === 'error'
				? {
						title: action.title,
						message: action.message,
						errorKind: action.errorKind,
						retryState: null
					}
				: null;
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
			clearScanError();
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
				setTransportError(LOADING_SCAN_TIMEOUT_MESSAGE, {
					mode: 'pending',
					dropAreaId
				});
				monitorTimedOutScanSettlement(retryPromise);
			} else {
				setTransportError(
					error instanceof Error ? error.message : 'The loading scan request failed.',
					{
						mode: 'pending',
						dropAreaId
					}
				);
				await focusScanInput();
			}
			return false;
		}
	}

	async function executeDirectScan(request: LoadingScanRequest) {
		if (!loadingScanController) {
			return;
		}

		workflowStores.setScannedText(request.scannedText);
		let shouldRefocusAfterScan = false;
		const scanPromise = loadingScanController.submitScan(request);

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
				setTransportError(LOADING_SCAN_TIMEOUT_MESSAGE, null);
				monitorTimedOutScanSettlement(scanPromise);
				shouldRefocusAfterScan = false;
			} else {
				setTransportError(
					error instanceof Error ? error.message : 'The loading scan request failed.',
					{
						mode: 'direct',
						request
					}
				);
				shouldRefocusAfterScan = true;
			}
		}

		if (shouldRefocusAfterScan) {
			await focusScanInput();
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
			clearScanError();
			scanPrompt = null;
			await focusScanInput();
			return;
		}

		isScanning = true;
		const request: LoadingScanRequest = {
			scannedText,
			department: loaderInfo.department,
			dropAreaId: currentDropArea?.dropAreaId ?? null,
			loadNumber: selectedDropDetail.loadNumber,
			loaderName: loaderInfo.loaderName
		};

		try {
			await executeDirectScan(request);
		} finally {
			isScanning = false;
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

		clearScanError();
		isLocationModalOpen = false;
		selectedDropIndex = moveLoadingDropSelection({
			selectedIndex: dropNavigation.selectedIndex,
			totalDrops: dropNavigation.totalDrops,
			direction
		});
	}

	async function handleLocationSelect(dropArea: NonNullable<WorkflowDropAreaSelection>) {
		workflowStores.setCurrentDropArea(dropArea);
		clearScanError();
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
		clearScanError();
		scanPrompt = null;
		isLocationModalOpen = false;
		await focusScanInput();
	}

	async function handleErrorDismiss() {
		if (scanError?.retryState?.mode === 'pending' || loadingScanController?.hasPendingScan()) {
			loadingScanController?.cancelPendingScan();
		}

		clearScanError();
		await focusScanInput();
	}

	async function handleErrorRetry() {
		if (!scanError?.retryState || isScanning || pendingTimedOutScan !== null) {
			return;
		}

		const retryState = scanError.retryState;
		clearScanError();
		scanPrompt = null;
		isScanning = true;

		try {
			if (retryState.mode === 'pending') {
				await retryPendingScanWithDropArea(retryState.dropAreaId);
			} else {
				await executeDirectScan(retryState.request);
			}
		} finally {
			isScanning = false;
		}

		await focusScanInput();
	}

</script>

<div class="space-y-6">
	{#if lifecycleError}
		<div class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
			<TriangleAlert class="mt-0.5 size-4 shrink-0" />
			<p>{lifecycleError}</p>
		</div>
	{/if}

	<div class="rounded-[2rem] bg-surface-container-low p-4 sm:p-6">
		{#if shouldRedirectHome}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Returning to Home...</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					Loading requires an active dropsheet handoff from the current session.
				</p>
			</div>
		{:else if loaderInfoState.error}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Unable to load the loader session.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					{getOperatorErrorMessage(
						loaderInfoState.error,
						'Unable to load the loader session.'
					)}
				</p>
			</div>
		{:else if loaderInfoState.loading || loaderInfo === null}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					Loading session details...
				</p>
			</div>
		{:else if dropDetailsState.error}
			<div class="rounded-[2rem] bg-white px-6 py-12 text-center shadow-sm">
				<p class="text-lg font-semibold text-slate-900">Unable to load the drop list.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					{getOperatorErrorMessage(dropDetailsState.error, 'Unable to load the drop list.')}
				</p>
			</div>
		{:else if dropDetailsState.loading && dropDetails.length === 0}
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
				<div class="space-y-4">
					<div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
						<div class="space-y-3">
							<LoadSummaryStrip
								testId="loading-summary-strip"
								driverName={loaderInfo.loaderName}
								loadNumber={loadNumber ?? '--'}
								dropWeight={loadingEntry?.dropWeight ?? null}
								customerName={selectedDropDetail.customerName}
								variant="loading"
							/>

							<div class="grid gap-2 sm:grid-cols-2" data-testid="loading-legacy-actions">
								<button
									type="button"
									aria-label="Order Status"
									data-testid="loading-order-status-button"
									onclick={() =>
										goto(
											resolve(
												`/(app)/order-status/[dropsheetId]?${buildLegacyActionSearchParams({
													loadNumber,
													dropWeight: loadingEntry?.dropWeight ?? null,
													driverName: selectedDropDetail.driverName?.trim() ?? null
												}).toString()}` as `/(app)/order-status/[dropsheetId]?${string}`,
												{
													dropsheetId: String(selectedDropDetail.dropSheetId)
												}
											)
										)
									}
									class="flex items-center justify-between gap-3 rounded-[1.5rem] bg-white px-4 py-3 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
								>
									<div class="flex min-w-0 items-center gap-2.5">
										<span class="flex size-9 items-center justify-center rounded-2xl bg-primary/5 text-primary">
											<ClipboardList class="size-4" />
										</span>
										<div class="min-w-0">
											<p class="text-sm font-bold tracking-tight text-slate-950">Order Status</p>
										</div>
									</div>
									<PenLine class="size-4 shrink-0 text-slate-400" />
								</button>

								<button
									type="button"
									aria-label="Dropsheet"
									data-testid="loading-dropsheet-button"
									onclick={() =>
										goto(
											resolve(
												`/(app)/move-orders/[dropsheetId]?${buildLegacyActionSearchParams({
													loadNumber,
													dropWeight: loadingEntry?.dropWeight ?? null,
													driverName: selectedDropDetail.driverName?.trim() ?? null
												}).toString()}` as `/(app)/move-orders/[dropsheetId]?${string}`,
												{
													dropsheetId: String(selectedDropDetail.dropSheetId)
												}
											)
										)
									}
									class="flex items-center justify-between gap-3 rounded-[1.5rem] bg-white px-4 py-3 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
								>
									<div class="flex min-w-0 items-center gap-2.5">
										<span class="flex size-9 items-center justify-center rounded-2xl bg-primary/5 text-primary">
											<Truck class="size-4" />
										</span>
										<div class="min-w-0">
											<p class="text-sm font-bold tracking-tight text-slate-950">Dropsheet</p>
										</div>
									</div>
									<PenLine class="size-4 shrink-0 text-slate-400" />
								</button>
							</div>
						</div>

						<div
							class="rounded-[1.75rem] bg-white p-3 shadow-[var(--shadow-soft)]"
							data-testid="loading-department-status-strip"
						>
							<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
								{#each departmentStatusEntries as entry (entry.testId)}
									<div class="min-w-0 space-y-2 text-center" data-testid={entry.testId}>
										<p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
											{entry.label}
										</p>
										<div
											class={`rounded-[1rem] px-2 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${entry.className}`}
										>
											{entry.value ?? '--'}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<section
						data-testid="loading-scan-section"
						class="flex min-h-[31rem] max-h-[calc(100dvh-12rem)] flex-col rounded-[2rem] bg-white p-3 shadow-sm sm:p-4"
					>
						<div class="shrink-0 space-y-3">
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
										class="h-14 w-full rounded-2xl border-none bg-surface-container-highest pl-14 pr-6 text-base transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
									/>
								</div>

								{#if scanError}
									<div
										class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-[0_12px_30px_-24px_rgba(190,24,93,0.48)]"
									>
										<TriangleAlert class="mt-0.5 size-4 shrink-0" />
										<div class="min-w-0 flex-1">
											<p class="font-semibold text-rose-800">{scanError.title}</p>
											<p class="mt-1">{scanError.message}</p>
											<div class="mt-3 flex flex-wrap gap-2">
												{#if scanError.retryState}
													<button
														type="button"
														class="inline-flex items-center justify-center rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
														disabled={isScanning || pendingTimedOutScan !== null}
														onclick={handleErrorRetry}
													>
														Retry scan
													</button>
												{/if}
												<button
													type="button"
													class="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
													disabled={isScanning || pendingTimedOutScan !== null}
													onclick={handleErrorDismiss}
												>
													Dismiss error
												</button>
											</div>
										</div>
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
						</div>

						<div class="mt-2.5 flex min-h-0 flex-1 flex-col rounded-[1.5rem] bg-surface-container-low p-2">
							{#if dropLabelsState.error}
								<div class="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
									{getOperatorErrorMessage(
										dropLabelsState.error,
										'Unable to load the drop labels.'
									)}
								</div>
							{:else if isLoadingDropLabels}
								<div class="flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									Loading label list...
								</div>
							{:else if isEmptyDrop}
								<div class="flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									No parts are attached to this drop yet.
								</div>
							{:else if isFullyScannedDrop}
								<div class="flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									All parts in this drop are scanned.
								</div>
							{:else}
								<div
									class="min-h-0 flex-1 overflow-y-auto pr-1"
									data-testid="loading-part-list-scroll"
								>
									<div
										class="grid gap-3 md:grid-cols-3"
										data-testid="loading-part-list-grid"
									>
										{#each unscannedDropLabels as label, index (getLoadingUnionKey(label, index))}
											<div class="rounded-[1.35rem] bg-white px-5 py-5 shadow-sm">
												<p class="text-base font-bold leading-7 tracking-tight text-slate-950">
													{label.partListId || '--'}
												</p>
											</div>
										{/each}
									</div>
								</div>
							{/if}
					</div>

					<div
						class="mt-4 shrink-0 rounded-[1.75rem] bg-surface-container-low p-2.5"
						data-testid="loading-active-drop-summary"
					>
						<h3 class="text-base font-bold tracking-tight text-slate-950" data-testid="loading-active-drop-title">
							Drop {dropNavigation.activeDropNumber} of {dropNavigation.totalDrops}
						</h3>

						<div class="mt-2.5 grid items-stretch gap-2 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
							<button
								type="button"
								aria-label="Previous drop"
								data-testid="loading-active-drop-previous"
								class="inline-flex h-16 w-16 self-center items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoPrevious}
								onclick={() => moveToDrop('previous')}
							>
								<ArrowLeft class="size-7" />
							</button>

							<div
								data-testid="loading-drop-stat-labels"
								class="ui-primary-gradient rounded-[1.25rem] px-3 py-2 text-white shadow-sm"
							>
								<p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/78">Labels</p>
								<p class="mt-1 text-lg font-bold tracking-tight text-white">
									{selectedDropDetail.labelCount}
								</p>
							</div>

							<div
								data-testid="loading-drop-stat-scanned"
								class="ui-primary-gradient rounded-[1.25rem] px-3 py-2 text-white shadow-sm"
							>
								<p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/78">Scanned</p>
								<p class="mt-1 text-lg font-bold tracking-tight text-white">
									{selectedDropDetail.scannedCount}
								</p>
							</div>

							<div
								data-testid="loading-drop-stat-need-pick"
								class="ui-primary-gradient rounded-[1.25rem] px-3 py-2 text-white shadow-sm"
							>
								<p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/78">Need pick</p>
								<p class="mt-1 text-lg font-bold tracking-tight text-white">
									{selectedDropDetail.needPickCount}
								</p>
							</div>

							<button
								type="button"
								aria-label="Next drop"
								data-testid="loading-active-drop-next"
								class="inline-flex h-16 w-16 self-center items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoNext}
								onclick={() => moveToDrop('next')}
							>
								<ArrowRight class="size-7" />
							</button>
						</div>
					</div>
				</section>
			</div>
		{/if}
	</div>

	{#if isLocationModalOpen && loaderInfo}
		<StagingLocationModal
			department={loaderInfo.department}
			mode="loading"
			target={activeTarget}
			onClose={handleLocationModalClose}
			onSelect={handleLocationSelect}
		/>
	{/if}
</div>
