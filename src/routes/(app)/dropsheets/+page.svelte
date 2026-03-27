<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getLocalTimeZone, parseDate, type DateValue } from '@internationalized/date';
	import {
		CalendarDays,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		LoaderCircle,
		PackageSearch,
		RefreshCw,
		TriangleAlert
	} from '@lucide/svelte';
	import { getLoaders } from '$lib/loaders.remote';
	import { getTrailers, updateDropsheetTrailer } from '$lib/trailers.remote';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Popover } from '$lib/components/ui/popover';
	import SelectionModal from '$lib/components/workflow/selection-modal.svelte';
	import {
		getDropsheets,
		updateDropsheetPickedByLoader
	} from '$lib/dropsheets.remote';
	import type { DropSheet } from '$lib/types';
	import type { PageProps } from './$types';

	type PickerKind = 'trailer' | 'loader';
	type PickerOption = {
		id: number;
		label: string;
	};
	type PickerState = {
		kind: PickerKind;
		dropSheet: DropSheet;
	};

	const TWO_DECIMAL_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const WEIGHT_FORMATTER = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	const LOADED_AT_FORMATTER = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	const TABLE_SELECTION_BUTTON_CLASSES =
		'inline-flex min-h-9 max-w-full items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-20px_rgba(0,88,188,0.85)] transition hover:bg-primary/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

	let { data }: PageProps = $props();
	let selectedDateValue = $derived(parseDate(data.selectedDate));
	let isDatePickerOpen = $state(false);
	let activePicker = $state<PickerState | null>(null);
	let pickerError = $state<string | null>(null);
	let pickerSaving = $state(false);

	const dropsheetsQuery = $derived(getDropsheets(data.selectedDate));
	const loadersQuery = getLoaders();
	const trailersQuery = getTrailers();

	const dropsheets = $derived(dropsheetsQuery.current ?? []);
	const activeLoaders = $derived(
		(loadersQuery.current ?? []).filter((loader) => loader.isActive)
	);
	const loaderOptions = $derived(
		activeLoaders.map((loader) => ({
			id: loader.id,
			label: loader.name
		}))
	);
	const trailerOptions = $derived(
		(trailersQuery.current ?? []).map((trailer) => ({
			id: trailer.id,
			label: trailer.name
		}))
	);
	const activePickerOptions = $derived.by(() => {
		if (!activePicker) {
			return [];
		}

		return activePicker.kind === 'trailer' ? trailerOptions : loaderOptions;
	});
	const activePickerLoading = $derived.by(() => {
		if (!activePicker) {
			return false;
		}

		return activePicker.kind === 'trailer' ? trailersQuery.loading : loadersQuery.loading;
	});
	const activePickerQueryError = $derived.by(() => {
		if (!activePicker) {
			return null;
		}

		return activePicker.kind === 'trailer'
			? trailersQuery.error?.message ?? null
			: loadersQuery.error?.message ?? null;
	});
	const activePickerDescription = $derived.by(() => {
		if (!activePicker) {
			return null;
		}

		return activePicker.kind === 'trailer'
			? `Choose a trailer for ${activePicker.dropSheet.loadNumber}.`
			: `Choose a loader for ${activePicker.dropSheet.loadNumber}.`;
	});
	const activePickerTitle = $derived.by(() => {
		if (!activePicker) {
			return '';
		}

		return activePicker.kind === 'trailer' ? 'Select trailer' : 'Select loader';
	});
	const activePickerEmptyMessage = $derived.by(() => {
		if (!activePicker) {
			return 'No options available.';
		}

		return activePicker.kind === 'trailer'
			? 'No trailers are available.'
			: 'No active loaders are available.';
	});

	function formatDateValue(value: DateValue): string {
		return DATE_FORMATTER.format(value.toDate(getLocalTimeZone()));
	}

	function formatPercentCompleted(percentCompleted: number): string {
		return TWO_DECIMAL_NUMBER_FORMATTER.format(percentCompleted * 100);
	}

	function formatLoadedAt(timestamp: string | null, isComplete: boolean): string {
		if (!isComplete) {
			return '';
		}

		if (!timestamp) {
			return 'NA';
		}

		return LOADED_AT_FORMATTER.format(new Date(timestamp));
	}

	function formatTrailerLabel(trailer: string | null): string {
		const label = trailer?.trim();
		return label ? label : 'NA';
	}

	function formatLoaderLabel(loader: string | null): string {
		const label = loader?.trim();
		return label ? label : 'Set Loader';
	}

	function openPicker(kind: PickerKind, dropSheet: DropSheet) {
		activePicker = {
			kind,
			dropSheet
		};
		pickerError = null;
		pickerSaving = false;
	}

	function closePicker() {
		activePicker = null;
		pickerError = null;
		pickerSaving = false;
	}

	function goToDropSheetCategory(dropSheet: DropSheet) {
		const searchParams = new URLSearchParams({
			loadNumber: dropSheet.loadNumber,
			deliveryNumber: dropSheet.loadNumber,
			dropWeight: String(dropSheet.dropWeight)
		});

		return goto(resolve(`/select-category/${dropSheet.id}?${searchParams.toString()}`));
	}

	async function handleDateChange(value: DateValue | undefined) {
		if (!value) {
			return;
		}

		const nextDate = value.toString();
		if (nextDate === data.selectedDate) {
			return;
		}

		await goto(resolve(`/dropsheets?date=${nextDate}`), {
			noScroll: true
		});
	}

	async function handlePickerSelect(option: PickerOption) {
		if (!activePicker || pickerSaving) {
			return;
		}

		pickerSaving = true;
		pickerError = null;

		try {
			if (activePicker.kind === 'trailer') {
				await updateDropsheetTrailer({
					dropSheetId: activePicker.dropSheet.id,
					trailerId: option.id
				});
			} else {
				await updateDropsheetPickedByLoader({
					dropSheetId: activePicker.dropSheet.id,
					loaderName: option.label
				});
			}

			await dropsheetsQuery.refresh();
			closePicker();
		} catch (error) {
			pickerError = error instanceof Error ? error.message : 'Unable to update this dropsheet.';
		} finally {
			pickerSaving = false;
		}
	}
