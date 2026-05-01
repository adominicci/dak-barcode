<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let {
		activeDropNumber,
		totalDrops,
		labels,
		scanned,
		needPick,
		canGoPrevious,
		canGoNext,
		onPrevious,
		onNext,
		testId,
		previousTestId = `${testId}-previous`,
		nextTestId = `${testId}-next`,
		statTestIdBase = testId
	}: {
		activeDropNumber: number;
		totalDrops: number;
		labels: number;
		scanned: number;
		needPick: number;
		canGoPrevious: boolean;
		canGoNext: boolean;
		onPrevious: () => void;
		onNext: () => void;
		testId: string;
		previousTestId?: string;
		nextTestId?: string;
		statTestIdBase?: string;
	} = $props();

	const counters = $derived([
		{ label: 'Labels', value: labels, className: 'bg-ds-blue-600', testId: `${statTestIdBase}-labels` },
		{ label: 'Scanned', value: scanned, className: 'bg-ds-blue-500', testId: `${statTestIdBase}-scanned` },
		{ label: 'Need pick', value: needPick, className: 'bg-ds-blue-400', testId: `${statTestIdBase}-need-pick` }
	]);
</script>

<section class="ds-drop-counter space-y-1.5" data-testid={testId}>
	<h3 class="text-sm font-semibold tracking-tight text-ds-gray-900">
		Drop {activeDropNumber} of {totalDrops}
	</h3>

	<div class="flex items-center gap-2">
		<button
			type="button"
			aria-label="Previous drop"
			data-testid={previousTestId}
			class="ds-nav-arrow inline-flex !size-12 !min-h-12 !min-w-12 items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-45"
			disabled={!canGoPrevious}
			onclick={onPrevious}
		>
			<ChevronLeft class="size-6" />
		</button>

		<div class="grid min-w-0 flex-1 grid-cols-3 gap-2">
			{#each counters as counter (counter.label)}
				<div
					data-testid={counter.testId}
					class={['ds-counter-card px-2 py-1.5', counter.className]}
				>
					<p class="text-[11px] font-semibold uppercase tracking-[0.05em] text-white/85">
						{counter.label}
					</p>
					<p class="text-xl font-bold leading-6 text-white">{counter.value}</p>
				</div>
			{/each}
		</div>

		<button
			type="button"
			aria-label="Next drop"
			data-testid={nextTestId}
			class="ds-nav-arrow inline-flex !size-12 !min-h-12 !min-w-12 items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-45"
			disabled={!canGoNext}
			onclick={onNext}
		>
			<ChevronRight class="size-6" />
		</button>
	</div>
</section>
