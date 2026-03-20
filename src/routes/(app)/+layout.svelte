<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<div class="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(0,94,196,0.16)_0,transparent_26%),radial-gradient(circle_at_bottom_right,rgba(12,32,66,0.18)_0,transparent_28%),linear-gradient(180deg,#11233f_0%,#152945_18%,#f8f8fb_18%,#f2f2f6_100%)] text-foreground">
	<div class="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 lg:px-8">
		<header class="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-[rgba(255,255,255,0.8)] px-5 py-4 shadow-[0_24px_80px_-48px_rgba(17,35,63,0.55)] backdrop-blur-2xl">
			<div class="space-y-1">
				<p class="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-500">
					Dakota Steel & Trim
				</p>
				<p class="text-xl font-semibold tracking-[0.01em] text-slate-950">Stage &amp; Load</p>
				<p class="text-sm text-slate-500">
					{data.displayName} {data.userRole ? `· ${data.userRole}` : ''}
				</p>
			</div>
			<div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
				<span class="rounded-full bg-[rgba(21,41,69,0.07)] px-3 py-1">Shared iPad first</span>
				<span class="rounded-full bg-[rgba(21,41,69,0.07)] px-3 py-1">
					{data.activeTarget ?? 'Target required'}
				</span>
				{#if data.isAdmin}
					<span class="rounded-full bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-3 py-1 font-medium text-white">
						Admin session
					</span>
				{/if}
			</div>
		</header>

		<main class="flex-1 py-6">
			{@render children()}
		</main>
	</div>
</div>
