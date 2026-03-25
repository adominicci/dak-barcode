<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { AlertCircle, LoaderCircle, PackageCheck, UserRound } from '@lucide/svelte';
	import { getOnLoadStatusAllDepts } from '$lib/department-status.remote';
	import { upsertLoaderSession } from '$lib/loader-session.remote';
	import { getNumberOfDrops } from '$lib/load-view.remote';
	import type { DepartmentStatus, OperationalDepartment } from '$lib/types';
	import { LOADING_ENTRY_DEPARTMENTS, getLoadingEntryDepartment } from '$lib/workflow/loading-entry';
	import { workflowStores } from '$lib/workflow/stores';
	import type { PageProps } from './$types';

	type StatusTone = 'neutral' | 'ready' | 'done' | 'warning' | 'danger';

	type StatusEntry = {
		label: string;
		value: string | null;
	};

	let { data }: PageProps = $props();

	let selectedLoaderId = $state('');
	let pendingDepartment = $state<OperationalDepartment | null>(null);
	let submitError = $state<string | null>(null);

	let statusQuery = $derived(getOnLoadStatusAllDepts(data.dropSheetId));
	let currentStatus = $derived(statusQuery.current ?? null);
	let selectedLoader = $derived(
		data.loaders.find((loader) => String(loader.id) === selectedLoaderId) ?? null
	);
	let statusEntries = $derived(byStatusDisplay(currentStatus));

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

<div class="space-y-8">
	<!-- Page heading -->
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-slate-950">Select Category</h2>
			<p class="mt-2 text-sm text-on-surface-variant">
				Dropsheet #{data.dropSheetId} &middot; {data.loaders.length} active loader{data.loaders.length !== 1 ? 's' : ''}
			</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div class="rounded-2xl bg-surface-container-low px-5 py-4">
				<p class="ui-label text-xs">Dropsheet</p>
				<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">{data.dropSheetId}</p>
			</div>
			<div class="rounded-2xl bg-surface-container-low px-5 py-4">
				<p class="ui-label text-xs">Active loaders</p>
				<p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">{data.loaders.length}</p>
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
		<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
			<div class="grid grid-cols-6 overflow-hidden rounded-xl">
				{#each statusEntries as entry (entry.label)}
					<div class="flex flex-col">
						<span class="text-[11px] font-bold text-center py-1.5 text-on-surface-variant uppercase">
							{entry.label}
						</span>
						<div class={`${getToneClasses(getTone(entry.value))} text-[10px] font-bold py-1.5 text-center border-l border-white/20 first:border-l-0`}>
							{entry.value ?? '--'}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Loader selector + Department buttons -->
	<div class="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
		<!-- Loader selector -->
		<div class="bg-white rounded-[2rem] p-6 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
					<UserRound class="size-5" />
				</div>
				<div>
					<p class="ui-label text-xs">Loader</p>
					<h3 class="text-lg font-bold tracking-tight text-slate-950">Assign operator</h3>
				</div>
			</div>

			<div class="space-y-3">
				<label class="ui-label text-xs block" for="loader-select">Loader</label>
				<select
					id="loader-select"
					aria-label="Loader"
					bind:value={selectedLoaderId}
					class="h-16 w-full rounded-2xl bg-surface-container-low px-4 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-primary"
				>
					<option value="">Choose a loader</option>
					{#each data.loaders as loader (loader.id)}
						<option value={String(loader.id)}>{loader.name}</option>
					{/each}
				</select>
				<p class="text-sm text-on-surface-variant">
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
		<div class="grid gap-4">
			{#each LOADING_ENTRY_DEPARTMENTS as entry (entry.department)}
				{@const departmentStatus = getDepartmentStatus(currentStatus, entry.department)}
				<button
					type="button"
					onclick={() => beginLoading(entry.department)}
					disabled={!selectedLoader || pendingDepartment !== null}
					class="group flex items-center justify-between gap-6 rounded-[2rem] bg-white p-6 text-left shadow-sm transition-all enabled:hover:shadow-md enabled:hover:-translate-y-0.5 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
				>
					<div class="space-y-1">
						<h3 class="text-2xl font-bold tracking-tight text-slate-950">
							{entry.department}
						</h3>
						<p class="text-sm text-on-surface-variant">{entry.description}</p>
						<div class="flex flex-wrap gap-2 pt-2 text-xs">
							<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
								Location {entry.locationId}
							</span>
							<span class="rounded-full bg-surface-container-low px-3 py-1 font-medium text-slate-600">
								{selectedLoader ? `Loader ${selectedLoader.name}` : 'Select loader first'}
							</span>
						</div>
					</div>

					<div class="flex items-center gap-4">
						<div class={`rounded-full px-3 py-1.5 text-sm font-semibold ${getToneClasses(getTone(departmentStatus))}`}>
							{departmentStatus ?? '--'}
						</div>
						{#if pendingDepartment === entry.department}
							<LoaderCircle class="size-5 animate-spin text-primary" />
						{:else}
							<PackageCheck class="size-5 text-primary" />
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
