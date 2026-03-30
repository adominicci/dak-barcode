<script lang="ts">
	import { LoaderCircle, Plus, UserRound } from '@lucide/svelte';
	import { createLoader } from '$lib/loaders.remote';
	import { getLoaders, invalidateLoadersCache } from '$lib/loaders.cached';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let loaderName = $state('');
	let statusMessage = $state<string | null>(null);
	let statusTone = $state<'success' | 'error' | null>(null);
	let isSubmitting = $state(false);
	const BLUE_CARD_CLASSES =
		'bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] text-white shadow-[var(--shadow-primary)]';

	const loadersQuery = getLoaders();
	const activeLoaders = $derived((loadersQuery.current ?? []).filter((loader) => loader.isActive));

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
			invalidateLoadersCache();
			await loadersQuery.refresh();
			loaderName = '';
			statusTone = 'success';
			statusMessage = `${trimmed} is now active and selectable.`;
		} catch (error) {
			statusTone = 'error';
			statusMessage = error instanceof Error ? error.message : 'Unable to insert loader.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-8">
	<!-- Page heading -->
	<h1 class="text-3xl font-bold tracking-tight text-slate-950">Add Loader</h1>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Active loader list -->
		<div class="bg-white rounded-[2rem] p-8 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
					<UserRound class="size-5" />
				</div>
				<div>
					<p class="ui-label text-xs">Selectables</p>
					<h2 class="text-lg font-bold tracking-tight text-slate-950">Active loader list</h2>
				</div>
			</div>

			{#if loadersQuery.error}
				<div class="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
					{loadersQuery.error.message}
				</div>
			{:else if activeLoaders.length === 0}
				<div class="rounded-2xl bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
					No active loaders are available yet. Insert one using the utility form.
				</div>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each activeLoaders as loader (loader.id)}
						<div class={`rounded-2xl p-5 ${BLUE_CARD_CLASSES}`}>
							<p class="ui-label text-xs text-white/70">Loader</p>
							<p class="mt-1 text-2xl font-bold tracking-tight text-white">
								{loader.name}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Insert form -->
		<div class="bg-white rounded-[2rem] p-8 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
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
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<p class="text-sm text-on-surface-variant">
						Added loaders become active immediately.
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

				{#if statusMessage}
					<div
						class={`rounded-2xl px-4 py-4 text-sm ${
							statusTone === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-primary/5 text-slate-700'
						}`}
					>
						{statusMessage}
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>
