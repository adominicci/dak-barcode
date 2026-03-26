<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { AlertCircle, LoaderCircle, PackageCheck, UserRound } from '@lucide/svelte';
	import { getOnLoadStatusAllDepts } from '$lib/department-status.remote';
	import { getDropsheetCategoryAvailability, getDropsheetStatus } from '$lib/dropsheets.remote';
	import { upsertLoaderSession } from '$lib/loader-session.remote';
	import { getNumberOfDrops } from '$lib/load-view.remote';
	import type {
		DepartmentStatus,
		DropSheetCategoryAvailability,
		OperationalDepartment
	} from '$lib/types';
	import { LOADING_ENTRY_DEPARTMENTS, getLoadingEntryDepartment } from '$lib/workflow/loading-entry';
	import { workflowStores } from '$lib/workflow/stores';
	import type { PageProps } from './$types';

	type StatusTone = 'neutral' | 'ready' | 'done' | 'warning' | 'danger';

	type StatusEntry = {
		label: string;
		value: string | null;
	};

	const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 0
	});

	let { data }: PageProps = $props();

	let selectedLoaderId = $state('');
	let pendingDepartment = $state<OperationalDepartment | null>(null);
	let submitError = $state<string | null>(null);

	let departmentStatusQuery = $derived(getOnLoadStatusAllDepts(data.dropSheetId));
	let statusQuery = $derived(getDropsheetStatus(data.dropSheetId));
	let categoryAvailabilityQuery = $derived(getDropsheetCategoryAvailability(data.dropSheetId));
	let currentStatus = $derived(departmentStatusQuery.current ?? null);
	let stripStatus = $derived(statusQuery.current ?? null);
	let categoryAvailability = $derived(categoryAvailabilityQuery.current ?? null);
	let selectedLoader = $derived(
		data.loaders.find((loader) => String(loader.id) === selectedLoaderId) ?? null
	);
	let statusEntries = $derived(byStatusDisplay(stripStatus));
	let visibleDepartments = $derived(
		getVisibleDepartments(LOADING_ENTRY_DEPARTMENTS, categoryAvailability)
	);

	function byStatusDisplay(status: DepartmentStatus | null): StatusEntry[] {
		return [
			{ label: 'Slit', value: status?.slit ?? null },
			{ label: 'Trim', value: status?.trim ?? null },
			{ label: 'Wrap', value: status?.wrap ?? null },
			{ label: 'Roll', value: status?.roll ?? null },
			{ label: 'Parts', value: status?.parts ?? null },
			{ label: 'Soffit', value: status?.soffit ?? null }
		];
	}

	function getTone(value: string | null): StatusTone {
		switch (value) {
			case 'DONE':
				return 'done';
			case 'READY':
				return 'ready';
			case 'WAIT':
			case 'DUE':
				return 'warning';
			case 'STOP':
				return 'danger';
			default:
				return 'neutral';
		}
	}

	function getToneClasses(tone: StatusTone) {
		switch (tone) {
			case 'done':
				return 'bg-emerald-500 text-white';
			case 'ready':
				return 'bg-sky-600 text-white';
			case 'warning':
				return 'bg-amber-400 text-slate-950';
			case 'danger':
				return 'bg-rose-500 text-white';
			default:
				return 'bg-surface-container-high text-slate-600';
		}
	}

	function getDepartmentStatus(
		status: DepartmentStatus | null,
		department: OperationalDepartment
	): string | null {
		return status?.[getLoadingEntryDepartment(department).statusKey] ?? null;
	}

	function getVisibleDepartments(
		departments: typeof LOADING_ENTRY_DEPARTMENTS,
		availability: DropSheetCategoryAvailability | null
	) {
		if (!availability) {
			return departments;
		}

		return departments.filter((entry) => {
			switch (entry.department) {
				case 'Wrap':
					return availability.wrapHasLabels > 0;
				case 'Roll':
					return availability.rollHasLabels > 0;
				case 'Parts':
					return availability.partsHasLabels > 0;
			}
		});
	}

	function getDepartmentProgress(
		availability: DropSheetCategoryAvailability | null,
		department: OperationalDepartment
	): number | null {
		if (!availability) {
			return null;
		}

		switch (department) {
			case 'Wrap':
				return availability.wrapScannedPercent;
			case 'Roll':
				return availability.rollScannedPercent;
			case 'Parts':
				return availability.partsScannedPercent;
		}
	}

	function formatDepartmentProgress(value: number | null): string {
		if (value === null) {
			return '--';
		}

		return PERCENT_FORMATTER.format(Math.max(0, Math.min(1, value)));
	}

	async function beginLoading(department: OperationalDepartment) {
		if (!selectedLoader) return;

		const { locationId } = getLoadingEntryDepartment(department);
		pendingDepartment = department;
		submitError = null;

		try {
			await getNumberOfDrops({
				dropSheetId: data.dropSheetId,
				locationId
			});

			const session = await upsertLoaderSession({
				dropSheetId: data.dropSheetId,
				loaderId: selectedLoader.id,
				department,
				loaderName: selectedLoader.name,
				startedAt: new Date().toISOString()
			});

			workflowStores.setSelectedDepartment(department);
			workflowStores.setCurrentLoader({
				loaderId: selectedLoader.id,
				loaderName: selectedLoader.name
			});
			workflowStores.prepareForLoadingEntry();

			await goto(
				resolve(
					`/loading?dropsheetId=${data.dropSheetId}&locationId=${locationId}&loaderSessionId=${session.id}`
				)
			);
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Unable to start loading.';
		} finally {
			pendingDepartment = null;
		}
	}
