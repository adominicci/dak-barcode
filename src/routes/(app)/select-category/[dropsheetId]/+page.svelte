<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		ClipboardList,
		LoaderCircle,
		PenLine,
		Truck
	} from '@lucide/svelte';
	import SelectionModal from '$lib/components/workflow/selection-modal.svelte';
	import { getDropsheetCategoryAvailability, getDropsheetStatus } from '$lib/dropsheets.remote';
	import { getNumberOfDrops } from '$lib/load-view.remote';
	import { upsertLoaderSession } from '$lib/loader-session.remote';
	import { getWorkflowStatusClasses } from '$lib/workflow/status-tones';
	import type {
		DepartmentStatus,
		DropSheetCategoryAvailability,
		OperationalDepartment,
	} from '$lib/types';
	import type { WorkflowLoaderSelection } from '$lib/workflow/stores';
	import { LOADING_ENTRY_DEPARTMENTS, getLoadingEntryDepartment } from '$lib/workflow/loading-entry';
	import { workflowStores } from '$lib/workflow/stores';
	import type { PageProps } from './$types';

	type StatusEntry = {
		label: string;
		value: string | null;
	};

	const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 0
	});

	const WEIGHT_FORMATTER = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});

	let { data }: PageProps = $props();

	let currentLoader = $state<WorkflowLoaderSelection>(null);
	let activeDepartment = $state<OperationalDepartment | null>(null);
	let pendingDepartment = $state<OperationalDepartment | null>(null);
	let isLoaderModalOpen = $state(false);
	let submitError = $state<string | null>(null);
	type LoaderSelection = Exclude<WorkflowLoaderSelection, null>;

	const statusQuery = $derived(getDropsheetStatus(data.dropSheetId));
	const categoryAvailabilityQuery = $derived(getDropsheetCategoryAvailability(data.dropSheetId));
	const currentStatus = $derived(statusQuery.current ?? null);
	const categoryAvailability = $derived(categoryAvailabilityQuery.current ?? null);
	const statusEntries = $derived(byStatusDisplay(currentStatus));
	const departmentLoaderGroups = $derived.by(() => {
		const groups: Record<OperationalDepartment, string[]> = {
			Roll: [],
			Wrap: [],
			Parts: []
		};

		for (const group of data.departmentLoaders) {
			groups[group.department] = group.loaderNames;
		}

		return groups;
	});
	const visibleDepartments = $derived(
		getVisibleDepartments(LOADING_ENTRY_DEPARTMENTS, categoryAvailability)
	);
	const selectCategoryReturnHref = $derived.by(() => {
		const searchParams = new URLSearchParams();

		searchParams.set('loadNumber', data.loadNumber);
		if (data.driverName) {
			searchParams.set('driverName', data.driverName);
		}
		if (data.dropWeight !== null) {
			searchParams.set('dropWeight', String(data.dropWeight));
		}

		return resolve(`/select-category/${data.dropSheetId}?${searchParams.toString()}`);
	});
	const selectedLoaderLabel = $derived(currentLoader?.loaderName ?? 'Select loader');

	onMount(() => {
		const unsubscribeCurrentLoader = workflowStores.currentLoader.subscribe((loader) => {
			currentLoader = loader;
		});

		return () => {
			unsubscribeCurrentLoader();
		};
	});

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

	function formatWeight(value: number | null): string {
		if (value === null) {
			return '--';
		}

		return WEIGHT_FORMATTER.format(value);
	}

	function getDepartmentLoaderNames(department: OperationalDepartment): string[] {
		return departmentLoaderGroups[department] ?? [];
	}

	function closeLoaderModal() {
		if (pendingDepartment !== null) {
			return;
		}

		isLoaderModalOpen = false;
		activeDepartment = null;
	}

	function buildLegacyActionSearchParams() {
		const searchParams = new URLSearchParams({
			loadNumber: data.loadNumber,
			returnTo: selectCategoryReturnHref
		});

		if (data.driverName) {
			searchParams.set('driverName', data.driverName);
		}

		if (data.dropWeight !== null) {
			searchParams.set('dropWeight', String(data.dropWeight));
		}

		return searchParams;
	}

	async function beginLoading(department: OperationalDepartment, loader: LoaderSelection) {
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
				loaderId: loader.loaderId,
				department,
				loaderName: loader.loaderName,
				startedAt: new Date().toISOString()
			});

			workflowStores.setSelectedDepartment(department);
			workflowStores.setCurrentLoader(loader);
			workflowStores.prepareForLoadingEntry();

			const searchParams = new URLSearchParams({
				dropsheetId: String(data.dropSheetId),
				locationId: String(locationId),
				loaderSessionId: String(session.id),
				startedAt: session.startedAt,
				loadNumber: data.loadNumber
			});

			if (data.dropWeight !== null) {
				searchParams.set('dropWeight', String(data.dropWeight));
			}

			if (data.driverName) {
				searchParams.set('driverName', data.driverName);
			}

			await goto(resolve(`/loading?${searchParams.toString()}`));
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Unable to start loading.';
		} finally {
			pendingDepartment = null;
		}
	}

	function handleDepartmentSelect(department: OperationalDepartment) {
		activeDepartment = department;
		isLoaderModalOpen = true;
		submitError = null;
	}

	async function handleLoaderPick(option: { id: number; label: string }) {
		if (!activeDepartment) {
			return;
		}

		const loader = {
			loaderId: option.id,
			loaderName: option.label
		};
		workflowStores.setCurrentLoader(loader);
		isLoaderModalOpen = false;

		const department = activeDepartment;
		activeDepartment = null;

		await beginLoading(department, loader);
	}
