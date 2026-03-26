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
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { getLoadViewDetailAll, getLoadViewUnion } from '$lib/load-view.remote';
	import { getLoaderInfo, endLoaderSession } from '$lib/loader-session.remote';
	import {
		createLoadingDropNavigationState,
		moveLoadingDropSelection
	} from '$lib/workflow/loading-drop-navigation';
	import {
		buildEndLoaderSessionInput,
		hasLoadingWorkflowContext,
		parseLoadingEntryContext,
		toNavigationHref
	} from '$lib/workflow/loading-lifecycle';
	import { workflowStores } from '$lib/workflow/stores';

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

	const selectedDepartment = get(workflowStores.selectedDepartment);
	const currentLoader = get(workflowStores.currentLoader);

	let redirectHandled = $state(false);
	let allowNavigation = $state(false);
	let isEndingSession = $state(false);
	let lifecycleError = $state<string | null>(null);
	let selectedDropIndex = $state(0);

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
	const soNumbers = $derived(
		Array.from(
			new Set(
				dropLabels
					.map((label) => label.orderSoNumber.trim())
					.filter((orderSoNumber) => orderSoNumber.length > 0)
			)
		)
	);

	onMount(() => {
		if (redirectHandled || !shouldRedirectHome) {
			return;
		}

		redirectHandled = true;
		allowNavigation = true;
		void goto(resolve('/home'), { replaceState: true });
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

	function moveToDrop(direction: 'previous' | 'next') {
		selectedDropIndex = moveLoadingDropSelection({
			selectedIndex: dropNavigation.selectedIndex,
			totalDrops: dropNavigation.totalDrops,
			direction
		});
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
				Drop navigation and per-drop label detail are ready. Live scan submission stays queued for the next milestone.
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
								<div class="rounded-2xl bg-white px-4 py-4 shadow-sm">
									<p class="ui-label text-xs">Need pick</p>
									<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
										{selectedDropDetail.needPickCount}
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
								<p class="text-sm font-semibold text-slate-900">Scanner-ready shell</p>
								<p class="text-xs text-slate-600">
									{isEndingSession ? 'Ending loader session before exit...' : 'Input and submission arrive in DAK-207 and later loading issues.'}
								</p>
							</div>
						</div>
					</div>

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

					{#if dropLabelsQuery?.error}
						<div class="mt-6 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
							{dropLabelsQuery.error.message}
						</div>
					{:else if dropLabelsQuery?.loading && dropLabels.length === 0}
						<div class="mt-6 rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-slate-600">
							Loading label list...
						</div>
					{:else if dropLabels.length === 0}
						<div class="mt-6 rounded-2xl bg-surface-container-low px-4 py-8 text-center text-sm text-slate-600">
							No labels are attached to this drop yet.
						</div>
					{:else}
						<div class="mt-6 grid gap-3">
							{#each dropLabels as label (`${label.partListId}-${label.labelNumber}`)}
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
</div>
