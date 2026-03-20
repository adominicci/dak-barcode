<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-dvh bg-[radial-gradient(circle_at_top_left,oklch(0.97_0.03_75)_0,transparent_32%),linear-gradient(180deg,oklch(0.2_0.02_255)_0%,oklch(0.16_0.01_255)_18%,oklch(0.985_0.01_80)_18%,oklch(0.985_0.01_80)_100%)]">
	<div class="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 lg:px-8">
		<header class="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-card/90 px-5 py-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-border/60 backdrop-blur">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
					Dakota Steel & Trim
				</p>
				<p class="text-xl font-semibold tracking-tight text-foreground">Stage &amp; Load</p>
			</div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span class="rounded-full border border-border bg-background px-3 py-1">Shared iPad first</span>
				<span class="rounded-full border border-border bg-background px-3 py-1">Scaffold batch</span>
			</div>
		</header>

		<main class="flex-1 py-6">
			{@render children()}
		</main>
	</div>
</div>
