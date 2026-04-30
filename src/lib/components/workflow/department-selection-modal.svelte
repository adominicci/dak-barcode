<script lang="ts">
	import { Boxes, Package, ScanBarcode, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { WorkflowDepartment } from '$lib/workflow/stores';

	type DepartmentOption = {
		description: string;
		icon: typeof Boxes;
		value: NonNullable<WorkflowDepartment>;
	};

	let {
		onSelect,
		onClose
	}: {
		onSelect: (department: NonNullable<WorkflowDepartment>) => void;
		onClose: () => void;
	} = $props();

	let modalElement: HTMLElement | null = null;
	let closeButton: HTMLButtonElement | null = null;

	const departmentOptions: DepartmentOption[] = [
		{
			value: 'Wrap',
			description: 'Stage wrapped orders with the active floor queue.',
			icon: Boxes
		},
		{
			value: 'Parts',
			description: 'Prepare parts-for-the-day staging without a loader handoff.',
			icon: Package
		},
		{
			value: 'Roll',
			description: 'Keep roll scans fast and reset location after each success.',
			icon: ScanBarcode
		}
	];

	onMount(() => {
		modalElement?.focus();
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

<div class="ds-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
	<div
		data-testid="staging-department-gate"
		role="dialog"
		aria-modal="true"
		aria-labelledby="staging-department-gate-title"
		tabindex="-1"
		bind:this={modalElement}
		class="ds-modal w-full max-w-3xl overflow-hidden p-4"
		onkeydown={handleModalKeydown}
	>
		<div>
			<div class="flex items-start justify-between gap-4">
				<h2
					id="staging-department-gate-title"
					class="text-xl font-sans font-bold tracking-tight text-ds-gray-900"
				>
					Select department
				</h2>

				<button
					bind:this={closeButton}
					type="button"
					class="flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-ds-gray-600 transition hover:text-ds-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
					aria-label="Close department selector"
					onclick={handleClose}
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-5 grid gap-3">
				{#each departmentOptions as option (option.value)}
					{@const Icon = option.icon}
					<button
						type="button"
						class="ds-action-card group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white"
						onclick={() => onSelect(option.value)}
					>
						<div class="flex items-center gap-4">
							<div class="ds-action-card-icon flex shrink-0 items-center justify-center">
								<Icon class="size-[22px]" />
							</div>
							<div>
								<p class="text-lg font-semibold text-white">
									{option.value}
								</p>
								<p class="mt-0.5 text-sm leading-5 text-white/85">
									{option.description}
								</p>
							</div>
						</div>
						<span class="rounded-[var(--ds-radius-control)] border border-white/22 bg-white/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
							Select
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
