<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ArrowLeft, LogOut, RefreshCw } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import TargetBadge from '$lib/components/workflow/target-badge.svelte';
	import { parseLegacyDriverName, parseLegacyReturnTo } from '$lib/workflow/legacy-page-params';
	import { parsePositiveNumber } from '$lib/workflow/loading-lifecycle';
	import {
		workflowStores,
		type WorkflowDepartment,
		type WorkflowLoadingHeaderContext,
		type WorkflowLoaderSelection
	} from '$lib/workflow/stores';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const isHomeRoute = $derived(page.url.pathname === '/home');
	const isLoadingRoute = $derived(page.url.pathname === '/loading');
	let currentLoader = $state<WorkflowLoaderSelection>(get(workflowStores.currentLoader));
	let selectedDepartment = $state<WorkflowDepartment>(get(workflowStores.selectedDepartment));
	let currentLoadingHeaderContext = $state<WorkflowLoadingHeaderContext>(
		get(workflowStores.currentLoadingHeaderContext)
	);
	let isRefreshingLoadingHeader = $state(false);

	function getBackHref(pathname: string, searchParams: URLSearchParams): string {
		const returnTo = parseLegacyReturnTo(searchParams.get('returnTo'));

		if (pathname.startsWith('/select-category')) {
			return returnTo ?? '/dropsheets';
		}

		if (
			pathname.startsWith('/loading') ||
			pathname.startsWith('/order-status') ||
			pathname.startsWith('/move-orders') ||
			pathname === '/account' ||
			pathname === '/location' ||
			pathname === '/loaders' ||
			pathname === '/staging' ||
			pathname === '/dropsheets'
		) {
			return returnTo ?? '/home';
		}

		return '/home';
	}

	function getAccountHref(pathname: string, search: string): string {
		if (pathname === '/account') {
			return '/account';
		}

		const searchParams = new URLSearchParams({
			returnTo: `${pathname}${search}`
		});

		return `/account?${searchParams.toString()}`;
	}

	function getAppHeaderTitle(pathname: string): string {
		if (pathname === '/dropsheets') {
			return 'Dropsheets';
		}

		if (pathname.startsWith('/select-category')) {
			return 'Select Category';
		}

		if (pathname.startsWith('/order-status')) {
			return 'Order Status';
		}

		if (pathname.startsWith('/move-orders')) {
			return 'Dropsheet';
		}

		if (pathname === '/loaders') {
			return 'Add Loader';
		}

		if (pathname === '/staging') {
			return 'Staging';
		}

		if (pathname === '/loading') {
			const titleParts = ['Loading'];

			if (selectedDepartment) {
				titleParts.push(selectedDepartment);
			}

			const loaderName = currentLoader?.loaderName?.trim();
			if (loaderName) {
				titleParts.push(loaderName);
			}

			return titleParts.join(' ');
		}

		if (pathname === '/account') {
			return 'Account';
		}

		if (pathname === '/location') {
			return 'Target';
		}

		return 'Stage & Load';
	}

	const backPath = $derived(getBackHref(page.url.pathname, page.url.searchParams));
	const accountPath = $derived(getAccountHref(page.url.pathname, page.url.search));
	const appHeaderTitle = $derived(getAppHeaderTitle(page.url.pathname));
	const loadingHeaderMeta = $derived.by(() => {
		if (!isLoadingRoute) {
			return null;
		}

		const parts: string[] = [];
		const driverName =
			currentLoadingHeaderContext?.driverName?.trim() ||
			parseLegacyDriverName(page.url.searchParams.get('driverName'));
		const dropWeight =
			currentLoadingHeaderContext?.dropWeight ??
			parsePositiveNumber(page.url.searchParams.get('dropWeight'));

		if (driverName) {
			parts.push(driverName);
		}

		if (dropWeight !== null) {
			parts.push(`${dropWeight} lbs`);
		}

		// Match the legacy FlutterFlow header format exactly.
		return parts.length > 0 ? parts.join('-') : null;
	});

	function getUserInitials(displayName: string | null | undefined, userEmail: string | null | undefined) {
		const source = displayName?.trim() || userEmail?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'DU';
		const parts = source.split(/\s+/).filter(Boolean);
		return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'DU';
	}

	async function handleLoadingHeaderRefresh() {
		if (isRefreshingLoadingHeader) {
			return;
		}

		isRefreshingLoadingHeader = true;

		try {
			await invalidateAll();
		} finally {
			isRefreshingLoadingHeader = false;
		}
	}

	onMount(() => {
		const unsubscribeLoader = workflowStores.currentLoader.subscribe((loader) => {
			currentLoader = loader;
		});
		const unsubscribeDepartment = workflowStores.selectedDepartment.subscribe((department) => {
			selectedDepartment = department;
		});
		const unsubscribeLoadingHeader = workflowStores.currentLoadingHeaderContext.subscribe(
			(context) => {
				currentLoadingHeaderContext = context;
			}
		);

		return () => {
			unsubscribeLoader();
			unsubscribeDepartment();
			unsubscribeLoadingHeader();
		};
	});

	$effect(() => {
		workflowStores.syncActiveTarget(data.activeTarget);
	});
</script>

<div class="ui-page min-h-dvh text-foreground">
	{#if isHomeRoute}
		<div class="min-h-dvh">
			{@render children()}
		</div>
	{:else}
		<header class="glass-header fixed top-0 w-full z-50 shadow-sm border-b border-slate-100">
			<div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
				<div class="flex items-center gap-4">
					<a
						href={resolve(backPath as any)}
						class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
						aria-label="Back"
					>
						<ArrowLeft class="size-5 text-slate-700" />
					</a>
					<h1 class="text-xl font-bold text-slate-900 tracking-tight" data-testid="app-header-title">
						{appHeaderTitle}
					</h1>
				</div>
				<div class="flex items-center gap-4">
					{#if isLoadingRoute}
						<div class="hidden items-center gap-3 md:flex">
							{#if loadingHeaderMeta}
								<p
									class="text-sm font-semibold tracking-tight text-slate-700"
									data-testid="loading-route-header-meta"
								>
									{loadingHeaderMeta}
								</p>
							{/if}
							<button
								type="button"
								class="inline-flex size-10 items-center justify-center rounded-full bg-surface-container-low text-slate-600 transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
								aria-label="Refresh loading header"
								disabled={isRefreshingLoadingHeader}
								onclick={handleLoadingHeaderRefresh}
							>
								<RefreshCw class={`size-4 ${isRefreshingLoadingHeader ? 'animate-spin' : ''}`} />
							</button>
						</div>
					{/if}
						<TargetBadge target={data.activeTarget} wrapperClass="hidden md:flex" />
						<a
							href={resolve(accountPath as any)}
							class="w-10 h-10 rounded-full industrial-gradient flex items-center justify-center text-xs font-bold text-white shadow-md"
						>
							{getUserInitials(data.displayName, data.userEmail)}
						</a>
					<form method="POST" action="/logout">
						<Button
							type="submit"
							variant="outline"
							size="sm"
							class="h-10 rounded-full border-transparent bg-[rgba(139,36,54,0.08)] px-4 text-sm font-semibold text-[#8b2436] hover:bg-[rgba(139,36,54,0.14)]"
						>
							<LogOut class="size-4" />
							Sign out
						</Button>
					</form>
				</div>
			</div>
		</header>

		<main class="pt-24 pb-12 px-6 max-w-7xl mx-auto">
			{@render children()}
		</main>
	{/if}
</div>
