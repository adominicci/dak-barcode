<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		description = null,
		testId,
		onClose,
		children
	}: {
		title: string;
		description?: string | null;
		testId: string;
		onClose: () => void;
		children?: Snippet;
	} = $props();

	let modalElement: HTMLElement | null = null;

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
			onClose();
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
	data-testid={`${testId}-backdrop`}
	class="ds-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
>
	<div
		data-testid={testId}
		role="dialog"
		aria-modal="true"
		aria-labelledby={`${testId}-title`}
		tabindex="-1"
		bind:this={modalElement}
		class="ds-modal flex w-full max-w-6xl flex-col overflow-hidden p-4"
		onkeydown={handleModalKeydown}
	>
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0 space-y-1">
				<h2 id={`${testId}-title`} class="text-xl font-bold tracking-tight text-ds-gray-900">
					{title}
				</h2>
				{#if description}
					<p class="text-sm leading-5 text-ds-gray-600">{description}</p>
				{/if}
			</div>
			<button
				type="button"
				class="inline-flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-ds-gray-600 transition hover:text-ds-gray-900"
				aria-label="Close"
				onclick={onClose}
			>
				<X class="size-5" />
			</button>
		</div>
		<div class="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
			{@render children?.()}
		</div>
	</div>
</div>
