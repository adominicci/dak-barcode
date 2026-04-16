<script lang="ts">
	import { RotateCcw, TriangleAlert } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { getOperatorErrorMessage } from '$lib/operator-error';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import {
		checkPalletBelongsToLpid,
		getLegacyLoadViewAll,
		getLegacyMoveOrdersRows,
		getLpidForPalletLoad,
		updatePalletLoad,
		updateSingleLabelLoad
	} from '$lib/legacy-workflow.remote';
	import type { LegacyLoadViewAllEntry, LegacyMoveOrderRow } from '$lib/types';
	import { sortLegacyLoadViewAllEntries } from '$lib/workflow/legacy-sequence-order';
	import {
		workflowStores,
		type WorkflowDepartment,
		type WorkflowDropAreaSelection,
		type WorkflowLoaderSelection
	} from '$lib/workflow/stores';
	import type { PageProps } from './$types';

	type SequenceButtonTone = 'default' | 'active' | 'due';

	let { data }: PageProps = $props();
	let selectedSequence = $state<string | null>(null);
	let currentLoader = $state<WorkflowLoaderSelection>(get(workflowStores.currentLoader));
	let selectedDepartment = $state<WorkflowDepartment>(get(workflowStores.selectedDepartment));
	let isLocationModalOpen = $state(false);
	let pendingMoveRow = $state<LegacyMoveOrderRow | null>(null);
	let isMoving = $state(false);
	let moveError = $state<string | null>(null);

	const loadViewAllQuery = $derived(getLegacyLoadViewAll(data.dropSheetId));
	const sequenceOptions = $derived.by(() =>
		sortLegacyLoadViewAllEntries(loadViewAllQuery.current ?? [])
	);
	const activeSequence = $derived.by(() => {
		const activeSequenceId = selectedSequence ?? sequenceOptions[0]?.sequence ?? null;
		if (!activeSequenceId) {
			return null;
		}

		return sequenceOptions.find((entry) => entry.sequence === activeSequenceId) ?? null;
	});
	const moveOrdersRowsQuery = $derived.by(() => {
		if (!activeSequence) {
			return null;
		}

		return getLegacyMoveOrdersRows({
			dropSheetId: data.dropSheetId,
			dropSheetCustId: activeSequence.dropSheetCustId
		});
	});
	const moveOrdersRows = $derived(moveOrdersRowsQuery?.current ?? []);

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

	onMount(() => {
		const unsubscribeLoader = workflowStores.currentLoader.subscribe((loader) => {
			currentLoader = loader;
		});
		const unsubscribeDepartment = workflowStores.selectedDepartment.subscribe((department) => {
			selectedDepartment = department;
		});

		return () => {
			unsubscribeLoader();
			unsubscribeDepartment();
		};
	});

	function openMoveModal(row: LegacyMoveOrderRow) {
		moveError = null;

		if (!row.scanned) {
			moveError = 'Can not move a label/pallet that is not scanned.';
			return;
		}

		pendingMoveRow = row;
		workflowStores.clearCurrentDropArea();
		isLocationModalOpen = true;
	}

	function closeMoveModal() {
		if (isMoving) {
			return;
		}

		pendingMoveRow = null;
		isLocationModalOpen = false;
		workflowStores.clearCurrentDropArea();
	}

	async function handleMoveLocationSelect(dropArea: NonNullable<WorkflowDropAreaSelection>) {
		const rowToMove = pendingMoveRow;
		isLocationModalOpen = false;
		pendingMoveRow = null;
		workflowStores.setCurrentDropArea(dropArea);

		if (rowToMove === null) {
			return;
		}

		if (currentLoader === null) {
			moveError = 'A loader is required before moving items.';
			return;
		}

		const loadNumber = activeSequence?.loadNumber || data.loadNumber;

		try {
			isMoving = true;
			moveError = null;

			if (rowToMove.recordType === 1) {
				const lpid = await getLpidForPalletLoad({
					barcode: rowToMove.partListId,
					loadNumber,
					isPallet: true
				});
				const pallet = await checkPalletBelongsToLpid({
					barcode: rowToMove.partListId,
					lpid
				});

				await updatePalletLoad({
					dropAreaId: dropArea.dropAreaId,
					palletId: pallet.palletId,
					loaderName: currentLoader.loaderName,
					lpid: pallet.lpid
				});
			} else {
				await updateSingleLabelLoad({
					locationId: dropArea.dropAreaId,
					loaderName: currentLoader.loaderName,
					lpid: rowToMove.lpid,
					labelNumber: rowToMove.labelNumber
				});
			}

			await moveOrdersRowsQuery?.refresh?.();
			toast.success('Move completed.');
		} catch (error) {
			moveError = error instanceof Error ? error.message : 'Unable to move this item right now.';
		} finally {
			isMoving = false;
		}
	}
