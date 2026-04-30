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
		class="ds-modal flex w-full max-w-6xl flex-col overflow-hidden p-4"
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
