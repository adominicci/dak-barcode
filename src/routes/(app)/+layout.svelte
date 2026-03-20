<script lang="ts">
	import { page } from '$app/state';
	import { KeyRound, LogOut } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<div class="ui-page min-h-dvh text-foreground">
	<div class="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 lg:px-8">
		<header class="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-white px-5 py-4 shadow-[var(--shadow-soft)]">
			<div class="space-y-1">
				<p class="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-500">
					Dakota Steel & Trim
				</p>
				<p class="text-xl font-semibold tracking-[0.01em] text-slate-950">Stage &amp; Load</p>
				<p class="text-sm text-slate-500">
					{data.displayName} {data.userRole ? `· ${data.userRole}` : ''}
					{#if data.userEmail}
						<span class="text-slate-400"> · {data.userEmail}</span>
					{/if}
				</p>
			</div>
			<div class="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
				<span class="ui-pill px-3 py-1">
					{data.activeTarget ?? 'Target required'}
				</span>
				{#if data.isAdmin}
					<span class="rounded-full bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-3 py-1 font-medium text-white">
						Admin session
					</span>
				{/if}
				{#if page.url.pathname !== '/inactive'}
					<Button
						href="/account"
						variant="outline"
						size="sm"
						class="h-10 rounded-[8px] border-transparent bg-[var(--surface-low)] px-4 text-slate-700 hover:bg-[var(--surface-container)]"
					>
						<KeyRound class="size-4" />
						Change password
					</Button>
				{/if}
				<form method="POST" action="/logout">
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="h-10 rounded-[8px] border-transparent bg-[rgba(139,36,54,0.08)] px-4 text-[#8b2436] hover:bg-[rgba(139,36,54,0.14)]"
					>
						<LogOut class="size-4" />
						Sign out
					</Button>
				</form>
			</div>
		</header>

		<main class="flex-1 py-6">
			{@render children()}
		</main>
	</div>
</div>