</script>

<div class="space-y-6">
	<LoadSummaryStrip
		testId="move-orders-summary"
		driverName={data.driverName}
		loadNumber={data.loadNumber}
		dropWeight={data.dropWeight}
	/>

	{#if loadViewAllQuery.error}
		<div class="rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700">
			<p class="font-semibold">Unable to load move order sequences.</p>
			<p class="mt-1 leading-6">
				{getOperatorErrorMessage(
					loadViewAllQuery.error,
					'Unable to load move order sequences.'
				)}
			</p>
		</div>
	{:else if loadViewAllQuery.loading && sequenceOptions.length === 0}
		<section
			class="flex min-h-[22rem] items-center justify-center rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-slate-100"
			data-testid="move-orders-loading-state"
		>
			<div class="flex flex-col items-center gap-3 text-center">
				<LoadingSpinner size="lg" data-testid="move-orders-loading-spinner" />
				<div class="space-y-1">
					<p class="text-sm font-semibold text-slate-950">Loading order status</p>
				</div>
			</div>
		</section>
	{:else}
		<section class="rounded-[2rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
			<div class="flex flex-wrap gap-2" data-testid="move-orders-sequences">
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
				<div class="mb-4" data-testid="move-orders-panel-header">
					<div>
						<p class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
							Move orders
						</p>
						<h2 class="text-2xl font-bold tracking-tight text-slate-950">
							{activeSequence?.sequence ?? '--'}
						</h2>
					</div>
				</div>

				{#if moveError}
					<div
						class="mb-4 flex gap-3 rounded-[1.25rem] bg-rose-50 px-4 py-4 text-sm text-rose-700"
						data-testid="move-orders-alert"
					>
						<TriangleAlert class="mt-0.5 size-4 shrink-0" />
						<p>{moveError}</p>
					</div>
				{/if}

				{#if moveOrdersRowsQuery?.error}
					<div class="rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm text-rose-700">
						{getOperatorErrorMessage(
							moveOrdersRowsQuery.error,
							'Unable to load move order rows.'
						)}
					</div>
				{:else if moveOrdersRowsQuery?.loading && moveOrdersRows.length === 0}
					<div class="flex min-h-40 items-center justify-center rounded-[1.5rem] bg-white">
						<LoadingSpinner size="md" data-testid="move-orders-rows-loading-spinner" />
					</div>
				{:else if moveOrdersRows.length === 0}
					<div class="rounded-[1.5rem] bg-white px-5 py-8 text-center text-sm text-slate-600">
						No move order rows are available for this sequence.
					</div>
				{:else}
					<div class="overflow-hidden rounded-[1.5rem] bg-white shadow-[var(--shadow-soft)]">
						<div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-px bg-slate-100 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
							<div class="bg-white px-4 py-3">Location</div>
							<div class="bg-white px-4 py-3">Part Number</div>
							<div class="bg-white px-4 py-3">Order Number</div>
							<div class="bg-white px-4 py-3">Customer Name</div>
							<div class="bg-white px-4 py-3 text-center">LID</div>
							<div class="bg-white px-4 py-3 text-center">Scanned</div>
							<div class="bg-white px-4 py-3 text-center">Move</div>
						</div>

						<div class="divide-y divide-slate-100">
							{#each moveOrdersRows as row, index (index)}
								<div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-px bg-slate-100">
									<div class="bg-white px-4 py-4 text-sm text-slate-700">{row.dropArea}</div>
									<div class="bg-white px-4 py-4 text-sm font-semibold text-slate-950">{row.partListId}</div>
									<div class="bg-white px-4 py-4 text-sm text-slate-700">{row.orderSoNumber}</div>
									<div class="bg-white px-4 py-4 text-sm text-slate-700">{row.customerName}</div>
									<div class="bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700">
										{row.qtyDet}
									</div>
									<div class="bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700">
										{row.scanned ? 'YES' : 'NO'}
									</div>
									<div class="bg-white px-4 py-4 text-center">
										<button
											type="button"
											aria-label={`Move row for ${row.orderSoNumber}`}
											disabled={!row.scanned || isMoving}
											onclick={() => openMoveModal(row)}
											class="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 enabled:bg-primary/10 enabled:text-primary enabled:hover:bg-primary/15"
										>
											<RotateCcw class="mr-2 size-4" />
											Move
										</button>
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

{#if isLocationModalOpen && pendingMoveRow !== null}
	<StagingLocationModal
		department={selectedDepartment}
		mode="loading"
		target={data.activeTarget}
		onClose={closeMoveModal}
		onSelect={handleMoveLocationSelect}
	/>
{/if}
