<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { LoaderCircle, MapPin, RefreshCw, TriangleAlert, X } from '@lucide/svelte';
	import { getDropArea } from '$lib/drop-areas.remote';
	import { getDropAreasByDepartment } from '$lib/drop-areas.cached';
	import type { Target } from '$lib/auth/types';
	import type { DropArea } from '$lib/types';
	import type {
		WorkflowDepartment,
		WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	let {
		department,
		mode = 'staging',
		target = null,
		onClose,
		onSelect
	}: {
		department: WorkflowDepartment;
		mode?: 'staging' | 'loading';
		target?: Target | null;
		onClose: () => void;
		onSelect: (dropArea: NonNullable<WorkflowDropAreaSelection>) => void;
	} = $props();

	let lookupValue = $state('');
	let lookupError = $state<string | null>(null);
	let isResolvingLookup = $state(false);
	let lookupInput: HTMLInputElement | null = null;
	let modalElement: HTMLElement | null = null;
	let activeLookupRequestToken = $state(0);

	const dropAreasQuery = $derived(
		department ? getDropAreasByDepartment(department, target) : null
	);
	const departmentSupportKey = {
		Wrap: 'supportsWrap',
		Roll: 'supportsRoll',
		Parts: 'supportsParts'
	} as const satisfies Record<NonNullable<WorkflowDepartment>, keyof DropArea>;
	const visibleDropAreas = $derived.by(() => {
		const availableDropAreas = dropAreasQuery?.current ?? [];
		return availableDropAreas.filter(isSelectableDropArea);
	});

	onMount(() => {
		lookupInput?.focus();
	});

	onDestroy(() => {
		invalidateLookupRequests();
	});

	function invalidateLookupRequests() {
		activeLookupRequestToken += 1;
	}

	function isSelectableDropArea(dropArea: DropArea) {
		if (department !== null && !dropArea[departmentSupportKey[department]]) {
			return false;
		}

		if (mode === 'loading') {
			return dropArea.supportsLoading && dropArea.supportsDriverLocation;
		}

		return true;
	}

	function commitSelection(dropArea: DropArea) {
		invalidateLookupRequests();
		isResolvingLookup = false;
		lookupError = null;
		lookupValue = '';
		onSelect({
			dropAreaId: dropArea.id,
			dropAreaLabel: dropArea.name
		});
	}

	function handleClose() {
		invalidateLookupRequests();
		isResolvingLookup = false;
		onClose();
	}

	function getFocusableElements() {
		if (!modalElement) {
			return [];
		}

		return Array.from(
			modalElement.querySelectorAll<HTMLElement>(
				'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => !element.hasAttribute('hidden') && element.tabIndex !== -1);
	}

	function handleModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
			return;
		}

		if (event.key !== 'Tab') {
			return;
		}

		const focusableElements = getFocusableElements();
		if (focusableElements.length === 0) {
			return;
		}

		const firstFocusableElement = focusableElements[0];
		const lastFocusableElement = focusableElements[focusableElements.length - 1];
		const activeElement = document.activeElement;

		if (event.shiftKey) {
			if (activeElement === firstFocusableElement) {
				event.preventDefault();
				lastFocusableElement?.focus();
			}

			return;
		}

		if (activeElement === lastFocusableElement) {
			event.preventDefault();
			firstFocusableElement?.focus();
		}
	}

	async function handleLookupSubmit(event?: SubmitEvent) {
		event?.preventDefault();

		const trimmedLookupValue = lookupValue.trim();
		if (!/^\d+$/.test(trimmedLookupValue)) {
			lookupError = 'Location is not valid.';
			return;
		}

		const parsedDropAreaId = Number.parseInt(trimmedLookupValue, 10);
		if (!Number.isInteger(parsedDropAreaId) || parsedDropAreaId <= 0) {
			lookupError = 'Location is not valid.';
			return;
		}

		lookupError = null;
		isResolvingLookup = true;
		const lookupRequestToken = activeLookupRequestToken + 1;
		activeLookupRequestToken = lookupRequestToken;

		try {
			const dropArea = await getDropArea(parsedDropAreaId);
			if (activeLookupRequestToken !== lookupRequestToken) {
				return;
			}

			if (!dropArea) {
				lookupError = 'Location is not valid.';
				return;
			}

			if (!isSelectableDropArea(dropArea)) {
				lookupError =
					mode === 'loading'
						? 'Location is not valid.'
						: 'This location does not support the selected department.';
				return;
			}

			commitSelection(dropArea);
		} catch (error) {
			if (activeLookupRequestToken !== lookupRequestToken) {
				return;
			}

			lookupError =
				error instanceof Error ? error.message : 'Unable to resolve this location right now.';
		} finally {
			if (activeLookupRequestToken === lookupRequestToken) {
				isResolvingLookup = false;
			}
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm sm:items-center"
>
	<div
		data-testid="staging-location-modal"
		role="dialog"
		aria-modal="true"
		aria-label="Staging location selector"
		tabindex="-1"
		bind:this={modalElement}
		class="h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
		onkeydown={handleModalKeydown}
	>
		<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex justify-end gap-2">
				{#if dropAreasQuery}
					<button
						type="button"
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={() => void dropAreasQuery.refresh()}
						aria-label="Refresh list"
						disabled={dropAreasQuery.loading}
					>
						<RefreshCw class={`size-4 ${dropAreasQuery.loading ? 'animate-spin' : ''}`} />
					</button>
				{/if}

				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900"
					onclick={handleClose}
					aria-label="Close location selector"
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-4 flex min-h-0 flex-1 flex-col gap-5 overflow-hidden">
				<form
					class="rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-soft)]"
					onsubmit={handleLookupSubmit}
				>
					<div class="flex flex-col gap-4 lg:flex-row lg:items-end">
						<div class="flex-1 space-y-2.5">
							<label class="ui-label px-1 text-xs" for="staging-location-lookup">Scan new location</label>
							<input
								id="staging-location-lookup"
								bind:value={lookupValue}
								bind:this={lookupInput}
								inputmode="numeric"
								placeholder="Enter location ID"
								class="h-16 w-full rounded-2xl border-none bg-surface-container-highest px-5 text-lg text-slate-950 outline-none ring-0 transition placeholder:text-on-surface-variant/55 focus:bg-white focus:ring-2 focus:ring-primary"
							/>
						</div>

						<button
							type="submit"
							disabled={isResolvingLookup}
							class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-0 bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto lg:min-w-44"
						>
							{#if isResolvingLookup}
								<LoaderCircle class="size-4 animate-spin" />
								Checking location...
							{:else}
								<MapPin class="size-4" />
								Set location
							{/if}
						</button>
					</div>

					{#if lookupError}
						<div class="mt-4 flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
							<TriangleAlert class="mt-0.5 size-4 shrink-0" />
							<p>{lookupError}</p>
						</div>
					{/if}
				</form>

				<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-soft)]">
					<div
						data-testid="staging-location-list-scroll-region"
						class="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
					>
						{#if department === null}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-on-surface-variant/70">
								<MapPin class="size-7 text-primary/70" />
								<p class="text-sm font-medium">Scan a driver location to continue.</p>
							</div>
						{:else if dropAreasQuery?.error}
							<div class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
								<TriangleAlert class="mt-0.5 size-4 shrink-0" />
								<p>{dropAreasQuery.error.message}</p>
							</div>
						{:else if dropAreasQuery?.loading}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<LoaderCircle class="size-7 animate-spin text-primary" />
								<p class="text-sm font-medium">Loading locations...</p>
							</div>
						{:else if visibleDropAreas.length === 0}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<MapPin class="size-7 text-primary/70" />
								<p class="text-sm font-medium">No locations are available for this department yet.</p>
							</div>
					{:else}
						<div
							data-testid="staging-location-modal-grid"
							class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
						>
							{#each visibleDropAreas as dropArea (dropArea.id)}
								<button
									type="button"
									class="ui-card ui-primary-gradient group flex min-h-[7.5rem] flex-col justify-center px-6 py-6 text-left text-white transition duration-200 hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0"
									onclick={() => commitSelection(dropArea)}
								>
									<p class="text-[1.7rem] font-semibold tracking-[-0.03em] text-white">
										{dropArea.name}
									</p>
								</button>
							{/each}
						</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
