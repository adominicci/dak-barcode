<script lang="ts">
import { getLegacyLoadViewAll, getLegacyOrderStatusRows } from '$lib/legacy-workflow.remote';
import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
import { sortLegacyLoadViewAllEntries } from '$lib/workflow/legacy-sequence-order';
import { getWorkflowStatusClasses } from '$lib/workflow/status-tones';
import { getOperatorErrorMessage } from '$lib/operator-error';
import type { LegacyLoadViewAllEntry, LegacyOrderStatusRow } from '$lib/types';
	import type { PageProps } from './$types';

	type SequenceButtonTone = 'default' | 'active' | 'due';

	let { data }: PageProps = $props();
	let selectedSequence = $state<string | null>(null);

const loadViewAllState = $derived.by(() => {
	const query = getLegacyLoadViewAll(data.dropSheetId);
	return {
		current: query.current ?? [],
		error: query.error,
		loading: query.loading
	};
});
const sequenceOptions = $derived.by(() => sortLegacyLoadViewAllEntries(loadViewAllState.current));
	const activeSequence = $derived.by(() => {
		const activeSequenceId = selectedSequence ?? sequenceOptions[0]?.sequence ?? null;
		if (!activeSequenceId) {
			return null;
		}

		return sequenceOptions.find((entry) => entry.sequence === activeSequenceId) ?? null;
	});
function getOrderStatusRowsQuery() {
	if (!activeSequence) {
		return null;
	}

	return getLegacyOrderStatusRows({
		dropSheetId: data.dropSheetId,
		dropSheetCustId: activeSequence.dropSheetCustId
	});
}

const orderStatusRowsState = $derived.by(() => {
	const query = getOrderStatusRowsQuery();
	return {
		current: query?.current ?? [],
		error: query?.error ?? null,
		loading: query?.loading ?? false
	};
});
const orderStatusRows = $derived(orderStatusRowsState.current);
const orderStatusRowsError = $derived(orderStatusRowsState.error);
const isOrderStatusRowsLoading = $derived(
	orderStatusRowsState.loading && orderStatusRows.length === 0
);

	function handleSequenceSelect(sequence: LegacyLoadViewAllEntry) {
		selectedSequence = sequence.sequence;
	}

	function getSequenceTone(sequence: LegacyLoadViewAllEntry): SequenceButtonTone {
		if (sequence.sequence === activeSequence?.sequence) {
			return 'active';
		}

		if ((sequence.status ?? '').toLowerCase() === 'due') {
			return 'due';
		}

		return 'default';
	}

	function getSequenceClasses(tone: SequenceButtonTone) {
		switch (tone) {
			case 'active':
				return 'bg-primary text-white shadow-[var(--shadow-primary)]';
			case 'due':
				return 'border-rose-500 bg-white text-slate-950';
			default:
				return 'bg-surface-container-low text-slate-900';
		}
	}

</script>

<div class="space-y-6">
	<LoadSummaryStrip
		testId="order-status-summary"
		driverName={data.driverName}
		loadNumber={data.loadNumber}
		dropWeight={data.dropWeight}
	/>

	{#if loadViewAllState.error}
		<div class="rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700">
			<p class="font-semibold">Unable to load order status sequences.</p>
			<p class="mt-1 leading-6">
				{getOperatorErrorMessage(
					loadViewAllState.error,
					'Unable to load order status sequences.'
				)}
			</p>
		</div>
	{:else if loadViewAllState.loading && sequenceOptions.length === 0}
		<section
			class="flex min-h-[22rem] items-center justify-center rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-slate-100"
			data-testid="order-status-loading-state"
		>
			<div class="flex flex-col items-center gap-3 text-center">
				<LoadingSpinner size="lg" data-testid="order-status-loading-spinner" />
				<p class="text-sm font-semibold text-slate-950">Loading order status</p>
			</div>
		</section>
	{:else}
		<section class="rounded-[2rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
			<div class="flex flex-wrap gap-2" data-testid="order-status-sequences">
				{#each sequenceOptions as sequence, index (index)}
					<button
						type="button"
						onclick={() => handleSequenceSelect(sequence)}
						class={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${getSequenceClasses(
							getSequenceTone(sequence)
						)}`}
					>
						{sequence.sequence}
					</button>
				{/each}
			</div>

			<div class="mt-5 overflow-hidden rounded-[1.75rem] bg-surface-container-low p-4">
				<div
					class="mb-4 flex items-center justify-between gap-4"
					data-testid="order-status-panel-header"
				>
					<div>
						<p class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
							Order status
						</p>
						<h2 class="text-2xl font-bold tracking-tight text-slate-950">
							{activeSequence?.sequence ?? '--'}
						</h2>
					</div>
				</div>

				{#if orderStatusRowsError}
					<div class="rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm text-rose-700">
						{getOperatorErrorMessage(
							orderStatusRowsError,
							'Unable to load order status rows.'
						)}
					</div>
				{:else if isOrderStatusRowsLoading}
					<div class="flex min-h-40 items-center justify-center rounded-[1.5rem] bg-white">
						<LoadingSpinner size="md" data-testid="order-status-rows-loading-spinner" />
					</div>
				{:else if orderStatusRows.length === 0}
					<div class="rounded-[1.5rem] bg-white px-5 py-8 text-center text-sm text-slate-600">
						No order status rows are available for this sequence.
					</div>
				{:else}
					<div class="overflow-hidden rounded-[1.5rem] bg-white shadow-[var(--shadow-soft)]">
						<div class="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.85fr)_repeat(6,minmax(0,0.95fr))] gap-px bg-slate-100 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
							<div class="bg-white px-3 py-3">Order #</div>
							<div class="bg-white px-4 py-3">Customer Name</div>
							<div class="bg-white px-4 py-3 text-center">Slit</div>
							<div class="bg-white px-4 py-3 text-center">Trim</div>
							<div class="bg-white px-4 py-3 text-center">Wrap</div>
							<div class="bg-white px-4 py-3 text-center">Roll</div>
							<div class="bg-white px-4 py-3 text-center">Parts</div>
							<div class="bg-white px-4 py-3 text-center">Soffit</div>
						</div>

						<div class="divide-y divide-slate-100">
							{#each orderStatusRows as row, index (index)}
								<div class="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.85fr)_repeat(6,minmax(0,0.95fr))] gap-px bg-slate-100">
									<div class="bg-white px-3 py-4 text-sm font-semibold text-slate-950 break-words">
										{row.orderSoNumber}
									</div>
									<div class="bg-white px-4 py-4 text-sm leading-6 text-slate-700 break-words">
										{row.customerName}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderSlitterStatus)]}>
										{row.orderSlitterStatus ?? '--'}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderTrimStatus)]}>
										{row.orderTrimStatus ?? '--'}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderWrapStatus)]}>
										{row.orderWrapStatus ?? '--'}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderRollStatus)]}>
										{row.orderRollStatus ?? '--'}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderPartStatus)]}>
										{row.orderPartStatus ?? '--'}
									</div>
									<div class={['px-3 py-4 text-center text-sm font-semibold', getWorkflowStatusClasses(row.orderSoffitStatus)]}>
										{row.orderSoffitStatus ?? '--'}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</div>
