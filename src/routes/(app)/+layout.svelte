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
		type WorkflowDropAreaSelection,
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
	let currentDropArea = $state<WorkflowDropAreaSelection>(get(workflowStores.currentDropArea));
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

			const locationLabel = currentDropArea?.dropAreaLabel?.trim();
			return locationLabel ? `${titleParts.join(' ')} - ${locationLabel}` : titleParts.join(' ');
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
		const unsubscribeDropArea = workflowStores.currentDropArea.subscribe((dropArea) => {
			currentDropArea = dropArea;
		});
		const unsubscribeLoadingHeader = workflowStores.currentLoadingHeaderContext.subscribe(
			(context) => {
				currentLoadingHeaderContext = context;
			}
		);

		return () => {
			unsubscribeLoader();
			unsubscribeDepartment();
			unsubscribeDropArea();
			unsubscribeLoadingHeader();
		};
	});

	$effect(() => {
		workflowStores.syncActiveTarget(data.activeTarget);
	});
</script>

<div class="ds-page-shell min-h-dvh text-foreground">
	{#if isHomeRoute}
		<div class="min-h-dvh">
			{@render children()}
		</div>
	{:else}
		<header class="ds-topbar fixed top-0 z-50 w-full">
			<div class="flex h-full w-full items-center justify-between px-6">
				<div class="flex items-center gap-4">
					<a
						href={resolve(backPath as any)}
						class="flex size-12 items-center justify-center rounded-[var(--ds-radius-control)] transition-colors hover:bg-ds-gray-100"
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
								class="inline-flex size-12 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-slate-600 transition hover:bg-ds-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
							class="flex size-9 items-center justify-center rounded-full bg-ds-blue-500 text-xs font-bold text-white"
						>
							{getUserInitials(data.displayName, data.userEmail)}
						</a>
					<form method="POST" action="/logout">
						<Button
							type="submit"
							variant="outline"
							size="sm"
							class="h-10 rounded-[var(--ds-radius-control)] border-transparent bg-red-50 px-4 text-sm font-semibold text-ds-red-500 hover:bg-red-100"
						>
							<LogOut class="size-4" />
							Sign out
						</Button>
					</form>
				</div>
			</div>
		</header>

		<main class="ds-page-content pt-[calc(var(--ds-topbar-height)+24px)] pb-6">
			{@render children()}
		</main>
	{/if}
</div>
