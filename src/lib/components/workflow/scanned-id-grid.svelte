<script lang="ts">
	let {
		items,
		testId
	}: {
		items: string[];
		testId: string;
	} = $props();
</script>

<div class="ds-scanned-grid md:grid-cols-3" data-testid={testId}>
	{#each items as item, index (`${item}-${index}`)}
		<div
			data-testid={`${testId}-card-${index}`}
			class="min-h-12 rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-white px-4 py-3 font-mono text-[17px] font-semibold leading-6 text-ds-gray-900"
		>
			{item}
		</div>
	{/each}
</div>
