<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { CalendarDays, ChevronRight, PackageSearch, Truck } from '@lucide/svelte';
	import { getDropsheets } from '$lib/dropsheets.remote';
	import type { PageProps } from './$types';

	const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1
	});

	const WEIGHT_FORMATTER = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1
	});

	const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	function getTodayDateValue() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	let { data }: PageProps = $props();
	let selectedDate = $derived(data.selectedDate ?? getTodayDateValue());
	let dropsheetsQuery = $derived(getDropsheets(selectedDate));
	let dropsheets = $derived(dropsheetsQuery.current ?? []);
	let dropsheetDateForm = $state<HTMLFormElement | null>(null);

	function formatLoadedAt(timestamp: string | null) {
		if (!timestamp) return 'Not started';
		return DATE_FORMATTER.format(new Date(timestamp));
	}

	function openDropsheet(dropSheetId: number) {
		return goto(resolve(`/select-category/${dropSheetId}`));
	}
</script>

<!-- Date picker (moved from layout) -->
<div class="flex items-center justify-between gap-4 mb-8">
	<form
		bind:this={dropsheetDateForm}
		method="GET"
		action={resolve('/dropsheets')}
		class="flex items-center gap-3 rounded-full bg-surface-container-low px-4 py-2.5"
	>
		<CalendarDays class="size-4 text-primary" />
		<input
			id="dropsheet-date"
			name="date"
			aria-label="Load date"
			type="date"
			value={selectedDate}
			onchange={() => dropsheetDateForm?.requestSubmit()}
			class="bg-transparent text-sm font-semibold text-slate-900 outline-none"
		/>
	</form>
</div>

<!-- Dropsheet list -->
<div class="bg-surface-container-low rounded-[2rem] p-4 sm:p-5">
	{#if dropsheetsQuery.error}
		<div class="rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
			<p class="text-lg font-semibold text-slate-900">Unable to load dropsheets.</p>
			<p class="mt-2 text-sm leading-6 text-slate-600">{dropsheetsQuery.error.message}</p>
		</div>
	{:else if dropsheetsQuery.loading && dropsheets.length === 0}
		<div class="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
			<p class="text-lg font-semibold text-slate-900">Loading dropsheets...</p>
		</div>
	{:else if dropsheets.length === 0}
		<div class="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
			<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
				<PackageSearch class="size-8" />
			</div>
			<p class="mt-5 text-xl font-semibold tracking-tight text-slate-950">
				No dropsheets scheduled for this date.
			</p>
			<p class="mt-2 text-sm leading-6 text-slate-600">
				Choose another date or refresh when dispatch publishes the schedule.
			</p>
		</div>
	{:else}
		<div class="grid gap-3">
			{#each dropsheets as dropsheet (dropsheet.id)}
				<button
					type="button"
					onclick={() => openDropsheet(dropsheet.id)}
					class="group rounded-[2rem] bg-white p-6 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] sm:flex sm:items-center sm:justify-between sm:gap-6"
				>
					<div class="flex-1 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
						<!-- Load identity -->
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
									<Truck class="size-5" />
								</div>
								<div>
									<p class="ui-label text-xs">Load</p>
									<p class="text-xl font-bold tracking-tight text-slate-950">
										{dropsheet.loadNumber}
									</p>
								</div>
							</div>
							<div class="flex flex-wrap gap-2 text-xs">
								<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
									Driver {dropsheet.driverName ?? 'Unassigned'}
								</span>
								<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
									Trailer {dropsheet.trailer ?? 'Pending'}
								</span>
							</div>
						</div>

						<!-- Stats -->
						<div class="grid gap-2 sm:grid-cols-3">
							<div class="rounded-2xl bg-surface-container-low px-3 py-3">
								<p class="ui-label text-xs">Complete</p>
								<p class="mt-1 text-xl font-bold tracking-tight text-slate-950">
									{PERCENT_FORMATTER.format(dropsheet.percentCompleted)}%
								</p>
							</div>
							<div class="rounded-2xl bg-surface-container-low px-3 py-3">
								<p class="ui-label text-xs">Weight</p>
								<p class="mt-1 text-xl font-bold tracking-tight text-slate-950">
									{WEIGHT_FORMATTER.format(dropsheet.dropWeight)}
								</p>
							</div>
							<div class="rounded-2xl bg-surface-container-low px-3 py-3">
								<p class="ui-label text-xs">Last load</p>
								<p class="mt-1 text-sm font-bold tracking-tight text-slate-950">
									{formatLoadedAt(dropsheet.loadedAt)}
								</p>
							</div>
						</div>
					</div>

					<!-- Action -->
					<div class="flex items-center justify-between gap-3 mt-4 sm:mt-0 sm:justify-end">
						<p class="text-xs font-medium text-slate-500">
							{dropsheet.loaderName ? `Loader ${dropsheet.loaderName}` : 'Choose category'}
						</p>
						<div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition group-hover:bg-primary group-hover:text-white">
							<ChevronRight class="size-5" />
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
