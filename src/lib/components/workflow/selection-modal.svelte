<script lang="ts">
	import { onMount } from 'svelte';
	import { LoaderCircle, RefreshCw, TriangleAlert, X } from '@lucide/svelte';

	type SelectionOption = {
		id: number;
		label: string;
	};

	let {
		title,
		description = null,
		options,
		loading = false,
		error = null,
		saving = false,
		refreshing = false,
		emptyMessage = 'No options available.',
		onClose,
		onPick,
		onRefresh = null
	}: {
		title: string;
		description?: string | null;
		options: SelectionOption[];
		loading?: boolean;
		error?: string | null;
		saving?: boolean;
		refreshing?: boolean;
		emptyMessage?: string;
		onClose: () => void;
		onPick: (option: SelectionOption) => void;
		onRefresh?: (() => void | Promise<void>) | null;
	} = $props();

	let modalElement: HTMLElement | null = null;
	let closeButton: HTMLButtonElement | null = null;
	const BLUE_CARD_CLASSES =
		'bg-[linear-gradient(135deg,rgba(0,88,188,0.98),rgba(0,112,235,0.98))] text-white shadow-[var(--shadow-primary)]';

	onMount(() => {
		closeButton?.focus();
	});

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
</script>

<div
	data-testid="selection-modal-backdrop"
	class="ds-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
>
	<div
		data-testid="selection-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="selection-modal-title"
		tabindex="-1"
		bind:this={modalElement}
		class="ds-modal flex h-[min(70vh,calc(100dvh-3rem))] w-full max-w-6xl flex-col overflow-hidden p-4"
		onkeydown={handleModalKeydown}
	>
		<div class="flex h-full min-h-0 flex-col">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1">
					<p class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
						Selection
					</p>
					<h2 id="selection-modal-title" class="text-2xl font-bold tracking-tight text-slate-950">
						{title}
					</h2>
					{#if description}
						<p class="text-sm leading-6 text-on-surface-variant">{description}</p>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					{#if onRefresh}
						<button
							type="button"
							class="flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
							aria-label="Refresh list"
							onclick={() => void onRefresh?.()}
							disabled={saving || refreshing}
						>
							<RefreshCw class={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
						</button>
					{/if}

					<button
						bind:this={closeButton}
						type="button"
						class="flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
						aria-label="Close selection modal"
						onclick={handleClose}
						disabled={saving}
					>
						<X class="size-5" />
					</button>
				</div>
			</div>

			{#if saving}
				<div class="mt-4 flex items-center gap-3 rounded-[var(--ds-radius-card)] bg-sky-50 px-4 py-4 text-sm text-sky-800">
					<LoaderCircle class="size-4 animate-spin" />
					<p>Updating selection...</p>
				</div>
			{/if}

			{#if error}
				<div class="mt-4 flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700">
					<TriangleAlert class="mt-0.5 size-4 shrink-0" />
					<p>{error}</p>
				</div>
			{/if}

			<div
				data-testid="selection-modal-scroll-area"
				class="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
			>
				{#if loading}
					<div class="flex min-h-[12rem] items-center justify-center rounded-[var(--ds-radius-card)] bg-white">
						<LoaderCircle class="size-7 animate-spin text-primary" />
					</div>
				{:else if options.length === 0}
					<div class="rounded-[var(--ds-radius-card)] bg-white px-5 py-8 text-center">
						<p class="text-lg font-semibold tracking-tight text-slate-950">{emptyMessage}</p>
					</div>
				{:else}
					<div data-testid="selection-modal-options-grid" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{#each options as option (option.id)}
							<button
								type="button"
								disabled={saving}
								class={`group flex min-h-20 items-center justify-center rounded-[var(--ds-radius-card)] px-4 py-4 text-center text-lg font-semibold tracking-tight transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${BLUE_CARD_CLASSES}`}
								onclick={() => onPick(option)}
							>
								<span class="text-balance">{option.label}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
