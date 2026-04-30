<script lang="ts">
	type Props = {
		testId: string;
		driverName?: string | null;
		loadNumber: string;
		dropWeight: number | null;
		customerName?: string | null;
		variant?: 'default' | 'loading' | 'operational';
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

{#if variant === 'operational'}
	<div class="grid gap-2 md:grid-cols-3" data-testid={testId}>
		<div
			data-testid={`${testId}-driver-card`}
			class="rounded-[var(--ds-radius-card)] bg-ds-gray-100 px-3 py-2"
		>
			<p class="text-xs font-semibold uppercase tracking-[0.08em] text-ds-gray-600">Driver</p>
			<p class="mt-1 text-[18px] font-semibold leading-tight text-ds-gray-900">
				{driverName ?? '--'}
			</p>
		</div>

		<div
			data-testid={`${testId}-delivery-card`}
			class="rounded-[var(--ds-radius-card)] bg-ds-gray-100 px-3 py-2"
		>
			<p class="text-xs font-semibold uppercase tracking-[0.08em] text-ds-gray-600">
				Delivery Number
			</p>
			<p class="mt-1 text-[18px] font-semibold leading-tight text-ds-gray-900">
				{loadNumber}
			</p>
		</div>

		<div
			data-testid={`${testId}-weight-card`}
			class="rounded-[var(--ds-radius-card)] bg-ds-green-500 px-3 py-2 text-white"
		>
			<p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/80">Weight</p>
			<div class="mt-1 flex items-baseline gap-2">
				<p class="text-2xl font-bold leading-tight">{formattedWeight}</p>
				<p class="text-xs font-semibold uppercase tracking-[0.08em] text-white/80">lbs</p>
			</div>
		</div>
	</div>
{:else if variant === 'loading'}
	<div class="grid gap-2 md:grid-cols-2" data-testid={testId}>
		<div class="rounded-[var(--ds-radius-card)] bg-ds-gray-100 px-3 py-2">
			<p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ds-gray-600">
				Delivery Number
			</p>
			<p class="mt-1 text-[18px] font-semibold leading-tight text-ds-gray-900">
				{loadNumber}
			</p>
		</div>

		<div class="rounded-[var(--ds-radius-card)] bg-ds-gray-100 px-3 py-2">
			<p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-ds-gray-600">
				Customer
			</p>
			<p class="mt-1 text-[18px] font-semibold leading-tight text-ds-gray-900">
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