</script>

<div class="space-y-6 xl:space-y-5">
	<!-- Page heading -->
	<div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h2
				data-testid="select-category-title"
				class="text-2xl font-bold tracking-tight text-slate-950 xl:text-[1.9rem]"
			>
				Select Category
			</h2>
			<p class="mt-1 text-xs text-on-surface-variant xl:text-sm">
				Load {data.loadNumber} &middot; {data.loaders.length} active loader{data.loaders.length !== 1 ? 's' : ''}
			</p>
		</div>
		<div
			data-testid="select-category-stat-cards"
			class="grid gap-2 sm:grid-cols-2"
		>
			<div class="rounded-xl bg-surface-container-low px-4 py-3 xl:px-4.5 xl:py-3.5">
				<p class="ui-label text-[10px]">Load</p>
				<p class="mt-1 text-xl font-bold tracking-tight text-slate-950 xl:text-[1.65rem]">
					{data.loadNumber}
				</p>
			</div>
			<div class="rounded-xl bg-surface-container-low px-4 py-3 xl:px-4.5 xl:py-3.5">
				<p class="ui-label text-[10px]">Active loaders</p>
				<p class="mt-1 text-xl font-bold tracking-tight text-slate-950 xl:text-[1.65rem]">
					{data.loaders.length}
				</p>
			</div>
		</div>
	</div>

	<!-- Compact progress bar (reference: category-selection-strict-v4) -->
	{#if statusQuery.error}
		<div class="rounded-2xl bg-white px-6 py-8 text-center shadow-sm">
			<p class="text-lg font-semibold text-slate-900">Unable to load department status.</p>
			<p class="mt-2 text-sm leading-6 text-slate-600">{statusQuery.error.message}</p>
		</div>
	{:else}
		<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 xl:p-2">
			<div class="grid grid-cols-6 overflow-hidden rounded-xl">
				{#each statusEntries as entry (entry.label)}
					<div class="flex flex-col">
						<span class="text-[10px] font-bold text-center py-1 text-on-surface-variant uppercase">
							{entry.label}
						</span>
						<div class={`${getToneClasses(getTone(entry.value))} text-[10px] font-bold py-1.25 text-center border-l border-white/20 first:border-l-0`}>
							{entry.value ?? '--'}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Loader selector + Department buttons -->
	<div class="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
		<!-- Loader selector -->
		<div
			data-testid="select-category-loader-panel"
			class="bg-white rounded-[2rem] p-5 shadow-sm"
		>
			<div class="mb-4 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5 text-primary">
					<UserRound class="size-4.5" />
				</div>
				<div>
					<p class="ui-label text-[10px]">Loader</p>
					<h3 class="text-base font-bold tracking-tight text-slate-950 xl:text-lg">Assign operator</h3>
				</div>
			</div>

			<div class="space-y-2.5">
				<label class="ui-label block text-[10px]" for="loader-select">Loader</label>
				<select
					id="loader-select"
					data-testid="select-category-loader-select"
					aria-label="Loader"
					bind:value={selectedLoaderId}
					class="h-14 w-full rounded-2xl bg-surface-container-low px-4 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-primary"
				>
					<option value="">Choose a loader</option>
					{#each data.loaders as loader (loader.id)}
						<option value={String(loader.id)}>{loader.name}</option>
					{/each}
				</select>
				<p class="text-[13px] leading-5 text-on-surface-variant">
					Loading cannot start until one active loader is selected.
				</p>
			</div>

			{#if submitError}
				<div class="mt-5 flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
					<AlertCircle class="mt-0.5 size-4 shrink-0" />
					<p>{submitError}</p>
				</div>
			{/if}
		</div>

		<!-- Department buttons -->
		<div class="grid gap-3">
			{#if categoryAvailabilityQuery.error}
				<div class="rounded-[2rem] bg-amber-50 px-5 py-4 text-sm text-amber-800">
					Unable to filter departments by available labels. Showing every loading department.
				</div>
			{/if}

			{#if visibleDepartments.length === 0}
				<div class="rounded-[2rem] bg-white px-6 py-8 text-center shadow-sm">
					<p class="text-lg font-semibold text-slate-900">No loading categories are ready.</p>
					<p class="mt-2 text-sm leading-6 text-slate-600">
						This load does not have wrap, roll, or parts labels available yet.
					</p>
				</div>
			{/if}

			{#each visibleDepartments as entry (entry.department)}
				{@const departmentStatus = getDepartmentStatus(currentStatus, entry.department)}
				{@const departmentProgress = getDepartmentProgress(categoryAvailability, entry.department)}
				<button
					data-testid={`select-category-department-${entry.department}`}
					type="button"
					onclick={() => beginLoading(entry.department)}
					disabled={!selectedLoader || pendingDepartment !== null}
					class="group flex items-center justify-between gap-4 rounded-[2rem] bg-white p-5 text-left shadow-sm transition-all enabled:hover:shadow-md enabled:hover:-translate-y-0.5 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 xl:p-5.5"
				>
					<div class="min-w-0 flex-1 space-y-1">
						<h3 class="text-xl font-bold tracking-tight text-slate-950 xl:text-[1.7rem]">
							{entry.department}
						</h3>
						<p class="text-[13px] leading-5 text-on-surface-variant xl:text-sm">{entry.description}</p>
						<div class="mt-3 flex items-center gap-2.5">
							<div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-low">
								<div
									class="h-full rounded-full bg-emerald-500 transition-[width]"
									style={`width: ${departmentProgress === null ? 0 : Math.max(0, Math.min(1, departmentProgress)) * 100}%`}
								></div>
							</div>
							<span class="min-w-10 text-xs font-semibold text-slate-700 xl:text-sm">
								{formatDepartmentProgress(departmentProgress)}
							</span>
						</div>
						<div class="flex flex-wrap gap-2 pt-1.5 text-[11px] xl:text-xs">
							<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
								Location {entry.locationId}
							</span>
							<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
								{selectedLoader ? `Loader ${selectedLoader.name}` : 'Select loader first'}
							</span>
						</div>
					</div>

					<div class="flex items-center gap-3 self-start pt-1">
						<div class={`rounded-full px-2.5 py-1 text-xs font-semibold xl:text-sm ${getToneClasses(getTone(departmentStatus))}`}>
							{departmentStatus ?? '--'}
						</div>
						{#if pendingDepartment === entry.department}
							<LoaderCircle class="size-4.5 animate-spin text-primary" />
						{:else}
							<PackageCheck class="size-4.5 text-primary" />
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
