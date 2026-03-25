<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, MapPin, ScanSearch, TriangleAlert, X } from '@lucide/svelte';
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
		aria-labelledby="staging-location-modal-title"
		class="w-full max-w-5xl rounded-[2rem] bg-white/96 p-6 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80"
	>
		<div class="rounded-[1.75rem] bg-surface-container-low p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-3">
					<p class="ui-label">Staging location</p>
					<h2
						id="staging-location-modal-title"
						class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
					>
						Select location
					</h2>
					<p class="max-w-2xl text-sm leading-7 text-on-surface-variant">
						Choose a valid {department} drop area or scan the numeric location to keep staging
						moving without leaving the page.
					</p>
				</div>

				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900"
					onclick={onClose}
					aria-label="Close location selector"
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
				<form
					class="rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-soft)]"
					onsubmit={handleLookupSubmit}
				>
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
							<ScanSearch class="size-5" />
						</div>
						<div>
							<p class="ui-label text-xs">Scanner lookup</p>
							<p class="text-lg font-semibold tracking-tight text-slate-950">Resolve by number</p>
						</div>
					</div>

					<div class="mt-5 space-y-2.5">
						<label class="ui-label text-xs px-1" for="staging-location-lookup">Scan new location</label>
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
						class="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-0 bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
					>
						{#if isResolvingLookup}
							<LoaderCircle class="size-4 animate-spin" />
							Checking location...
						{:else}
							<MapPin class="size-4" />
							Set location
						{/if}
					</button>

					{#if lookupError}
						<div class="mt-4 flex gap-3 rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
							<TriangleAlert class="mt-0.5 size-4 shrink-0" />
							<p>{lookupError}</p>
						</div>
					{/if}
				</form>

				<div class="rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow-soft)]">
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="ui-label text-xs">Available drop areas</p>
							<p class="text-lg font-semibold tracking-tight text-slate-950">
								{department} locations
							</p>
						</div>
						<span class="ui-pill px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
							{department}
						</span>
					</div>

					<div class="mt-5">
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
							<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
										<p class="mt-1 text-sm text-on-surface-variant">
											Drop area ID {dropArea.id}
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
