<script lang="ts">
	import { LoaderCircle, Plus, UserRound } from '@lucide/svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import LoaderEditorModal from '$lib/components/workflow/loader-editor-modal.svelte';
	import { createLoader, updateLoader } from '$lib/loaders.remote';
	import { getLoaders, invalidateLoadersCache } from '$lib/loaders.cached';
	import type { Loader } from '$lib/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let loaderName = $state('');
	let statusMessage = $state<string | null>(null);
	let statusTone = $state<'success' | 'error' | null>(null);
	let isSubmitting = $state(false);
	let showInactiveLoaders = $state(false);
	let editorLoader = $state<Loader | null>(null);
	let editorError = $state<string | null>(null);
	let editorSaving = $state(false);
	const ACTIVE_CARD_CLASSES =
		'bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] text-white shadow-[var(--shadow-primary)]';
	const INACTIVE_CARD_CLASSES =
		'bg-white text-slate-700 ring-1 ring-slate-200 shadow-[var(--shadow-soft)]';

	const loadersQuery = $derived.by(() => getLoaders(data.activeTarget));
	const loaders = $derived(loadersQuery.current ?? []);
	const activeLoaders = $derived(loaders.filter((loader) => loader.isActive));
	const inactiveLoaders = $derived(loaders.filter((loader) => !loader.isActive));
	const visibleLoaders = $derived(
		showInactiveLoaders ? [...activeLoaders, ...inactiveLoaders] : activeLoaders
	);

	function openEditor(loader: Loader) {
		editorLoader = loader;
		editorError = null;
		editorSaving = false;
	}

	function closeEditor() {
		if (editorSaving) {
			return;
		}

		editorLoader = null;
		editorError = null;
		editorSaving = false;
	}

	async function handleInsertLoader(event: SubmitEvent) {
		event.preventDefault();

		const trimmed = loaderName.trim();

		if (!trimmed) {
			statusTone = 'error';
			statusMessage = 'Enter a loader name before inserting it.';
			return;
		}

		statusMessage = null;
		statusTone = null;
		isSubmitting = true;

		try {
			await createLoader(trimmed);
			invalidateLoadersCache(data.activeTarget);
			await loadersQuery.refresh();
			loaderName = '';
			statusTone = 'success';
			statusMessage = 'Loader created and marked active.';
		} catch (error) {
			statusTone = 'error';
			statusMessage = error instanceof Error ? error.message : 'Unable to insert loader.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleUpdateLoader(input: { loaderName: string; isActive: boolean }) {
		if (!editorLoader) {
			return;
		}

		editorSaving = true;
		editorError = null;

		try {
			await updateLoader({
				loaderId: editorLoader.id,
				loaderName: input.loaderName,
				isActive: input.isActive
			});
			invalidateLoadersCache(data.activeTarget);
			await loadersQuery.refresh();
			editorLoader = null;
			statusTone = 'success';
			statusMessage = 'Loader updated.';
		} catch (error) {
			editorError = error instanceof Error ? error.message : 'Unable to update loader.';
		} finally {
			editorSaving = false;
		}
	}
</script>

<div class="space-y-8">
	<h1 class="text-3xl font-bold tracking-tight text-slate-950">Add Loader</h1>

	{#if statusMessage}
		<div
			class={`rounded-[1.75rem] px-5 py-4 text-sm shadow-sm ${
				statusTone === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
			}`}
			role="status"
		>
			{statusMessage}
		</div>
	{/if}

	<div class="grid gap-8 lg:grid-cols-2">
		<div class="rounded-[2rem] bg-white p-8 shadow-sm">
			<div class="mb-6 flex items-start justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
						<UserRound class="size-5" />
					</div>
					<div>
						<p class="ui-label text-xs">Loader roster</p>
						<h2 class="text-lg font-bold tracking-tight text-slate-950">Active loader list</h2>
					</div>
				</div>

				<label
					class="flex items-center gap-3 rounded-full bg-surface-container-low px-3 py-2 text-sm font-medium text-slate-700"
				>
					<Checkbox
						bind:checked={showInactiveLoaders}
						onCheckedChange={(checked) => {
							if (checked) {
								invalidateLoadersCache(data.activeTarget);
								void (async () => {
									await loadersQuery.refresh();
									await loadersQuery.refresh();
								})();
							}
						}}
						aria-label="Show inactive loaders"
					/>
					<span>Show inactive loaders</span>
				</label>
			</div>

			{#if loadersQuery.error}
				<div class="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
					{loadersQuery.error.message}
				</div>
			{:else if visibleLoaders.length === 0}
				<div class="rounded-2xl bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
					{#if showInactiveLoaders}
						No loaders are available yet. Insert one using the utility form.
					{:else}
						No active loaders are available yet. Turn on inactive loaders to review the full roster.
					{/if}
				</div>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each visibleLoaders as loader (loader.id)}
						<button
							type="button"
							class={`rounded-2xl p-5 text-left transition duration-200 hover:-translate-y-0.5 ${
								loader.isActive ? ACTIVE_CARD_CLASSES : INACTIVE_CARD_CLASSES
							}`}
							onclick={() => openEditor(loader)}
						>
							{#if !loader.isActive}
								<div class="flex justify-end">
									<span
										class="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700"
									>
										Inactive
									</span>
								</div>
							{/if}

							<p
								class={`mt-1 text-2xl font-bold tracking-tight ${
									loader.isActive ? 'text-white' : 'text-slate-900'
								}`}
							>
								{loader.name}
							</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-[2rem] bg-white p-8 shadow-sm">
			<div class="mb-6 flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
					<Plus class="size-5" />
				</div>
				<div>
					<p class="ui-label text-xs">Utility form</p>
					<h2 class="text-lg font-bold tracking-tight text-slate-950">Insert loader</h2>
				</div>
			</div>

			<form class="space-y-5" onsubmit={handleInsertLoader}>
				<div class="space-y-2">
					<Label class="text-sm font-medium text-slate-700" for="loader-name">
						Loader name
					</Label>
					<Input
						id="loader-name"
						aria-label="Loader name"
						bind:value={loaderName}
						autocomplete="off"
						class="h-16 rounded-2xl border-none bg-surface-container-highest px-5 text-lg placeholder:text-on-surface-variant/50 focus-visible:ring-primary"
						placeholder="Enter loader name"
						disabled={isSubmitting}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<p class="text-sm text-on-surface-variant">
						New loaders become active immediately.
					</p>
					<Button
						class="h-12 rounded-full industrial-gradient border-0 px-6 text-sm font-bold text-white shadow-md hover:brightness-105"
						type="submit"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<LoaderCircle class="size-4 animate-spin" />
							Inserting...
						{:else}
							Insert loader
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>

	{#if editorLoader}
		{#key editorLoader.id}
			<LoaderEditorModal
				loader={editorLoader}
				error={editorError}
				saving={editorSaving}
				onClose={closeEditor}
				onSave={handleUpdateLoader}
			/>
		{/key}
	{/if}
</div>
