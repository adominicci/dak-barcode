<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		ClipboardList,
		LoaderCircle,
		PackageSearch,
		PenLine,
		Trash2,
		Truck,
		TriangleAlert,
		X
	} from '@lucide/svelte';
	import { onMount, settled } from 'svelte';
	import { get } from 'svelte/store';
	import { getOperatorErrorMessage } from '$lib/operator-error';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
	import DepartmentStatusPills from '$lib/components/workflow/department-status-pills.svelte';
	import DropCounterBar from '$lib/components/workflow/drop-counter-bar.svelte';
	import ScannedIdGrid from '$lib/components/workflow/scanned-id-grid.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import WorkflowScanField from '$lib/components/workflow/workflow-scan-field.svelte';
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
	import type { LoadingScanRequest, LoadViewDetail, LoadViewUnion, ScanResult } from '$lib/types';

	const LOADING_SCAN_TIMEOUT_MS = 8000;
	const LOADING_SCAN_TIMEOUT_MESSAGE = 'We could not process that scan right now.';
	const LOADING_SCAN_TIMING_STORAGE_KEY = 'dak.loadingScanTiming';
	const MAX_QUEUED_SCAN_TEXTS = 50;

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

	type LoadingScanIssue = {
		id: number;
		scannedText: string;
		title: string;
		message: string;
		createdAt: number;
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
	let queuedScanTexts = $state<string[]>([]);
	let inFlightScanText = $state<string | null>(null);
	let isDrainingQueuedScans = $state(false);
	let refreshedDropDetails = $state<LoadViewDetail[] | null>(null);
	let refreshedDropLabelsByKey = $state<Record<string, LoadViewUnion[]>>({});
	let pendingLocationScanText = $state<string | null>(null);
	let scanIssues = $state<LoadingScanIssue[]>([]);
	let isScanIssuesDrawerOpen = $state(false);
	let nextScanIssueId = 1;

	const loadingEntry = $derived(parseLoadingEntryContext(page.url));
	const hasWorkflowContext = hasLoadingWorkflowContext({
		selectedDepartment,
		currentLoader
	});
	const shouldRedirectHome = $derived(loadingEntry === null || !hasWorkflowContext);
	const activeLoadingLocationId = $derived(loadingEntry?.locationId ?? null);
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
	const dropDetails = $derived(refreshedDropDetails ?? dropDetailsState.current);
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
		if (!selectedDropDetail || activeLoadingLocationId === null) {
			return {
				current: [],
				error: null,
				loading: false,
				refresh: null
			};
		}

		const labelsKey = getDropLabelsQueryKey({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: activeLoadingLocationId
		});
		const refreshedDropLabels = refreshedDropLabelsByKey[labelsKey];
		if (refreshedDropLabels) {
			return {
				current: refreshedDropLabels,
				error: null,
				loading: false,
				refresh: null
			};
		}

		const query = getLoadViewUnion({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: activeLoadingLocationId
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
	const unscannedDropLabels = $derived(
		activeLoadingLocationId !== null
			? dropLabels.filter((label) => !label.scanned && label.locationId === activeLoadingLocationId)
			: []
	);
	const hasVisibleUnscannedDropLabels = $derived(unscannedDropLabels.length > 0);
	const unscannedPartListIds = $derived(
		unscannedDropLabels.map((label) => label.partListId || '--')
	);
	const isEmptyDrop = $derived(
		!isLoadingDropLabels &&
			selectedDropDetail !== null &&
			selectedDropDetail.labelCount === 0 &&
			!hasVisibleUnscannedDropLabels
	);
	const isFullyScannedDrop = $derived(
		!isLoadingDropLabels &&
			selectedDropDetail !== null &&
			selectedDropDetail.labelCount > 0 &&
			(selectedDropDetail.scannedCount >= selectedDropDetail.labelCount ||
				(dropLabels.length > 0 && unscannedDropLabels.length === 0))
	);
	const scanIssueCount = $derived(scanIssues.length);

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
				processScan: async (input) => {
					const mutationStartedAt = getLoadingScanTimestamp();
					try {
						return await processLoadingScan(input);
					} finally {
						logLoadingScanTiming('scan-mutation', mutationStartedAt, {
							scannedTextLength: input.scannedText.length,
							hasDropArea: input.dropAreaId !== null
						});
					}
				},
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
			pendingLocationScanText = null;
			clearScanIssues();
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
		clearScanIssues();

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

	function openScanIssuesDrawer() {
		isScanIssuesDrawerOpen = true;
	}

	function closeScanIssuesDrawer() {
		isScanIssuesDrawerOpen = false;
	}

	function addScanIssue(input: { scannedText: string; title: string; message: string }) {
		const scannedText = input.scannedText.trim();
		if (scannedText.length === 0) {
			return;
		}

		scanIssues = [
			...scanIssues,
			{
				id: nextScanIssueId,
				scannedText,
				title: input.title,
				message: input.message,
				createdAt: Date.now()
			}
		];
		nextScanIssueId += 1;
		isScanIssuesDrawerOpen = true;
	}

	function removeScanIssue(issueId: number) {
		scanIssues = scanIssues.filter((issue) => issue.id !== issueId);
	}

	function removeScanIssuesForBarcode(scannedText: string | null | undefined) {
		const normalizedScanText = scannedText?.trim();
		if (!normalizedScanText) {
			return;
		}

		scanIssues = scanIssues.filter((issue) => issue.scannedText !== normalizedScanText);
	}

	function clearScanIssues() {
		scanIssues = [];
		isScanIssuesDrawerOpen = false;
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
		clearQueuedScans();
		if (retryState?.mode === 'direct') {
			addScanIssue({
				scannedText: retryState.request.scannedText,
				title: 'Connection issue',
				message
			});
		}
		scanError = {
			title: 'Connection issue',
			message,
			errorKind: 'transport',
			retryState
		};
	}

	function getLoadingScanTimestamp() {
		return typeof performance !== 'undefined' && typeof performance.now === 'function'
			? performance.now()
			: Date.now();
	}

	function shouldLogLoadingScanTiming() {
		if (typeof window === 'undefined') {
			return false;
		}

		try {
			return window.localStorage.getItem(LOADING_SCAN_TIMING_STORAGE_KEY) === '1';
		} catch {
			return false;
		}
	}

	function logLoadingScanTiming(
		event: string,
		startedAt: number,
		details: Record<string, number | string | boolean | null> = {}
	) {
		if (!shouldLogLoadingScanTiming()) {
			return;
		}

		console.debug('[dak-loading-scan]', event, {
			durationMs: Math.round((getLoadingScanTimestamp() - startedAt) * 10) / 10,
			...details
		});
	}

	function clearQueuedScans() {
		queuedScanTexts = [];
	}

	function clearCombinedRefreshRows() {
		refreshedDropDetails = null;
		refreshedDropLabelsByKey = {};
	}

	function getDropLabelsQueryKey(input: {
		loadNumber: string;
		sequence: number;
		locationId: number;
	}) {
		return [input.loadNumber, input.sequence, input.locationId].join('|');
	}

	function isDuplicateQueuedScan(scannedText: string) {
		return inFlightScanText === scannedText || queuedScanTexts.includes(scannedText);
	}

	function enqueueScanText(scannedText: string) {
		if (isDuplicateQueuedScan(scannedText)) {
			return false;
		}

		if (queuedScanTexts.length >= MAX_QUEUED_SCAN_TEXTS) {
			addScanIssue({
				scannedText,
				title: 'Queue full',
				message: 'Queue is full. Wait briefly and rescan this barcode.'
			});
			return false;
		}

		queuedScanTexts = [...queuedScanTexts, scannedText];
		return true;
	}

	function buildCurrentLoadingScanRequest(scannedText: string): LoadingScanRequest | null {
		if (
			!loadingScanController ||
			!loaderInfo ||
			selectedDropDetail === null ||
			activeLoadingLocationId === null ||
			isLocationModalOpen ||
			pendingTimedOutScan !== null
		) {
			return null;
		}

		return {
			scannedText,
			department: loaderInfo.department,
			dropAreaId: currentDropArea?.dropAreaId ?? null,
			loadNumber: selectedDropDetail.loadNumber,
			loaderName: loaderInfo.loaderName,
			dropSheetId: selectedDropDetail.dropSheetId,
			locationId: activeLoadingLocationId,
			sequence: selectedDropDetail.sequence,
			selectedDropIndex: dropNavigation.selectedIndex
		};
	}

	async function refreshActiveDropData(result: ScanResult) {
		if (
			selectedDropDetail === null ||
			activeLoadingLocationId === null ||
			!dropDetailsState.refresh
		) {
			return;
		}

		const refreshStartedAt = getLoadingScanTimestamp();
		if (result.loadingRefresh) {
			refreshedDropDetails = result.loadingRefresh.dropDetails;
			refreshedDropLabelsByKey = {
				...refreshedDropLabelsByKey,
				[getDropLabelsQueryKey(result.loadingRefresh.dropLabelsKey)]:
					result.loadingRefresh.dropLabels
			};
			logLoadingScanTiming('combined-refresh', refreshStartedAt, {
				detailRows: result.loadingRefresh.dropDetails.length,
				unionRows: result.loadingRefresh.dropLabels.length
			});
			return;
		}

		clearCombinedRefreshRows();
		const activeUnionQuery = getLoadViewUnion({
			loadNumber: selectedDropDetail.loadNumber,
			sequence: selectedDropDetail.sequence,
			locationId: activeLoadingLocationId
		});

		const detailRefreshStartedAt = getLoadingScanTimestamp();
		const detailRefresh = (async () => {
			try {
				await dropDetailsState.refresh?.();
			} finally {
				logLoadingScanTiming('detail-refresh', detailRefreshStartedAt, {
					dropSheetId: selectedDropDetail.dropSheetId,
					locationId: activeLoadingLocationId
				});
			}
		})();
		const unionRefreshStartedAt = getLoadingScanTimestamp();
		const unionRefresh = (async () => {
			try {
				await activeUnionQuery.refresh();
			} finally {
				logLoadingScanTiming('union-refresh', unionRefreshStartedAt, {
					loadNumber: selectedDropDetail.loadNumber,
					sequence: selectedDropDetail.sequence,
					locationId: activeLoadingLocationId
				});
			}
		})();

		try {
			await Promise.all([detailRefresh, unionRefresh]);
		} finally {
			logLoadingScanTiming('post-scan-refresh', refreshStartedAt, {
				queuedCount: queuedScanTexts.length
			});
		}
	}

	async function applyScanAction(
		action: ReturnType<NonNullable<typeof loadingScanController>['submitScan']> extends Promise<infer T>
			? T
			: never,
		scannedText: string | null = null
	) {
		if (!action) {
			await focusScanInput();
			return;
		}

		if (action.kind === 'needs-location') {
			pendingLocationScanText = scannedText;
		} else if (action.kind === 'success') {
			pendingLocationScanText = null;
		}

		if (action.kind === 'error') {
			if (action.errorKind === 'business') {
				addScanIssue({
					scannedText: scannedText ?? pendingLocationScanText ?? inFlightScanText ?? '',
					title: action.title,
					message: action.message
				});
				pendingLocationScanText = null;
				scanError = null;
			} else {
				scanError = {
					title: action.title,
					message: action.message,
					errorKind: action.errorKind,
					retryState: null
				};
			}
		} else {
			scanError = null;
		}
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
			removeScanIssuesForBarcode(scannedText);
		}

		if (!isScanning && pendingTimedOutScan === null) {
			await focusScanInput();
		}
	}

	function monitorTimedOutScanSettlement(
		scanPromise: ReturnType<NonNullable<typeof loadingScanController>['submitScan']>,
		scannedText: string | null = null
	) {
		pendingTimedOutScan = (async () => {
			try {
				const action = await scanPromise;
				await applyScanAction(action, scannedText);

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
		if (
			!loadingScanController ||
			!loaderInfo ||
			selectedDropDetail === null ||
			activeLoadingLocationId === null
		) {
			return false;
		}

		const retryPromise = loadingScanController.retryPendingScan({
			department: loaderInfo.department,
			dropAreaId,
			loadNumber: selectedDropDetail.loadNumber,
			loaderName: loaderInfo.loaderName,
			dropSheetId: selectedDropDetail.dropSheetId,
			locationId: activeLoadingLocationId,
			sequence: selectedDropDetail.sequence,
			selectedDropIndex: dropNavigation.selectedIndex
		});

		try {
			const action = await withTimeout(
				retryPromise,
				LOADING_SCAN_TIMEOUT_MS,
				LOADING_SCAN_TIMEOUT_MESSAGE
			);
			if (action) {
				await applyScanAction(action, pendingLocationScanText);
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
			await applyScanAction(action, request.scannedText);
			shouldRefocusAfterScan = true;

			if (action?.kind === 'location-updated' && loadingScanController.hasPendingScan()) {
				shouldRefocusAfterScan = !(await retryPendingScanWithDropArea(action.dropArea.dropAreaId));
			}
		} catch (error) {
			scanPrompt = null;

			if (error instanceof Error && error.message === LOADING_SCAN_TIMEOUT_MESSAGE) {
				setTransportError(LOADING_SCAN_TIMEOUT_MESSAGE, null);
				monitorTimedOutScanSettlement(scanPromise, request.scannedText);
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

	async function processScanText(scannedText: string) {
		const request = buildCurrentLoadingScanRequest(scannedText);
		if (!request) {
			await focusScanInput();
			return false;
		}

		const busyStartedAt = getLoadingScanTimestamp();
		isScanning = true;
		inFlightScanText = scannedText;

		try {
			await executeDirectScan(request);
			return true;
		} finally {
			inFlightScanText = null;
			isScanning = false;
			logLoadingScanTiming('scanner-busy', busyStartedAt, {
				queuedCount: queuedScanTexts.length
			});
		}
	}

	async function drainQueuedScans() {
		if (isDrainingQueuedScans) {
			return;
		}

		isDrainingQueuedScans = true;

		try {
			await settled();

			while (
				queuedScanTexts.length > 0 &&
				!isScanning &&
				!isLocationModalOpen &&
				pendingTimedOutScan === null
			) {
				const [nextScanText, ...remainingScanTexts] = queuedScanTexts;
				queuedScanTexts = remainingScanTexts;

				const processed = await processScanText(nextScanText);
				await settled();

				if (!processed || isLocationModalOpen || pendingTimedOutScan !== null) {
					break;
				}
			}
		} finally {
			isDrainingQueuedScans = false;
		}
	}

	async function submitScan(rawValue: string) {
		const scannedText = rawValue.trim();
		clearScanInput();

		if (scannedText.length === 0) {
			clearScanError();
			scanPrompt = null;
			await focusScanInput();
			return;
		}

		if (!loadingScanController || !loaderInfo || selectedDropDetail === null) {
			await focusScanInput();
			return;
		}

		if (isScanning) {
			enqueueScanText(scannedText);
			await focusScanInput();
			return;
		}

		if (isLocationModalOpen || pendingTimedOutScan !== null) {
			await focusScanInput();
			return;
		}

		await processScanText(scannedText);
		await drainQueuedScans();
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

		clearQueuedScans();
		clearScanError();
		pendingLocationScanText = null;
		isLocationModalOpen = false;
		clearCombinedRefreshRows();
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
		await drainQueuedScans();
	}

	async function handleLocationModalClose() {
		loadingScanController?.cancelPendingScan();
		clearQueuedScans();
		clearScanError();
		pendingLocationScanText = null;
		scanPrompt = null;
		isLocationModalOpen = false;
		await focusScanInput();
	}

	async function handleErrorDismiss() {
		if (scanError?.retryState?.mode === 'pending' || loadingScanController?.hasPendingScan()) {
			loadingScanController?.cancelPendingScan();
			pendingLocationScanText = null;
		}

		clearQueuedScans();
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
		await drainQueuedScans();
	}

</script>

<div class="space-y-3">
	{#if lifecycleError}
		<div class="flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700">
			<TriangleAlert class="mt-0.5 size-4 shrink-0" />
			<p>{lifecycleError}</p>
		</div>
	{/if}

	<div>
		{#if shouldRedirectHome}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<p class="text-lg font-semibold text-slate-900">Returning to Home...</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					Loading requires an active dropsheet handoff from the current session.
				</p>
			</div>
		{:else if loaderInfoState.error}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<p class="text-lg font-semibold text-slate-900">Unable to load the loader session.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					{getOperatorErrorMessage(
						loaderInfoState.error,
						'Unable to load the loader session.'
					)}
				</p>
			</div>
		{:else if loaderInfoState.loading || loaderInfo === null}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					Loading session details...
				</p>
			</div>
		{:else if dropDetailsState.error}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<p class="text-lg font-semibold text-slate-900">Unable to load the drop list.</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					{getOperatorErrorMessage(dropDetailsState.error, 'Unable to load the drop list.')}
				</p>
			</div>
		{:else if dropDetailsState.loading && dropDetails.length === 0}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					Loading drop navigation...
				</p>
			</div>
		{:else if selectedDropDetail === null}
			<div class="rounded-[var(--ds-radius-card)] bg-white px-6 py-12 text-center">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<PackageSearch class="size-8" />
				</div>
				<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
					No drops are ready for this loading session.
				</p>
			</div>
		{:else}
			<div
				class="ds-operational-panel flex h-[calc(100dvh-6.5rem)] flex-col overflow-hidden p-3"
				data-testid="loading-workflow-panel"
			>
				<div
					class="grid shrink-0 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]"
					data-testid="loading-context-grid"
				>
					<div class="space-y-1.5">
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
								class="ds-control flex min-h-11 items-center justify-between gap-2.5 px-3 py-1.5 text-left transition hover:bg-ds-blue-50"
							>
								<div class="flex min-w-0 items-center gap-2.5">
									<span class="flex size-8 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-blue-50 text-ds-blue-500">
										<ClipboardList class="size-4" />
									</span>
									<div class="min-w-0">
										<p class="text-sm font-semibold text-ds-gray-900">Order Status</p>
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
								class="ds-control flex min-h-11 items-center justify-between gap-2.5 px-3 py-1.5 text-left transition hover:bg-ds-blue-50"
							>
								<div class="flex min-w-0 items-center gap-2.5">
									<span class="flex size-8 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-blue-50 text-ds-blue-500">
										<Truck class="size-4" />
									</span>
									<div class="min-w-0">
										<p class="text-sm font-semibold text-ds-gray-900">Dropsheet</p>
									</div>
								</div>
								<PenLine class="size-4 shrink-0 text-slate-400" />
							</button>
						</div>
					</div>

					<div class="p-0 lg:pt-1" data-testid="loading-department-status-strip">
						<DepartmentStatusPills entries={departmentStatusEntries} testId="loading-department-status" />
					</div>
				</div>

				<section
					data-testid="loading-scan-section"
					class="flex min-h-0 flex-1 flex-col"
				>
					<div class="shrink-0 space-y-1.5">
						<div class="space-y-1.5">
							<div
								data-testid="loading-queue-status"
								class="flex flex-wrap items-center justify-between gap-2 rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-white px-3 py-1.5 text-sm shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)]"
							>
								<div class="flex flex-wrap items-center gap-2.5">
									<span
										class={[
											'inline-flex min-h-8 items-center rounded-[var(--ds-radius-control)] px-3 text-xs font-bold uppercase tracking-[0.08em]',
											isScanning
												? 'bg-ds-blue-50 text-ds-blue-600'
												: 'bg-emerald-50 text-emerald-700'
										]}
									>
										{isScanning ? 'Processing' : 'Ready'}
									</span>
									<span class="font-semibold text-ds-gray-900">
										Queued {queuedScanTexts.length}/{MAX_QUEUED_SCAN_TEXTS}
									</span>
								</div>

								<button
									type="button"
									class={[
										'inline-flex min-h-9 items-center justify-center rounded-[var(--ds-radius-control)] px-3 text-sm font-bold transition',
										scanIssueCount > 0
											? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100'
											: 'bg-ds-gray-100 text-ds-gray-600 hover:bg-ds-blue-50 hover:text-ds-blue-600'
									]}
									aria-label={`Open scan issues (${scanIssueCount})`}
									onclick={openScanIssuesDrawer}
								>
									Issues {scanIssueCount}
								</button>
							</div>

							<WorkflowScanField
								id="loading-scan-input"
								label="Scan Barcode"
								bind:value={scanInputValue}
								placeholder={currentDropArea?.dropAreaLabel
									? 'Scan or type loading barcode...'
									: 'Scan a driver location or loading barcode...'}
								disabled={pendingTimedOutScan !== null || isLocationModalOpen}
								onKeydown={handleScanKeydown}
								onInputElement={(element) => {
									scanInputElement = element;
								}}
								testId="loading-scan"
							/>

								{#if scanError}
									<div
										class="flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[0_12px_30px_-24px_rgba(190,24,93,0.48)]"
									>
										<TriangleAlert class="mt-0.5 size-4 shrink-0" />
										<div class="min-w-0 flex-1">
											<p class="font-semibold text-rose-800">{scanError.title}</p>
											<p class="mt-1">{scanError.message}</p>
											<div class="mt-3 flex flex-wrap gap-2">
												{#if scanError.retryState}
													<button
														type="button"
														class="inline-flex items-center justify-center rounded-[var(--ds-radius-control)] bg-rose-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
														disabled={isScanning || pendingTimedOutScan !== null}
														onclick={handleErrorRetry}
													>
														Retry scan
													</button>
												{/if}
												<button
													type="button"
													class="inline-flex items-center justify-center rounded-[var(--ds-radius-control)] bg-white px-4 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
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
										class="flex gap-3 rounded-[var(--ds-radius-card)] bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-[0_12px_30px_-24px_rgba(180,83,9,0.42)]"
									>
										<TriangleAlert class="mt-0.5 size-4 shrink-0" />
										<p>{scanPrompt}</p>
									</div>
								{/if}
							</div>
						</div>

						<div
							class="mt-1.5 flex min-h-0 flex-1 flex-col rounded-[var(--ds-radius-card)] bg-ds-gray-100 p-2"
							data-testid="loading-part-list-shell"
						>
							{#if dropLabelsState.error}
								<div class="rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700">
									{getOperatorErrorMessage(
										dropLabelsState.error,
										'Unable to load the drop labels.'
									)}
								</div>
							{:else if isLoadingDropLabels}
								<div class="flex flex-1 items-center justify-center rounded-[var(--ds-radius-card)] bg-white px-4 py-8 text-center text-sm text-slate-600">
									Loading label list...
								</div>
							{:else if isEmptyDrop}
								<div class="flex flex-1 items-center justify-center rounded-[var(--ds-radius-card)] bg-white px-4 py-8 text-center text-sm text-slate-600">
									No items are attached to this drop yet.
								</div>
							{:else if isFullyScannedDrop}
								<div class="flex flex-1 items-center justify-center rounded-[var(--ds-radius-card)] bg-white px-4 py-8 text-center text-sm text-slate-600">
									All items in this drop are scanned.
								</div>
							{:else}
								<div
									class="min-h-0 flex-1 overflow-y-auto pr-1"
									data-testid="loading-part-list-scroll"
								>
									<ScannedIdGrid items={unscannedPartListIds} testId="loading-part-list-grid" />
								</div>
							{/if}
						</div>

						<div
							class="mt-auto shrink-0 bg-white pt-2"
							data-testid="loading-counter-dock"
						>
							<DropCounterBar
								activeDropNumber={dropNavigation.activeDropNumber}
								totalDrops={dropNavigation.totalDrops}
								labels={selectedDropDetail.labelCount}
								scanned={selectedDropDetail.scannedCount}
								needPick={selectedDropDetail.needPickCount}
								canGoPrevious={dropNavigation.canGoPrevious}
								canGoNext={dropNavigation.canGoNext}
								onPrevious={() => moveToDrop('previous')}
								onNext={() => moveToDrop('next')}
								testId="loading-active-drop-summary"
								previousTestId="loading-active-drop-previous"
								nextTestId="loading-active-drop-next"
								statTestIdBase="loading-drop-stat"
							/>
						</div>
				</section>
			</div>
		{/if}
	</div>

	{#if isScanIssuesDrawerOpen}
		<aside
			data-testid="loading-scan-issues-drawer"
			class="fixed right-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-full max-w-[28rem] flex-col border-l border-rose-100 bg-white shadow-[-20px_0_60px_-36px_rgba(15,23,42,0.6)]"
			aria-labelledby="loading-scan-issues-title"
		>
			<div class="flex items-start justify-between gap-4 border-b border-ds-gray-300 px-5 py-4">
				<div class="min-w-0">
					<p class="ui-label">Scan Issues</p>
					<h2 id="loading-scan-issues-title" class="mt-1 text-xl font-bold text-ds-gray-900">
						Needs attention
					</h2>
					<p class="mt-1 text-sm text-ds-gray-600">
						{scanIssueCount} {scanIssueCount === 1 ? 'barcode' : 'barcodes'} to review
					</p>
				</div>
				<button
					type="button"
					class="inline-flex size-14 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-ds-gray-600 transition hover:bg-ds-blue-50 hover:text-ds-blue-600"
					aria-label="Close scan issues"
					onclick={closeScanIssuesDrawer}
				>
					<X class="size-7" />
				</button>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto bg-ds-gray-100 p-4">
				{#if scanIssues.length === 0}
					<div
						class="flex min-h-64 flex-col items-center justify-center rounded-[var(--ds-radius-card)] bg-white px-6 py-10 text-center text-ds-gray-600"
					>
						<TriangleAlert class="size-9 text-ds-blue-500" />
						<p class="mt-4 text-base font-semibold text-ds-gray-900">No scan issues</p>
						<p class="mt-1 text-sm">Failed scans will stay here until they are cleared.</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each scanIssues as issue (issue.id)}
							<article
								class="rounded-[var(--ds-radius-card)] border border-rose-100 bg-white p-3 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)]"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="font-mono text-base font-bold text-ds-gray-900">
											{issue.scannedText}
										</p>
										<p class="mt-2 text-sm font-semibold text-rose-700">{issue.message}</p>
									</div>
									<button
										type="button"
										class="inline-flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-rose-50 text-rose-700 transition hover:bg-rose-100"
										aria-label={`Clear issue for ${issue.scannedText}`}
										onclick={() => removeScanIssue(issue.id)}
									>
										<Trash2 class="size-5" />
									</button>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</div>
		</aside>
	{/if}

	{#if isLocationModalOpen && loaderInfo}
		<StagingLocationModal
			department={loaderInfo.department}
			driverLocationOnly
			mode="loading"
			target={activeTarget}
			onClose={handleLocationModalClose}
			onSelect={handleLocationSelect}
		/>
	{/if}
</div>
