<script lang="ts">
	type StatusEntry = {
		label: string;
		value: string | null;
		testId: string;
	};

	let {
		entries,
		testId
	}: {
		entries: StatusEntry[];
		testId: string;
	} = $props();

	function getStatusClass(value: string | null) {
		switch (value?.trim().toUpperCase()) {
			case 'NA':
			case 'DONE':
				return 'ds-status-done';
			case 'DUE':
				return 'ds-status-due';
			case 'BOT':
			case 'BOL':
			case 'WAIT':
				return 'ds-status-pending';
			default:
				return 'ds-status-neutral';
		}
	}

	function getStatusLabel(value: string | null) {
		return value?.trim().toUpperCase() || '--';
	}
</script>

<div class="ds-department-status" data-testid={testId}>
	{#each entries as entry (entry.testId)}
		<div class="min-w-0 space-y-1.5 text-center" data-testid={entry.testId}>
			<p class="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-ds-gray-600">
				{entry.label}
			</p>
			<div
				data-testid={`${entry.testId}-pill`}
				class={['ds-status-pill', getStatusClass(entry.value)]}
			>
				{getStatusLabel(entry.value)}
			</div>
		</div>
	{/each}
</div>
