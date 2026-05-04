<script lang="ts">
	let {
		items,
		testId
	}: {
		items: string[];
		testId: string;
	} = $props();
</script>

<div class="ds-scanned-grid gap-2 md:grid-cols-3" data-testid={testId}>
	{#each items as item, index (`${item}-${index}`)}
		<div
			data-testid={`${testId}-card-${index}`}
			class="min-h-10 rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-white px-3 py-2 font-mono text-[16px] font-semibold leading-5 text-ds-gray-900"
		>
			{item}
		</div>
	{/each}
</div>
