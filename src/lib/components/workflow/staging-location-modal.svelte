<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, MapPin, TriangleAlert, X } from '@lucide/svelte';
	import { getDropArea, getDropAreasByDepartment } from '$lib/drop-areas.remote';
	import type { DropArea } from '$lib/types';
	import type {
		WorkflowDepartment,
		WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	let {
		department,
		onClose,
		onSelect
	}: {
		department: NonNullable<WorkflowDepartment>;
		onClose: () => void;
		onSelect: (dropArea: NonNullable<WorkflowDropAreaSelection>) => void;
	} = $props();

	let lookupValue = $state('');
	let lookupError = $state<string | null>(null);
	let isResolvingLookup = $state(false);
	let lookupInput: HTMLInputElement | null = null;

	const dropAreasQuery = $derived(getDropAreasByDepartment(department));

	onMount(() => {
		lookupInput?.focus();
	});

	function commitSelection(dropArea: DropArea) {
		lookupError = null;
		lookupValue = '';
		onSelect({
			dropAreaId: dropArea.id,
			dropAreaLabel: dropArea.name
		});
	}

	async function handleLookupSubmit(event?: SubmitEvent) {
		event?.preventDefault();

		const parsedDropAreaId = Number.parseInt(lookupValue.trim(), 10);
		if (!Number.isInteger(parsedDropAreaId) || parsedDropAreaId <= 0) {
			lookupError = 'Location is not valid.';
			return;
		}

		lookupError = null;
		isResolvingLookup = true;

		try {
			const dropArea = await getDropArea(parsedDropAreaId);
			if (!dropArea) {
				lookupError = 'Location is not valid.';
				return;
			}

			commitSelection(dropArea);
		} catch (error) {
			lookupError =
				error instanceof Error ? error.message : 'Unable to resolve this location right now.';
		} finally {
			isResolvingLookup = false;
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
		class="max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
	>
		<div class="flex max-h-full flex-col rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex justify-end">
				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900"
					onclick={onClose}
					aria-label="Close location selector"
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-4 flex min-h-0 flex-1 flex-col gap-5">
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

				<div class="flex min-h-0 flex-1 flex-col rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-soft)]">
					<div
						data-testid="staging-location-list-scroll-region"
						class="mt-5 min-h-0 flex-1 overflow-y-auto pr-1"
					>
						{#if dropAreasQuery.error}
							<div class="flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
								<TriangleAlert class="mt-0.5 size-4 shrink-0" />
								<p>{dropAreasQuery.error.message}</p>
							</div>
						{:else if dropAreasQuery.loading}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<LoaderCircle class="size-7 animate-spin text-primary" />
								<p class="text-sm font-medium">Loading locations...</p>
							</div>
						{:else if !dropAreasQuery.current || dropAreasQuery.current.length === 0}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<MapPin class="size-7 text-primary/70" />
								<p class="text-sm font-medium">No locations are available for this department yet.</p>
							</div>
						{:else}
							<div
								data-testid="staging-location-modal-grid"
								class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
							>
								{#each dropAreasQuery.current as dropArea (dropArea.id)}
									<button
										type="button"
										class="group rounded-[1.4rem] bg-surface-container-lowest px-4 py-4 text-left shadow-[0_16px_34px_-26px_rgba(29,52,91,0.18)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
										onclick={() => commitSelection(dropArea)}
									>
										<div class="flex items-center justify-between gap-3">
											<div class="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-primary/8 text-primary transition group-hover:bg-primary group-hover:text-white">
												<MapPin class="size-4" />
											</div>
											<span class="ui-pill px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em]">
												Select
											</span>
										</div>
										<p class="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
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
