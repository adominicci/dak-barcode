<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Clock3, ClipboardList, LoaderCircle, ScanBarcode, TriangleAlert, UserRound } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { getLoaderInfo, endLoaderSession } from '$lib/loader-session.remote';
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

	const selectedDepartment = get(workflowStores.selectedDepartment);
	const currentLoader = get(workflowStores.currentLoader);

	let redirectHandled = $state(false);
	let allowNavigation = $state(false);
	let isEndingSession = $state(false);
	let lifecycleError = $state<string | null>(null);

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

	onMount(() => {
		if (redirectHandled || !shouldRedirectHome) {
			return;
		}

		redirectHandled = true;
		allowNavigation = true;
		void goto('/home', { replaceState: true });
	});

	beforeNavigate((navigation) => {
		if (
			allowNavigation ||
			navigation.willUnload ||
			navigation.to?.url.pathname === '/loading' ||
			isEndingSession ||
			loadingEntry === null ||
			loaderInfo === null
		) {
			return;
		}

		const endInput = buildEndLoaderSessionInput(loaderInfo, new Date().toISOString());
		const destinationHref = navigation.to ? toNavigationHref(navigation.to.url) : null;

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
				await goto(destinationHref, { replaceState: true });
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
</script>

<div class="space-y-8">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-slate-950">Loading</h2>
			<p class="mt-2 text-sm text-on-surface-variant">
				Loader session context is resolved before live scan controls come online.
			</p>
		</div>

		{#if loadingEntry}
			<div class="grid gap-3 sm:grid-cols-2">
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
		{:else}
			<div class="space-y-6">
				<div class="rounded-[2rem] bg-white p-6 shadow-sm">
					<div class="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
						<div class="space-y-5">
							<div class="flex items-center gap-3">
								<div class="flex size-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
									<ClipboardList class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Session</p>
									<h3 class="text-2xl font-bold tracking-tight text-slate-950">
										{loaderInfo.department}
									</h3>
								</div>
							</div>

							<div class="grid gap-3 sm:grid-cols-2">
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Loader</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{loaderInfo.loaderName}
									</p>
								</div>
								<div class="rounded-2xl bg-surface-container-low px-4 py-4">
									<p class="ui-label text-xs">Session ID</p>
									<p class="mt-2 text-xl font-bold tracking-tight text-slate-950">
										{loaderInfo.id}
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
									<p class="ui-label text-xs">Dropsheet</p>
									<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
										{loaderInfo.dropSheetId}
									</p>
								</div>
								<div class="rounded-2xl bg-white px-4 py-4 shadow-sm">
									<p class="ui-label text-xs">Driver location</p>
									<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
										{loadingEntry?.locationId}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="rounded-[2rem] bg-white p-6 shadow-sm">
					<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div class="space-y-2">
							<p class="ui-label text-xs">Scanner lane</p>
							<h3 class="text-xl font-bold tracking-tight text-slate-950">Reserved for live scan workflow</h3>
							<p class="text-sm leading-6 text-slate-600">
								The scanner surface stays staged here for the next milestone, using the same fast handoff model as Staging.
							</p>
						</div>

						<div class="flex min-w-[16rem] items-center gap-3 rounded-[1.5rem] bg-surface-container-low px-4 py-4">
							<div class="flex size-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
								<ScanBarcode class="size-5" />
							</div>
							<div>
								<p class="text-sm font-semibold text-slate-900">Scanner-ready shell</p>
								<p class="text-xs text-slate-600">
									{isEndingSession ? 'Ending loader session before exit...' : 'Input, list refresh, and scan states arrive in DAK-206/207.'}
								</p>
							</div>
						</div>
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
						<p class="ui-label text-xs">Current loader</p>
						<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
							{currentLoader?.loaderName}
						</p>
					</div>
					<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
						<p class="ui-label text-xs">Entry route</p>
						<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">Select Category</p>
					</div>
					<div class="rounded-[1.75rem] bg-white p-5 shadow-sm">
						<p class="ui-label text-xs">Exit handling</p>
						<p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
							Back/Home guarded
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