</script>

<div class="space-y-6">
	<section class="rounded-[2rem] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
		<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
			<div aria-hidden="true"></div>

			<div class="col-start-2 justify-self-center">
				<Popover.Root bind:open={isDatePickerOpen}>
					<Popover.Trigger
						class="inline-flex h-12 min-w-[260px] items-center justify-between gap-4 rounded-full border border-slate-200 bg-white px-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0"
					>
						<span class="flex items-center gap-3 text-left">
							<span class="flex size-10 items-center justify-center rounded-full bg-primary/5 text-primary">
								<CalendarDays class="size-4.5" />
							</span>
							<span class="flex flex-col">
								<span class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
									Load date
								</span>
								<span class="text-sm font-semibold text-slate-950">
									{formatDateValue(selectedDateValue)}
								</span>
							</span>
						</span>
						<ChevronDown
							class={`size-4 text-slate-500 transition-transform ${
								isDatePickerOpen ? 'rotate-180' : ''
							}`}
						/>
					</Popover.Trigger>
					<Popover.Content
						sideOffset={12}
						align="end"
						class="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)]"
					>
						<Calendar.Root
							type="single"
							value={selectedDateValue}
							preventDeselect
							weekdayFormat="short"
							fixedWeeks
							initialFocus
							calendarLabel="Load date"
							class="rounded-[1.5rem] bg-surface-container-low p-3"
							onValueChange={handleDateChange}
						>
							{#snippet children({ months, weekdays })}
								<Calendar.Header class="flex items-center justify-between gap-3 px-2 pt-1">
									<Calendar.PrevButton
										class="inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[var(--shadow-soft)] transition hover:text-slate-950"
									>
										<ChevronLeft class="size-4" />
									</Calendar.PrevButton>
									<Calendar.Heading class="text-sm font-semibold tracking-tight text-slate-950" />
									<Calendar.NextButton
										class="inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[var(--shadow-soft)] transition hover:text-slate-950"
									>
										<ChevronRight class="size-4" />
									</Calendar.NextButton>
								</Calendar.Header>

								<div class="space-y-4 pb-2 pt-3">
									{#each months as month (month.value.toString())}
										<Calendar.Grid class="w-full border-collapse select-none">
											<Calendar.GridHead>
												<Calendar.GridRow class="grid grid-cols-7 gap-1 px-1">
													{#each weekdays as day (day)}
														<Calendar.HeadCell
															class="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant"
														>
															{day}
														</Calendar.HeadCell>
													{/each}
												</Calendar.GridRow>
											</Calendar.GridHead>
											<Calendar.GridBody class="space-y-1">
												{#each month.weeks as weekDates (weekDates.map((date) => date.toString()).join('|'))}
													<Calendar.GridRow class="grid grid-cols-7 gap-1">
														{#each weekDates as date (date.toString())}
															<Calendar.Cell
																{date}
																month={month.value}
																class="p-0"
															>
																<Calendar.Day
																	class="flex size-10 items-center justify-center rounded-full text-sm font-medium text-slate-950 transition hover:bg-primary/10 data-[selected]:bg-primary data-[selected]:text-white data-[today]:ring-1 data-[today]:ring-primary/40 data-[outside-month]:text-slate-400 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
																/>
															</Calendar.Cell>
														{/each}
													</Calendar.GridRow>
												{/each}
											</Calendar.GridBody>
										</Calendar.Grid>
									{/each}
								</div>
							{/snippet}
						</Calendar.Root>
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="col-start-3 flex items-center justify-end gap-3">
				<button
					type="button"
					class="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0"
					aria-label="Refresh dropsheets"
					onclick={() => void dropsheetsQuery.refresh()}
				>
					{#if dropsheetsQuery.loading}
						<LoaderCircle class="size-4 animate-spin text-primary" />
					{:else}
						<RefreshCw class="size-4 text-primary" />
					{/if}
				</button>
			</div>
		</div>
	</section>

	<section class="overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
		{#if dropsheetsQuery.error}
			<div class="px-6 py-10 text-center">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
					<TriangleAlert class="size-7" />
				</div>
				<p class="mt-5 text-lg font-semibold tracking-tight text-slate-950">
					Unable to load dropsheets.
				</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">{dropsheetsQuery.error.message}</p>
			</div>
		{:else if dropsheetsQuery.loading && dropsheets.length === 0}
			<div class="px-6 py-12 text-center">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 text-primary">
					<LoaderCircle class="size-8 animate-spin" />
				</div>
				<p class="mt-5 text-lg font-semibold tracking-tight text-slate-950">
					Loading dropsheets...
				</p>
			</div>
		{:else if dropsheets.length === 0}
			<div class="px-6 py-12 text-center">
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
			<div class="overflow-x-auto">
				<table class="min-w-[980px] w-full border-separate border-spacing-0">
					<thead class="sticky top-0 z-10 bg-slate-50">
						<tr class="text-left text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
							<th class="px-3 py-3 font-semibold">Delivery Number</th>
							<th class="px-3 py-3 text-center font-semibold">Drop Weight</th>
							<th class="px-3 py-3 text-center font-semibold">Load Number</th>
							<th class="px-3 py-3 text-center font-semibold">Trailer Number</th>
							<th class="px-3 py-3 text-center font-semibold">
								<span
									data-testid="dropsheets-percent-completed-header"
									class="inline-flex items-center justify-center gap-0.5"
								>
									<span>Completed</span><span class="text-[9px] leading-none text-on-surface-variant">%</span>
								</span>
							</th>
							<th class="px-3 py-3 text-center font-semibold">Loaded TS</th>
							<th class="px-3 py-3 text-center font-semibold">Completed</th>
							<th class="px-3 py-3 text-center font-semibold">Loader</th>
							<th class="px-3 py-3 text-right font-semibold">Go</th>
						</tr>
					</thead>
					<tbody>
						{#each dropsheets as dropSheet (dropSheet.id)}
							{@const isComplete = dropSheet.percentCompleted >= 1}
							<tr class="group border-t border-slate-100 bg-white transition hover:bg-slate-50/70">
								<td class="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-slate-950">
									{dropSheet.loadNumber}
								</td>
								<td class="whitespace-nowrap px-3 py-2.5 text-center text-sm tabular-nums text-slate-700">
									{WEIGHT_FORMATTER.format(dropSheet.dropWeight)}
								</td>
								<td class="whitespace-nowrap px-3 py-2.5 text-center text-sm text-slate-700">
									{dropSheet.loadNumberShort ?? '--'}
								</td>
								<td class="px-3 py-2.5 text-center">
										<button
											type="button"
											class={TABLE_SELECTION_BUTTON_CLASSES}
											aria-label={`Change trailer for ${dropSheet.loadNumber}`}
											onclick={() => openPicker('trailer', dropSheet)}
										>
											<span class="truncate">{formatTrailerLabel(dropSheet.trailer)}</span>
										</button>
									</td>
								<td class="whitespace-nowrap px-3 py-2.5 text-center text-sm font-semibold text-slate-950">
									<span class="inline-flex items-baseline justify-center gap-0.5 tabular-nums"><span>{formatPercentCompleted(dropSheet.percentCompleted)}</span><span class="text-[9px] leading-none text-slate-500">%</span></span>
								</td>
								<td class="whitespace-nowrap px-3 py-2.5 text-center text-sm text-slate-700">
									{formatLoadedAt(dropSheet.loadedAt, isComplete)}
								</td>
								<td class="px-3 py-2.5 text-center">
									<div class="flex justify-center">
										<Checkbox
											checked={dropSheet.allLoaded}
											disabled
											aria-label={`Completed ${dropSheet.loadNumber}`}
										/>
									</div>
								</td>
								<td class="px-3 py-2.5 text-center">
										<button
											type="button"
											class={TABLE_SELECTION_BUTTON_CLASSES}
											aria-label={`Change loader for ${dropSheet.loadNumber}`}
											onclick={() => openPicker('loader', dropSheet)}
										>
											<span class="truncate">{formatLoaderLabel(dropSheet.loaderName)}</span>
										</button>
								</td>
								<td class="whitespace-nowrap px-3 py-2.5 text-right">
									<button
										type="button"
										class="inline-flex size-9 items-center justify-center rounded-full bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-white"
										aria-label={`Open select category for ${dropSheet.loadNumber}`}
										onclick={() => goToDropSheetCategory(dropSheet)}
									>
										<ChevronRight class="size-4.5" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>

{#if activePicker}
	<SelectionModal
		title={activePickerTitle}
		description={activePickerDescription}
		options={activePickerOptions}
		loading={activePickerLoading}
		error={pickerError ?? activePickerQueryError}
		saving={pickerSaving}
		emptyMessage={activePickerEmptyMessage}
		onClose={closePicker}
		onPick={handlePickerSelect}
	/>
{/if}
