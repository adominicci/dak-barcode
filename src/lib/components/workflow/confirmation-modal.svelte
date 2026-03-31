<script lang="ts">
	import { onMount } from 'svelte';
	import { TriangleAlert, X } from '@lucide/svelte';
	import LoadingSpinner from '$lib/components/ui/loading-spinner.svelte';

	let {
		title,
		description,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		pending = false,
		error = null,
		testId = 'confirmation-modal',
		onCancel,
		onConfirm
	}: {
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		pending?: boolean;
		error?: string | null;
		testId?: string;
		onCancel: () => void;
		onConfirm: () => void | Promise<void>;
	} = $props();

	let modalElement: HTMLElement | null = null;
	let cancelButton: HTMLButtonElement | null = null;
	const testIdBase = $derived(testId.endsWith('-modal') ? testId.slice(0, -6) : testId);

	onMount(() => {
		cancelButton?.focus();
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

	function handleCancel() {
		if (pending) {
			return;
		}

		onCancel();
	}

	function handleModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancel();
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

<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
	<div
		bind:this={modalElement}
		data-testid={testId}
		role="dialog"
		aria-modal="true"
		aria-labelledby={`${testId}-title`}
		tabindex="-1"
		class="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
		onkeydown={handleModalKeydown}
	>
		<div class="rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1.5">
					<p class="ui-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
						Confirmation
					</p>
					<h2 id={`${testId}-title`} class="text-2xl font-bold tracking-tight text-slate-950">
						{title}
					</h2>
					<p class="text-sm leading-6 text-on-surface-variant">{description}</p>
				</div>

				<button
					bind:this={cancelButton}
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
					aria-label="Close confirmation modal"
					onclick={handleCancel}
					disabled={pending}
				>
					<X class="size-5" />
				</button>
			</div>

			{#if error}
				<div
					data-testid={`${testIdBase}-error`}
					class="mt-5 flex gap-3 rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm text-rose-700"
				>
					<TriangleAlert class="mt-0.5 size-4 shrink-0" />
					<p>{error}</p>
				</div>
			{/if}

			<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button
					type="button"
					class="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-700 shadow-[var(--shadow-soft)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
					onclick={handleCancel}
					disabled={pending}
				>
					{cancelLabel}
				</button>

				<button
					type="button"
					class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
					onclick={() => void onConfirm()}
					disabled={pending}
				>
					{#if pending}
						<LoadingSpinner
							size="sm"
							label="Completing loading"
							data-testid={`${testIdBase}-confirm-spinner`}
						/>
					{/if}
					<span>{confirmLabel}</span>
				</button>
			</div>
		</div>
	</div>
</div>
