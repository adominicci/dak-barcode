<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		ArrowRight,
		LoaderCircle,
		PackageSearch,
		ScanBarcode,
		TriangleAlert
	} from '@lucide/svelte';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
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

	let redirectHandled = $state(false);
	let allowNavigation = $state(false);
	let isEndingSession = $state(false);
	let lifecycleError = $state<string | null>(null);
	let selectedDropIndex = $state(0);
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

		await tick();
		scanInputElement?.focus();
	}

	function clearScanInput() {
		scanInputValue = '';
		workflowStores.clearScannedText();
	}

	function clearScanError() {
		scanError = null;
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
	}

</script>

<div class="space-y-6">
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
				<LoadSummaryStrip
					testId="loading-summary-strip"
					driverName={loaderInfo.loaderName}
					loadNumber={loadNumber ?? '--'}
					dropWeight={loadingEntry?.dropWeight ?? null}
					customerName={selectedDropDetail.customerName}
					variant="loading"
				/>

				<section data-testid="loading-scan-section" class="rounded-[2rem] bg-white p-6 shadow-sm">
					<div class="space-y-4">
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

						<div class="rounded-[1.5rem] bg-surface-container-low p-3">
							{#if dropLabelsQuery?.error}
								<div class="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
									{dropLabelsQuery.error.message}
								</div>
							{:else if isLoadingDropLabels}
								<div class="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									Loading label list...
								</div>
							{:else if isEmptyDrop}
								<div class="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									No parts are attached to this drop yet.
								</div>
							{:else if isFullyScannedDrop}
								<div class="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-600">
									All parts in this drop are scanned.
								</div>
							{:else}
								<div
									class="max-h-[18rem] overflow-y-auto pr-1"
									data-testid="loading-part-list-scroll"
								>
									<div
										class="grid gap-3 md:grid-cols-3"
										data-testid="loading-part-list-grid"
									>
										{#each unscannedDropLabels as label, index (getLoadingUnionKey(label, index))}
											<div class="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
												<p class="text-sm font-semibold leading-6 text-slate-950">
													{label.partListId || '--'}
												</p>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>

					<div
						class="sticky bottom-0 mt-5 rounded-[1.75rem] bg-surface-container-low p-4"
						data-testid="loading-active-drop-summary"
					>
						<h3 class="text-2xl font-bold tracking-tight text-slate-950">
							Drop {dropNavigation.activeDropNumber} of {dropNavigation.totalDrops}
						</h3>

						<div class="mt-4 grid items-stretch gap-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
							<button
								type="button"
								aria-label="Previous drop"
								class="inline-flex size-14 self-center items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoPrevious}
								onclick={() => moveToDrop('previous')}
							>
								<ArrowLeft class="size-6" />
							</button>

							<div class="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
								<p class="ui-label text-xs">Labels</p>
								<p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
									{selectedDropDetail.labelCount}
								</p>
							</div>

							<div class="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
								<p class="ui-label text-xs">Scanned</p>
								<p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
									{selectedDropDetail.scannedCount}
								</p>
							</div>

							<div class="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
								<p class="ui-label text-xs">Need pick</p>
								<p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
									{selectedDropDetail.needPickCount}
								</p>
							</div>

							<button
								type="button"
								aria-label="Next drop"
								class="inline-flex size-14 self-center items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dropNavigation.canGoNext}
								onclick={() => moveToDrop('next')}
							>
								<ArrowRight class="size-6" />
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
			onClose={handleLocationModalClose}
			onSelect={handleLocationSelect}
		/>
	{/if}
</div>
