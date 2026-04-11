<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		CheckCircle2,
		ChevronRight,
		ClipboardList,
		LoaderCircle,
		PenLine,
		Truck
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import ConfirmationModal from '$lib/components/workflow/confirmation-modal.svelte';
	import SelectionModal from '$lib/components/workflow/selection-modal.svelte';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
	import WillCallSignatureModal from '$lib/components/workflow/will-call-signature-modal.svelte';
	import { completeLoadingEmail } from '$lib/loading-complete.remote';
	import { getDropsheetCategoryAvailability, getDropsheetStatus } from '$lib/dropsheets.remote';
	import { getLoaders } from '$lib/loaders.cached';
	import { getNumberOfDrops } from '$lib/load-view.remote';
	import { upsertLoaderSession } from '$lib/loader-session.remote';
	import { getWillCallSignature } from '$lib/will-call.remote';
	import { getWorkflowStatusClasses } from '$lib/workflow/status-tones';
	import type {
		DepartmentStatus,
		DropSheetCategoryAvailability,
		OperationalDepartment,
		WillCallSignatureRecord
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
	const COMPLETE_LOAD_PARTIAL_WARNING =
		'Notifications were already sent. Internal sync still needs attention. Do not resend.';

	let { data }: PageProps = $props();

	let currentLoader = $state<WorkflowLoaderSelection>(null);
	let activeDepartment = $state<OperationalDepartment | null>(null);
	let pendingDepartment = $state<OperationalDepartment | null>(null);
	let isLoaderModalOpen = $state(false);
	let isCompleteLoadingModalOpen = $state(false);
	let isCompletingLoad = $state(false);
	let completeLoadingError = $state<string | null>(null);
	let submitError = $state<string | null>(null);
	let isWillCallSignatureModalOpen = $state(false);
	let isLoadingWillCallSignature = $state(false);
	let willCallSignatureRecord = $state<WillCallSignatureRecord | null>(null);
	type LoaderSelection = Exclude<WorkflowLoaderSelection, null>;

	const statusQuery = $derived(getDropsheetStatus(data.dropSheetId));
	const categoryAvailabilityQuery = $derived(getDropsheetCategoryAvailability(data.dropSheetId));
	const loadersQuery = $derived.by(() => getLoaders(data.activeTarget));
	const currentStatus = $derived(statusQuery.current ?? null);
	const categoryAvailability = $derived(categoryAvailabilityQuery.current ?? null);
	const isStatusSectionLoading = $derived(statusQuery.loading && currentStatus === null);
	const isDepartmentsSectionLoading = $derived(
		(statusQuery.loading && currentStatus === null) ||
			(categoryAvailabilityQuery.loading && categoryAvailability === null)
	);
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
	const loaderOptions = $derived(
		(loadersQuery.current ?? data.loaders).map((loader) => ({
			id: loader.id,
			label: loader.name
		}))
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
		if (data.percentCompleted !== null) {
			searchParams.set('percentCompleted', String(data.percentCompleted));
		}
		if (data.returnTo) {
			searchParams.set('returnTo', data.returnTo);
		}
		if (data.willCall) {
			searchParams.set('willcall', 'true');
		}

		return resolve(`/select-category/${data.dropSheetId}?${searchParams.toString()}`);
	});
	const selectedLoaderLabel = $derived(currentLoader?.loaderName ?? 'Select loader');
	const canCompleteLoad = $derived(data.percentCompleted === 1);
	const isCompleteLoadReady = $derived(categoryAvailability?.allLoaded === true);
	const completeLoadAccentClasses = $derived(
		isCompleteLoadReady
			? 'border-emerald-500/80 text-emerald-600 bg-emerald-50/80'
			: 'border-rose-500/80 text-rose-600 bg-rose-50/80'
	);
	const blueBadgeClasses =
		'rounded-full bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] text-white shadow-[var(--shadow-primary)]';

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
		if (data.willCall) {
			searchParams.set('willcall', 'true');
		}

		return searchParams;
	}

	function openCompleteLoadingModal() {
		completeLoadingError = null;
		isCompleteLoadingModalOpen = true;
	}

	function closeCompleteLoadingModal() {
		if (isCompletingLoad) {
			return;
		}

		completeLoadingError = null;
		isCompleteLoadingModalOpen = false;
	}

	async function handleCompleteLoading() {
		if (isCompletingLoad) {
			return;
		}

		isCompletingLoad = true;
		completeLoadingError = null;

		try {
			const result = await completeLoadingEmail({ dropSheetId: data.dropSheetId });
			isCompleteLoadingModalOpen = false;

			if (result.partial) {
				toast.warning(COMPLETE_LOAD_PARTIAL_WARNING);
			}

			await goto(data.returnTo ?? '/dropsheets');
		} catch (error) {
			completeLoadingError =
				error instanceof Error ? error.message : 'Unable to complete loading.';
		} finally {
			isCompletingLoad = false;
		}
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
				loadNumber: data.loadNumber,
				returnTo: selectCategoryReturnHref
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

	async function openWillCallSignatureModal() {
		if (isLoadingWillCallSignature) {
			return;
		}

		isLoadingWillCallSignature = true;
		submitError = null;

		try {
			willCallSignatureRecord = await getWillCallSignature(data.dropSheetId);
			isWillCallSignatureModalOpen = true;
		} catch (error) {
			submitError =
				error instanceof Error ? error.message : 'Unable to load the current signature.';
		} finally {
			isLoadingWillCallSignature = false;
		}
	}
</script>

<div class="space-y-6 pb-32 xl:space-y-5">
	<div class="space-y-3 rounded-[2.5rem] bg-white/92 p-3 shadow-[var(--shadow-soft)] ring-1 ring-white/80">
		<LoadSummaryStrip
			testId="select-category-summary-grid"
			driverName={data.driverName}
			loadNumber={data.loadNumber}
			dropWeight={data.dropWeight}
		/>

		{#if statusQuery.error}
			<div class="rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700">
				<p class="font-semibold">Unable to load department status.</p>
				<p class="mt-1 leading-6">{statusQuery.error.message}</p>
			</div>
		{:else if isStatusSectionLoading}
			<div
				class="flex min-h-[6.5rem] items-center justify-center rounded-[1.75rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100"
				data-testid="select-category-status-loading-state"
			>
				<div class="flex flex-col items-center gap-3 text-center">
					<LoadingSpinner size="md" data-testid="select-category-status-loading-spinner" />
					<p class="text-sm font-semibold text-slate-950">Loading department status</p>
				</div>
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

	</div>

	<div
		data-testid="select-category-departments-card"
		class="space-y-4 rounded-[2.5rem] bg-white/92 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/80"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xl font-bold tracking-tight text-slate-950">Departments</h2>
		</div>

		{#if isDepartmentsSectionLoading}
			<div
				class="flex min-h-[18rem] items-center justify-center rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-slate-100"
				data-testid="select-category-departments-loading-state"
			>
				<div class="flex flex-col items-center gap-3 text-center">
					<LoadingSpinner size="lg" data-testid="select-category-departments-loading-spinner" />
					<p class="text-sm font-semibold text-slate-950">Loading category actions</p>
				</div>
			</div>
		{:else}
			<!-- Fixed three columns keep the department cards readable and left-to-right on the shared iPad. -->
			<div data-testid="select-category-actions" class="grid grid-cols-3 gap-3">
				{#if visibleDepartments.length === 0}
					<div class="col-span-3 rounded-[1.75rem] bg-white px-6 py-8 text-center shadow-[var(--shadow-soft)]">
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
						class="group flex min-h-[7rem] cursor-pointer flex-col gap-3 rounded-[1.75rem] bg-white p-4 text-left shadow-[var(--shadow-soft)] ring-1 ring-slate-200/80 transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-[var(--shadow-card)] enabled:active:translate-y-0 enabled:hover:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<div
							class="flex items-start justify-between gap-4"
							data-testid={`select-category-department-header-${entry.department}`}
						>
							<div class="flex items-center gap-3">
								<h3 class="text-[1.75rem] font-bold tracking-tight text-slate-950">{entry.department}</h3>
								<span class={`px-3 py-1.5 text-sm font-semibold ${blueBadgeClasses}`}>
									{formatDepartmentProgress(departmentProgress)}
								</span>
							</div>
							<div
								class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getWorkflowStatusClasses(departmentStatus)}`}
							>
								{departmentStatus ?? '--'}
							</div>
						</div>

						<div class="space-y-1.5">
							<div
								class="h-1.5 overflow-hidden rounded-full bg-surface-container-low"
								data-testid={`select-category-department-progress-row-${entry.department}`}
							>
								<div
									class="h-full rounded-full bg-emerald-500 transition-[width]"
									style={`width: ${departmentProgress === null ? 0 : Math.max(0, Math.min(1, departmentProgress)) * 100}%`}
								></div>
							</div>

							<div
								class="flex flex-wrap gap-1.5 text-[10px] text-slate-600"
								data-testid={`select-category-department-loader-row-${entry.department}`}
							>
								<span class={`px-2.5 py-1 font-medium ${blueBadgeClasses}`}>
									{selectedLoaderLabel}
								</span>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div
		data-testid="select-category-loader-roster"
		class="space-y-4 rounded-[2.5rem] bg-white/92 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/80"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xl font-bold tracking-tight text-slate-950">Loaders</h2>
		</div>

		{#if data.departmentLoadersError}
			<div
				data-testid="select-category-loader-roster-error"
				class="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
			>
				<p class="font-semibold">Unable to load loader roster.</p>
				{#if data.departmentLoadersError !== 'Unable to load loader roster.'}
					<p class="mt-1 leading-6">{data.departmentLoadersError}</p>
				{/if}
			</div>
		{:else}
			<!-- Fixed three columns keep the loader roster readable and left-to-right on the shared iPad. -->
			<div data-testid="select-category-loader-grid" class="grid grid-cols-3 gap-3">
				{#each LOADING_ENTRY_DEPARTMENTS as entry (entry.department)}
					{@const departmentLoaderNames = getDepartmentLoaderNames(entry.department)}
					<section
						data-testid={`select-category-loader-column-${entry.department}`}
						class="rounded-[1.5rem] bg-surface-container-low/60 p-4 shadow-[var(--shadow-soft)] ring-1 ring-white/70"
					>
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-base font-bold tracking-tight text-slate-950">{entry.department}</h3>
							<span class={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${blueBadgeClasses}`}>
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
									<span class={`px-3 py-2 text-sm font-medium ${blueBadgeClasses}`}>
										{loaderName}
									</span>
								{/each}
							</div>
						{/if}
					</section>
				{/each}
			</div>
		{/if}
	</div>

	<div
		data-testid="select-category-action-footer"
		class="sticky bottom-4 z-10 space-y-3 rounded-[2rem] bg-white/94 p-3 shadow-[0_-18px_50px_-30px_rgba(15,23,42,0.36)] ring-1 ring-white/80 backdrop-blur-xl"
	>
		<div
			data-testid="select-category-utility-actions"
			class={`grid gap-3 ${data.willCall ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
		>
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
				class="flex items-center justify-between gap-4 rounded-[1.6rem] bg-surface-container-low px-5 py-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
			>
				<div class="flex items-center gap-3">
					<span class="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
						<ClipboardList class="size-5" />
					</span>
					<div>
						<p class="text-base font-bold tracking-tight text-slate-950">Order Status</p>
					</div>
				</div>
				<ChevronRight class="size-5 text-slate-400" />
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
				class="flex items-center justify-between gap-4 rounded-[1.6rem] bg-surface-container-low px-5 py-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
			>
				<div class="flex items-center gap-3">
					<span class="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
						<Truck class="size-5" />
					</span>
					<div>
						<p class="text-base font-bold tracking-tight text-slate-950">Dropsheet</p>
					</div>
				</div>
				<ChevronRight class="size-5 text-slate-400" />
			</button>

			{#if data.willCall}
				<button
					type="button"
					onclick={openWillCallSignatureModal}
					class="flex items-center justify-between gap-4 rounded-[1.6rem] bg-surface-container-low px-5 py-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isLoadingWillCallSignature}
				>
					<div class="flex items-center gap-3">
						<span class="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
							<PenLine class="size-5" />
						</span>
						<div>
							<p class="text-base font-bold tracking-tight text-slate-950">Signature</p>
						</div>
					</div>
					{#if isLoadingWillCallSignature}
						<LoaderCircle class="size-5 animate-spin text-slate-400" />
					{:else}
						<ChevronRight class="size-5 text-slate-400" />
					{/if}
				</button>
			{/if}
		</div>

		{#if canCompleteLoad}
			<div data-testid="select-category-complete-action-row" class="flex justify-center">
				<button
					type="button"
					class="inline-flex min-h-16 min-w-[18rem] items-center justify-center gap-3 rounded-[1.6rem] bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-7 py-4 text-white shadow-[var(--shadow-primary)] transition hover:brightness-[1.03]"
					onclick={openCompleteLoadingModal}
				>
					<span
						class={`flex size-10 items-center justify-center rounded-full border-[3px] ${completeLoadAccentClasses}`}
					>
						<CheckCircle2 class="size-5" />
					</span>
					<span class="text-lg font-black uppercase tracking-[0.18em]">Complete Load</span>
				</button>
			</div>
		{/if}
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
		options={loaderOptions}
		loading={loadersQuery.loading}
		error={loadersQuery.error?.message ?? null}
		saving={pendingDepartment !== null}
		emptyMessage="No active loaders are available."
		onClose={closeLoaderModal}
		onPick={handleLoaderPick}
		onRefresh={() => void loadersQuery.refresh()}
		refreshing={loadersQuery.loading}
	/>
{/if}

{#if isCompleteLoadingModalOpen}
	<ConfirmationModal
		testId="complete-loading-modal"
		title="Complete Loading"
		description="Are you sure you want to complete this load? If you complete the load it will also send the email to the customer."
		confirmLabel="Confirm"
		pendingLabel="Completing loading"
		cancelLabel="Cancel"
		pending={isCompletingLoad}
		error={completeLoadingError}
		onCancel={closeCompleteLoadingModal}
		onConfirm={handleCompleteLoading}
	/>
{/if}

{#if isWillCallSignatureModalOpen && willCallSignatureRecord}
	<WillCallSignatureModal
		dropSheetId={data.dropSheetId}
		signatureRecord={willCallSignatureRecord}
		onClose={() => {
			isWillCallSignatureModalOpen = false;
			willCallSignatureRecord = null;
		}}
		onUploaded={async () => {
			willCallSignatureRecord = await getWillCallSignature(data.dropSheetId);
		}}
	/>
{/if}
