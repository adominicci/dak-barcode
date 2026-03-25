<script lang="ts">
	import { LoaderCircle, PackageSearch, TriangleAlert } from '@lucide/svelte';
	import type { StagingListItem } from '$lib/types';
	import type { WorkflowDepartment } from '$lib/workflow/stores';

	let {
		department,
		items,
		loading = false,
		error = null
	}: {
		department: WorkflowDepartment;
		items: StagingListItem[];
		loading?: boolean;
		error?: Error | null;
	} = $props();

	const isRollDepartment = $derived(department === 'Roll');
	const columnClass = $derived(
		isRollDepartment
			? 'grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.8fr)]'
			: 'grid-cols-[minmax(0,1.4fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.8fr)]'
	);
</script>

<div class="bg-surface-container-low rounded-[2rem] p-8 min-h-[400px] flex flex-col">
	<div class="flex items-center gap-3 mb-8 text-on-surface-variant/60">
		<div class="size-2.5 rounded-full bg-primary/60"></div>
		<span class="text-lg font-medium">
			{department ? `${department} staging view` : 'No department selected'}
		</span>
	</div>

	<div class="flex-grow overflow-hidden">
		{#if error}
			<div class="flex items-start gap-4 rounded-[1.75rem] bg-rose-50 px-6 py-6 text-rose-700">
				<TriangleAlert class="mt-0.5 size-5 shrink-0" />
				<div class="space-y-1">
					<p class="text-lg font-semibold text-rose-900">Unable to load staging items.</p>
					<p class="text-sm leading-6">{error.message}</p>
				</div>
			</div>
		{:else if loading}
			<div class="flex min-h-[240px] flex-col items-center justify-center gap-4 text-on-surface-variant/60">
				<LoaderCircle class="size-8 animate-spin text-primary" />
				<p class="text-lg font-medium">Loading staging items...</p>
			</div>
		{:else if !department}
			<div class="flex min-h-[240px] flex-col items-center justify-center gap-4 text-on-surface-variant/55">
				<PackageSearch class="size-10" />
				<p class="text-lg font-medium">Choose a department to load the staging list.</p>
			</div>
		{:else if items.length === 0}
			<div class="flex min-h-[240px] flex-col items-center justify-center gap-4 text-on-surface-variant/55">
				<PackageSearch class="size-10" />
				<p class="text-lg font-medium">No staging items are ready for this department yet.</p>
			</div>
		{:else}
			<div class="space-y-4">
				<div
					class={`grid ${columnClass} gap-4 px-6 py-4 text-[13px] font-bold tracking-widest uppercase text-on-surface-variant/70`}
				>
					{#if !isRollDepartment}
						<div>Part Number</div>
					{/if}
					<div>Description</div>
					<div class="text-center">Quantity</div>
					<div>Order Number</div>
					<div>Location</div>
				</div>

				<div class="space-y-3">
					{#each items as item (item.lpid)}
						{@const isAssigned = item.dropAreaName.trim().length > 0}
						<div
							data-testid={`staging-list-row-${item.lpid}`}
							class={`grid ${columnClass} items-center gap-4 rounded-[1.5rem] px-6 py-5 shadow-sm transition-colors ${
								isAssigned
									? 'bg-emerald-50/80 text-slate-900 shadow-emerald-100'
									: 'bg-surface-container-lowest text-slate-900'
							}`}
						>
							{#if !isRollDepartment}
								<div class="min-w-0">
									<p class="truncate font-semibold text-primary">{item.partListId}</p>
								</div>
							{/if}

							<div class="min-w-0 space-y-2">
								<p class="truncate text-base font-semibold text-slate-950">
									{item.partListDescription}
								</p>
								<span
									class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
										isAssigned
											? 'bg-emerald-500 text-white'
											: 'bg-surface-container-high text-on-surface-variant'
									}`}
								>
									{isAssigned ? 'Staged' : 'Pending'}
								</span>
							</div>

							<div class="text-center text-lg font-bold text-slate-950">{item.quantity}</div>

							<div class="font-mono text-sm text-on-surface-variant">{item.orderSoNumber}</div>

							<div class="space-y-1">
								<p class="text-sm font-semibold text-slate-950">
									{isAssigned ? item.dropAreaName : 'Unassigned'}
								</p>
								<p class="text-xs uppercase tracking-[0.2em] text-on-surface-variant/70">
									{isAssigned ? 'Current location' : 'Awaiting location'}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