</script>

<div class="space-y-6 xl:space-y-5">
	<div class="space-y-4 rounded-[2.5rem] bg-white/92 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/80">
		<div class="grid gap-2 md:grid-cols-3" data-testid="select-category-summary-grid">
			<div class="rounded-[1.25rem] bg-surface-container-low px-4 py-3 shadow-[var(--shadow-soft)]">
				<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">Driver</p>
				<p class="mt-1.5 text-xl font-bold tracking-tight text-slate-950">
					{data.driverName ?? '--'}
				</p>
			</div>

			<div class="rounded-[1.25rem] bg-surface-container-low px-4 py-3 shadow-[var(--shadow-soft)]">
				<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
					Delivery Number
				</p>
				<p class="mt-1.5 text-xl font-bold tracking-tight text-slate-950">{data.loadNumber}</p>
			</div>

			<div class="rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] px-4 py-3 text-white shadow-[var(--shadow-primary)]">
				<p class="ui-label text-[9px] uppercase tracking-[0.18em] text-white/70">Weight</p>
				<div class="mt-1.5 flex items-baseline gap-2">
					<p class="text-2xl font-black tracking-tight">{formatWeight(data.dropWeight)}</p>
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">lbs</p>
				</div>
			</div>
		</div>

		{#if statusQuery.error}
			<div class="rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700">
				<p class="font-semibold">Unable to load department status.</p>
				<p class="mt-1 leading-6">{statusQuery.error.message}</p>
			</div>
		{:else}
			<div
				data-testid="select-category-status-strip"
				class="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[var(--shadow-soft)] ring-1 ring-slate-100"
			>
				<div data-testid="select-category-status-grid" class="grid grid-cols-6">
					{#each statusEntries as entry (entry.label)}
						<div class="flex flex-col">
							<span class="py-1 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
								{entry.label}
							</span>
							<div
								class={`border-l border-white/20 px-1.5 py-1.25 text-center text-[10px] font-bold first:border-l-0 ${getWorkflowStatusClasses(entry.value)}`}
							>
								{entry.value ?? '--'}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if categoryAvailabilityQuery.error}
			<div class="rounded-[1.5rem] bg-amber-50 px-5 py-4 text-sm text-amber-800">
				Unable to filter departments by availability. Showing every loading department.
			</div>
		{/if}

		<div data-testid="select-category-actions" class="grid gap-3 xl:grid-cols-3">
			{#if visibleDepartments.length === 0}
				<div class="rounded-[1.75rem] bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)]">
					<p class="text-lg font-semibold tracking-tight text-slate-950">No loading categories are ready.</p>
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
					onclick={() => handleDepartmentSelect(entry.department)}
					disabled={pendingDepartment !== null}
					class="group flex min-h-[7rem] flex-col gap-3 rounded-[1.75rem] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-[var(--shadow-card)] enabled:active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<div class="flex items-start justify-between gap-4">
						<h3 class="text-[1.75rem] font-bold tracking-tight text-slate-950">{entry.department}</h3>
						<div
							class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getWorkflowStatusClasses(departmentStatus)}`}
						>
							{departmentStatus ?? '--'}
						</div>
					</div>

					<div class="space-y-1.5">
						<div class="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
							<div
								class="h-full rounded-full bg-emerald-500 transition-[width]"
								style={`width: ${departmentProgress === null ? 0 : Math.max(0, Math.min(1, departmentProgress)) * 100}%`}
							></div>
						</div>

						<div class="flex flex-wrap gap-1.5 text-[10px] text-slate-600">
							<span class="rounded-full bg-surface-container-low px-2.5 py-1 font-medium">
								{formatDepartmentProgress(departmentProgress)}
							</span>
							<span class="rounded-full bg-surface-container-low px-2.5 py-1 font-medium">
								{selectedLoaderLabel}
							</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<div
		data-testid="select-category-loader-roster"
		class="space-y-4 rounded-[2.5rem] bg-white/92 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/80"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xl font-bold tracking-tight text-slate-950">Loaders</h2>
		</div>

		<div data-testid="select-category-loader-grid" class="grid grid-cols-3 gap-3">
			{#each LOADING_ENTRY_DEPARTMENTS as entry (entry.department)}
				{@const departmentLoaderNames = getDepartmentLoaderNames(entry.department)}
				<section
					data-testid={`select-category-loader-column-${entry.department}`}
					class="rounded-[1.5rem] bg-surface-container-low/60 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/70"
				>
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-base font-bold tracking-tight text-slate-950">{entry.department}</h3>
						<span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-[var(--shadow-soft)]">
							{departmentLoaderNames.length}
						</span>
					</div>

					{#if departmentLoaderNames.length === 0}
						<div class="mt-3 rounded-[1.1rem] border border-dashed border-slate-200 bg-white/80 px-3 py-4 text-sm text-slate-500">
							No loaders yet for this department.
						</div>
					{:else}
						<div class="mt-3 flex flex-wrap gap-2">
							{#each departmentLoaderNames as loaderName (loaderName)}
								<span class="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
									{loaderName}
								</span>
							{/each}
						</div>
					{/if}
				</section>
			{/each}
		</div>
	</div>

	<div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
		<button
			type="button"
			onclick={() =>
				goto(
					resolve(
						`/(app)/order-status/[dropsheetId]?${buildLegacyActionSearchParams().toString()}` as `/(app)/order-status/[dropsheetId]?${string}`,
						{
							dropsheetId: String(data.dropSheetId)
						}
					)
				)
			}
			class="flex items-center justify-between gap-4 rounded-[1.75rem] bg-white px-5 py-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
		>
			<div class="flex items-center gap-3">
				<span class="flex size-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
					<ClipboardList class="size-5" />
				</span>
				<div>
					<p class="text-lg font-bold tracking-tight text-slate-950">Order Status</p>
				</div>
			</div>
			<PenLine class="size-5 text-slate-400" />
		</button>

		<button
			type="button"
			onclick={() =>
				goto(
					resolve(
						`/(app)/move-orders/[dropsheetId]?${buildLegacyActionSearchParams().toString()}` as `/(app)/move-orders/[dropsheetId]?${string}`,
						{
							dropsheetId: String(data.dropSheetId)
						}
					)
				)
			}
			class="flex items-center justify-between gap-4 rounded-[1.75rem] bg-white px-5 py-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
		>
			<div class="flex items-center gap-3">
				<span class="flex size-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
					<Truck class="size-5" />
				</span>
				<div>
					<p class="text-lg font-bold tracking-tight text-slate-950">Dropsheet</p>
				</div>
			</div>
			<PenLine class="size-5 text-slate-400" />
		</button>

	</div>

	{#if submitError}
		<div class="rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700">
			<p>{submitError}</p>
		</div>
	{/if}
</div>

{#if isLoaderModalOpen && activeDepartment}
	<SelectionModal
		title={`Select loader for ${activeDepartment}`}
		description={`The current loader is ${selectedLoaderLabel}. Tap a loader to keep the workflow sticky and start ${activeDepartment.toLowerCase()} immediately.`}
		options={data.loaders.map((loader) => ({
			id: loader.id,
			label: loader.name
		}))}
		loading={false}
		error={null}
		saving={pendingDepartment !== null}
		emptyMessage="No active loaders are available."
		onClose={closeLoaderModal}
		onPick={handleLoaderPick}
	/>
{/if}
