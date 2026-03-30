<script lang="ts">
	type Props = {
		testId: string;
		driverName: string | null;
		loadNumber: string;
		dropWeight: number | null;
		customerName?: string | null;
		variant?: 'default' | 'loading';
	};

	const WEIGHT_FORMATTER = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});

	let {
		testId,
		driverName,
		loadNumber,
		dropWeight,
		customerName = null,
		variant = 'default'
	}: Props = $props();

	const formattedWeight = $derived.by(() => {
		if (dropWeight === null) {
			return '--';
		}

		return WEIGHT_FORMATTER.format(dropWeight);
	});
</script>

{#if variant === 'loading'}
	<div class="grid gap-1.5 md:grid-cols-2" data-testid={testId}>
		<div class="rounded-[1.25rem] bg-surface-container-low px-3 py-1.5 shadow-[var(--shadow-soft)]">
			<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
				Delivery Number
			</p>
			<p class="mt-0.5 text-lg font-semibold leading-tight tracking-tight text-slate-950">
				{loadNumber}
			</p>
		</div>

		<div class="rounded-[1.25rem] bg-surface-container-low px-3 py-1.5 shadow-[var(--shadow-soft)]">
			<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
				Customer
			</p>
			<p class="mt-0.5 text-lg font-semibold leading-tight tracking-tight text-slate-950">
				{customerName ?? '--'}
			</p>
		</div>
	</div>
{:else}
	<div class="grid gap-1.5 md:grid-cols-3" data-testid={testId}>
		<div class="rounded-[1.25rem] bg-surface-container-low px-3 py-2.5 shadow-[var(--shadow-soft)]">
			<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">Driver</p>
			<p class="mt-1 text-lg font-semibold leading-tight tracking-tight text-slate-950">
				{driverName ?? '--'}
			</p>
		</div>

		<div class="rounded-[1.25rem] bg-surface-container-low px-3 py-2.5 shadow-[var(--shadow-soft)]">
			<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
				Delivery Number
			</p>
			<p class="mt-1 text-lg font-semibold leading-tight tracking-tight text-slate-950">
				{loadNumber}
			</p>
		</div>

		<div class="rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] px-3 py-2.5 text-white shadow-[var(--shadow-primary)]">
			<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-white/70">Weight</p>
			<div class="mt-1 flex items-baseline gap-1.5">
				<p class="text-xl font-semibold leading-tight tracking-tight">{formattedWeight}</p>
				<p class="text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">lbs</p>
			</div>
		</div>
	</div>
{/if}
