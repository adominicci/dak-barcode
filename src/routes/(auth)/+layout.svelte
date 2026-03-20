<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-dvh bg-[linear-gradient(180deg,var(--color-sidebar)_0%,var(--color-background)_40%,oklch(0.98_0.01_80)_100%)] text-foreground">
	<div class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-10 px-6 py-8 lg:px-10">
		<header class="flex items-center justify-between border-b border-border/70 pb-4">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
					Dakota Steel & Trim
				</p>
				<h1 class="text-xl font-semibold tracking-tight">Barcode Operations</h1>
			</div>
			<p class="rounded-full border border-border bg-background/80 px-3 py-1 text-sm text-muted-foreground">
				Shared iPad shell
			</p>
		</header>

		<main class="flex flex-1 items-center justify-center pb-8">
			<div class="w-full max-w-xl rounded-[2rem] border border-border/70 bg-background/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
				{@render children()}
			</div>
		</main>
	</div>
</div>
