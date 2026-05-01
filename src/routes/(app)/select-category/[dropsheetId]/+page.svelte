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
	import { getOperatorErrorMessage } from '$lib/operator-error';
	import { readRemoteQuery } from '$lib/remote-query-read';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';
	import ConfirmationModal from '$lib/components/workflow/confirmation-modal.svelte';
	import DepartmentStatusPills from '$lib/components/workflow/department-status-pills.svelte';
	import SelectionModal from '$lib/components/workflow/selection-modal.svelte';
	import LoadSummaryStrip from '$lib/components/workflow/load-summary-strip.svelte';
	import WillCallSignatureModal from '$lib/components/workflow/will-call-signature-modal.svelte';
	import { completeLoadingEmail } from '$lib/loading-complete.remote';
	import { getDropsheetCategoryAvailability, getDropsheetStatus } from '$lib/dropsheets.remote';
	import { getLoaders } from '$lib/loaders.cached';
	import { getNumberOfDrops } from '$lib/load-view.remote';
	import { upsertLoaderSession } from '$lib/loader-session.remote';
	import { getWillCallSignature } from '$lib/will-call.remote';
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
		testId: string;
	};

	const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', {
		style: 'percent',
		maximumFractionDigits: 0
	});
	const COMPLETE_LOAD_PARTIAL_WARNING =
		'Notification was sent. Follow-up processing needs attention. Do not resend Complete Load.';

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

	const statusState = $derived.by(() => {
		const query = getDropsheetStatus(data.dropSheetId);
		return {
			current: query.current ?? null,
			error: query.error,
			loading: query.loading
		};
	});
	const categoryAvailabilityState = $derived.by(() => {
		const query = getDropsheetCategoryAvailability(data.dropSheetId);
		return {
			current: query.current ?? null,
			error: query.error,
			loading: query.loading
		};
	});
	const loadersState = $derived.by(() => {
		const query = getLoaders(data.activeTarget);
		return {
			current: query.current ?? data.loaders,
			error: query.error,
			loading: query.loading
		};
	});
	const currentStatus = $derived(statusState.current);
	const categoryAvailability = $derived(categoryAvailabilityState.current);
	const isStatusSectionLoading = $derived(statusState.loading && currentStatus === null);
	const isDepartmentsSectionLoading = $derived(
		(statusState.loading && currentStatus === null) ||
			(categoryAvailabilityState.loading && categoryAvailability === null)
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
		loadersState.current.map((loader) => ({
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
		searchParams.set('transfer', String(data.transfer));

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
	const blueBadgeClasses = 'rounded-full bg-ds-blue-500 text-white';
	const footerActionButtonClasses =
		'ds-control flex min-h-12 min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:border-ds-blue-400 hover:bg-ds-blue-50 active:scale-[0.97]';
	const footerActionIconClasses =
		'flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-ds-blue-50 text-ds-blue-600';
	const footerActionLabelClasses = 'truncate text-base font-semibold text-ds-gray-900';
	const footerGridClasses = $derived.by(() => {
		if (data.willCall && canCompleteLoad) {
			return 'sm:grid-cols-4';
		}

		if (data.willCall || canCompleteLoad) {
			return 'sm:grid-cols-3';
		}

		return 'sm:grid-cols-2';
	});

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
			{ label: 'Slit', value: status?.slit ?? null, testId: 'select-category-status-slit' },
			{ label: 'Trim', value: status?.trim ?? null, testId: 'select-category-status-trim' },
			{ label: 'Wrap', value: status?.wrap ?? null, testId: 'select-category-status-wrap' },
			{ label: 'Roll', value: status?.roll ?? null, testId: 'select-category-status-roll' },
			{ label: 'Parts', value: status?.parts ?? null, testId: 'select-category-status-parts' },
			{ label: 'Soffit', value: status?.soffit ?? null, testId: 'select-category-status-soffit' }
		];
	}

	function getStatusPillClass(value: string | null) {
		switch (value?.trim().toUpperCase()) {
			case 'NA':
			case 'DONE':
				return 'ds-status-done';
			case 'DUE':
				return 'ds-status-due';
			case 'WAIT':
			case 'BOT':
			case 'BOL':
				return 'ds-status-pending';
			default:
				return 'ds-status-neutral';
		}
	}

	function getResolvedReturnHref(returnTo: string | null | undefined, fallbackPath: '/dropsheets') {
		return returnTo ?? resolve(fallbackPath);
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
			const result = await completeLoadingEmail({
				dropSheetId: data.dropSheetId,
				transfer: data.transfer
			});
			isCompleteLoadingModalOpen = false;

			if (result.partial) {
				toast.warning(COMPLETE_LOAD_PARTIAL_WARNING);
			}

			await goto(getResolvedReturnHref(data.returnTo, '/dropsheets'));
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
			await readRemoteQuery(
				getNumberOfDrops({
					dropSheetId: data.dropSheetId,
					locationId
				})
			);

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
			willCallSignatureRecord = await readRemoteQuery(getWillCallSignature(data.dropSheetId));
			isWillCallSignatureModalOpen = true;
		} catch (error) {
			submitError =
				error instanceof Error ? error.message : 'Unable to load the current signature.';
		} finally {
			isLoadingWillCallSignature = false;
		}
	}
</script>

<div class="space-y-3 pb-4">
	<div class="space-y-2">
		<LoadSummaryStrip
			testId="select-category-summary-grid"
			driverName={data.driverName}
			loadNumber={data.loadNumber}
			dropWeight={data.dropWeight}
			variant="operational"
		/>

		{#if statusState.error}
			<div class="rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-3 text-sm text-rose-700">
				<p class="font-semibold">Unable to load department status.</p>
				<p class="mt-1 leading-6">
					{getOperatorErrorMessage(statusState.error, 'Unable to load department status.')}
				</p>
			</div>
		{:else if isStatusSectionLoading}
			<div
				class="flex min-h-24 items-center justify-center rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-ds-white p-4"
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
				class="rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-ds-white p-3"
			>
				<DepartmentStatusPills entries={statusEntries} testId="select-category-status-grid" />
			</div>
		{/if}

		{#if categoryAvailabilityState.error}
			<div class="rounded-[var(--ds-radius-card)] bg-amber-50 px-4 py-3 text-sm text-amber-800">
				Unable to filter departments by availability. Showing every loading department.
			</div>
		{/if}

	</div>

	<div
		data-testid="select-category-departments-card"
		class="ds-operational-panel space-y-3 p-4"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="ds-section-heading text-base">Departments</h2>
		</div>

		{#if isDepartmentsSectionLoading}
			<div
				class="flex min-h-48 items-center justify-center rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-ds-white p-6"
				data-testid="select-category-departments-loading-state"
			>
				<div class="flex flex-col items-center gap-3 text-center">
					<LoadingSpinner size="lg" data-testid="select-category-departments-loading-spinner" />
					<p class="text-sm font-semibold text-slate-950">Loading category actions</p>
				</div>
			</div>
		{:else}
			<div data-testid="select-category-actions" class="grid grid-cols-1 gap-2 md:grid-cols-3">
				{#if visibleDepartments.length === 0}
					<div class="ds-operational-card px-4 py-6 text-center md:col-span-3">
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
						class="ds-operational-card group flex min-h-[72px] cursor-pointer flex-col gap-2 p-3 text-left transition enabled:hover:border-ds-blue-400 enabled:hover:bg-ds-blue-50 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
					>
						<div
							class="flex items-start justify-between gap-4"
							data-testid={`select-category-department-header-${entry.department}`}
						>
							<div class="flex items-center gap-3">
								<h3 class="ds-operational-card-title text-lg">{entry.department}</h3>
								<span class={`px-3 py-1.5 text-[13px] font-semibold ${blueBadgeClasses}`}>
									{formatDepartmentProgress(departmentProgress)}
								</span>
							</div>
							<div
								class={`ds-status-pill h-8 min-w-16 px-3 ${getStatusPillClass(departmentStatus)}`}
							>
								{departmentStatus ?? '--'}
							</div>
						</div>

						<div class="space-y-1.5">
							<div
								class="h-2 overflow-hidden rounded-full bg-ds-gray-100"
								data-testid={`select-category-department-progress-row-${entry.department}`}
							>
								<div
									class="h-full rounded-full bg-ds-green-400 transition-[width]"
									style={`width: ${departmentProgress === null ? 0 : Math.max(0, Math.min(1, departmentProgress)) * 100}%`}
								></div>
							</div>

							<div
								class="flex flex-wrap gap-2 text-[13px] text-ds-gray-600"
								data-testid={`select-category-department-loader-row-${entry.department}`}
							>
								<span class="rounded-full bg-ds-blue-50 px-3 py-1.5 text-[13px] font-semibold text-ds-blue-600">
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
		class="ds-operational-panel space-y-3 p-4"
	>
		<div class="flex items-center justify-between gap-3">
			<h2 class="ds-section-heading text-base">Loaders</h2>
		</div>

		{#if data.departmentLoadersError}
			<div
				data-testid="select-category-loader-roster-error"
				class="rounded-[var(--ds-radius-card)] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
			>
				<p class="font-semibold">Unable to load loader roster.</p>
				{#if data.departmentLoadersError !== 'Unable to load loader roster.'}
					<p class="mt-1 leading-6">{data.departmentLoadersError}</p>
				{/if}
			</div>
		{:else}
			<div data-testid="select-category-loader-grid" class="grid grid-cols-3 gap-2">
				{#each LOADING_ENTRY_DEPARTMENTS as entry (entry.department)}
					{@const departmentLoaderNames = getDepartmentLoaderNames(entry.department)}
					<section
						data-testid={`select-category-loader-column-${entry.department}`}
						class="rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-ds-gray-100 p-3"
					>
						<div class="flex items-center justify-between gap-3">
							<h3 class="ds-operational-subtitle text-sm">{entry.department}</h3>
							<span class={`px-2.5 py-1 text-xs font-semibold ${blueBadgeClasses}`}>
								{departmentLoaderNames.length}
							</span>
						</div>

						{#if departmentLoaderNames.length === 0}
							<div class="mt-3 rounded-[var(--ds-radius-card)] border border-dashed border-ds-gray-300 bg-ds-white px-3 py-4 text-[13px] text-ds-gray-600">
								No loaders yet for this department.
							</div>
						{:else}
							<div class="mt-3 flex flex-wrap gap-2">
								{#each departmentLoaderNames as loaderName (loaderName)}
									<span class={`px-3 py-2 text-[13px] font-medium ${blueBadgeClasses}`}>
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
		class="ds-operational-panel p-2"
	>
		<div
			data-testid="select-category-utility-actions"
			class={`grid gap-2 ${footerGridClasses}`}
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
				class={footerActionButtonClasses}
			>
				<div class="flex min-w-0 items-center gap-2">
					<span class={footerActionIconClasses}>
						<ClipboardList class="size-4.5" />
					</span>
					<div class="min-w-0">
						<p class={footerActionLabelClasses}>Order Status</p>
					</div>
				</div>
				<ChevronRight class="size-4.5 shrink-0 text-ds-gray-600" />
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
				class={footerActionButtonClasses}
			>
				<div class="flex min-w-0 items-center gap-2">
					<span class={footerActionIconClasses}>
						<Truck class="size-4.5" />
					</span>
					<div class="min-w-0">
						<p class={footerActionLabelClasses}>Dropsheet</p>
					</div>
				</div>
				<ChevronRight class="size-4.5 shrink-0 text-ds-gray-600" />
			</button>

			{#if data.willCall}
				<button
					type="button"
					onclick={openWillCallSignatureModal}
					class={`${footerActionButtonClasses} disabled:cursor-not-allowed disabled:opacity-60`}
					disabled={isLoadingWillCallSignature}
				>
					<div class="flex min-w-0 items-center gap-2">
						<span class={footerActionIconClasses}>
							<PenLine class="size-4.5" />
						</span>
						<div class="min-w-0">
							<p class={footerActionLabelClasses}>Signature</p>
						</div>
					</div>
					{#if isLoadingWillCallSignature}
						<LoaderCircle class="size-4.5 shrink-0 animate-spin text-ds-gray-600" />
					{:else}
						<ChevronRight class="size-4.5 shrink-0 text-ds-gray-600" />
					{/if}
				</button>
			{/if}

			{#if canCompleteLoad}
				<button
					type="button"
					class="flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-[var(--ds-radius-card)] bg-ds-blue-500 px-3 py-2.5 text-white transition hover:brightness-[1.03] active:scale-[0.97]"
					onclick={openCompleteLoadingModal}
				>
					<span
						class={`flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] ${completeLoadAccentClasses}`}
					>
						<CheckCircle2 class="size-4.5" />
					</span>
					<span class="truncate text-sm font-black uppercase tracking-[0.12em]">Complete Load</span>
				</button>
			{/if}
		</div>
	</div>

	{#if submitError}
		<div class="rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-3 text-sm text-rose-700">
			<p>{submitError}</p>
		</div>
	{/if}
</div>

{#if isLoaderModalOpen && activeDepartment}
	<SelectionModal
		title={`Select loader for ${activeDepartment}`}
		description={`The current loader is ${selectedLoaderLabel}. Tap a loader to keep the workflow sticky and start ${activeDepartment.toLowerCase()} immediately.`}
		options={loaderOptions}
		loading={loadersState.loading}
		error={loadersState.error ? getOperatorErrorMessage(loadersState.error, 'Unable to load options.') : null}
		saving={pendingDepartment !== null}
		emptyMessage="No active loaders are available."
		onClose={closeLoaderModal}
		onPick={handleLoaderPick}
		onRefresh={() => void getLoaders(data.activeTarget).refresh()}
		refreshing={loadersState.loading}
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
			willCallSignatureRecord = await readRemoteQuery(getWillCallSignature(data.dropSheetId));
		}}
	/>
{/if}
