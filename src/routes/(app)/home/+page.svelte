<script lang="ts">
	const actions = [
		{ name: 'Staging', detail: 'Department-first scan workflow' },
		{ name: 'Loading', detail: 'Dropsheet, category, and loader entry flow' },
		{ name: 'Add Loader', detail: 'Active loader utility on Home' },
		{ name: 'Will Call', detail: 'Visible but disabled for MVP' }
	];
</script>

<section class="space-y-6">
	<div class="space-y-3">
		<p class="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Operations home</p>
		<h2 class="text-3xl font-semibold tracking-tight">Stage &amp; Load</h2>
		<p class="max-w-3xl text-sm leading-6 text-muted-foreground">
			This shared-device shell is the stable re-entry page for the barcode module. Auth,
			warehouse resolution, and the real workflow actions land in the next milestones.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each actions as action (action.name)}
			<article class="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-sm">
				<div class="space-y-2">
					<h3 class="text-lg font-semibold">{action.name}</h3>
					<p class="text-sm leading-6 text-muted-foreground">{action.detail}</p>
				</div>
			</article>
		{/each}
	</div>
</section>
