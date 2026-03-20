<script lang="ts">
	const targets = ['Canton', 'Freeport', 'Sandbox'];
</script>

<section class="space-y-6">
	<div class="space-y-3">
		<p class="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Admin only</p>
		<h2 class="text-3xl font-semibold tracking-tight">Select environment</h2>
		<p class="max-w-3xl text-sm leading-6 text-muted-foreground">
			Only admin users will reach this page. Operators will resolve their warehouse from the
			profile link instead of choosing here.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each targets as target (target)}
			<button
				class="rounded-[1.75rem] border border-border/70 bg-card/95 px-5 py-8 text-left shadow-sm transition hover:border-primary"
				type="button"
			>
				<span class="block text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
					Target
				</span>
				<span class="mt-3 block text-2xl font-semibold">{target}</span>
			</button>
		{/each}
	</div>
</section>
