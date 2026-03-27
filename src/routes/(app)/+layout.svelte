<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ArrowLeft, LogOut, MapPin } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { workflowStores } from '$lib/workflow/stores';
	import type { LayoutProps } from './$types';

let { children, data }: LayoutProps = $props();
const isHomeRoute = $derived(page.url.pathname === '/home');

function getBackHref(pathname: string, searchParams: URLSearchParams): string {
	if (pathname.startsWith('/select-category')) {
		return '/dropsheets';
	}

	if (pathname.startsWith('/order-status') || pathname.startsWith('/move-orders')) {
		return searchParams.get('returnTo') ?? '/home';
	}

	return '/home';
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
		return 'Loading';
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
const appHeaderTitle = $derived(getAppHeaderTitle(page.url.pathname));

	function getUserInitials(displayName: string | null | undefined, userEmail: string | null | undefined) {
		const source = displayName?.trim() || userEmail?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'DU';
		const parts = source.split(/\s+/).filter(Boolean);
		return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'DU';
	}

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
						href={backPath}
						class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
						aria-label="Back"
					>
						<ArrowLeft class="size-5 text-slate-700" />
					</a>
					<h1 class="text-xl font-bold text-slate-900 tracking-tight">{appHeaderTitle}</h1>
				</div>
				<div class="flex items-center gap-4">
					<div class="hidden md:flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
						<MapPin class="size-4 text-primary" />
						<span class="text-sm font-semibold text-slate-900">
							{data.activeTarget ?? 'Target required'}
						</span>
					</div>
					<a
						href={resolve('/account')}
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
