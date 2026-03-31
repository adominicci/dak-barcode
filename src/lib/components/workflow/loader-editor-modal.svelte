<script lang="ts">
	import { LoaderCircle, X } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Loader } from '$lib/types';

	type LoaderEditorInput = {
		loaderName: string;
		isActive: boolean;
	};

	let {
		loader,
		saving = false,
		error = null,
		onClose,
		onSave
	}: {
		loader: Loader;
		saving?: boolean;
		error?: string | null;
		onClose: () => void;
		onSave: (input: LoaderEditorInput) => void | Promise<void>;
	} = $props();

	let modalElement: HTMLElement | null = null;
	let loaderNameInput = $state<HTMLInputElement | null>(null);
	let activeInput = $state<HTMLInputElement | null>(null);
	let localError = $state<string | null>(null);

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

	function handleClose() {
		if (saving) {
			return;
		}

		onClose();
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const trimmedName = loaderNameInput?.value.trim() ?? '';
		if (!trimmedName) {
			localError = 'Enter a loader name before saving.';
			return;
		}

		localError = null;
		await onSave({
			loaderName: trimmedName,
			isActive: activeInput?.checked ?? false
		});
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm sm:items-center"
>
	<div
		data-testid="loader-editor-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="loader-editor-title"
		tabindex="-1"
		bind:this={modalElement}
		class="h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
		onkeydown={handleModalKeydown}
	>
		<div class="flex h-full min-h-0 flex-col rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1">
					<p class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
						Loader details
					</p>
					<h2 id="loader-editor-title" class="text-2xl font-bold tracking-tight text-slate-950">
						Edit loader
					</h2>
					<p class="text-sm leading-6 text-on-surface-variant">
						Change the loader name or mark the loader inactive.
					</p>
				</div>

				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
					aria-label="Close loader editor"
					onclick={handleClose}
					disabled={saving}
				>
					<X class="size-5" />
				</button>
			</div>

			{#if error || localError}
				<div
					class="mt-5 rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm text-rose-700"
					role="alert"
				>
					{error ?? localError}
				</div>
			{/if}

			<form class="mt-6 flex min-h-0 flex-1 flex-col gap-5" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label class="text-sm font-medium text-slate-700" for="loader-editor-name">
						Loader name
					</Label>
					<Input
						id="loader-editor-name"
						bind:ref={loaderNameInput}
						autocomplete="off"
						autofocus
						defaultValue={loader.name}
						class="h-16 rounded-2xl border-none bg-surface-container-highest px-5 text-lg placeholder:text-on-surface-variant/50 focus-visible:ring-primary"
						placeholder="Enter loader name"
						disabled={saving}
					/>
				</div>

				<div class="flex items-center justify-between gap-4 rounded-[1.5rem] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
					<div class="space-y-1">
						<p class="text-sm font-medium text-slate-900">Active loader</p>
						<p class="text-sm leading-6 text-on-surface-variant">
							Inactive loaders stay hidden from active picker flows.
						</p>
					</div>

					<input
						bind:this={activeInput}
						aria-label="Active loader"
						class="size-5 rounded-md border-slate-300 text-primary shadow-sm focus:ring-2 focus:ring-primary/30"
						defaultChecked={loader.isActive}
						disabled={saving}
						type="checkbox"
					/>
				</div>

				<div class="mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						class="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-700 shadow-[var(--shadow-soft)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={handleClose}
						disabled={saving}
					>
						Cancel
					</button>

					<button
						type="submit"
						class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
						disabled={saving}
					>
						{#if saving}
							<LoaderCircle class="size-4 animate-spin" />
							Saving...
						{:else}
							Save changes
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
