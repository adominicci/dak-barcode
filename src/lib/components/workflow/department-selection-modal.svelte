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

<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm sm:items-center">
	<div
		data-testid="staging-department-gate"
		role="dialog"
		aria-modal="true"
		aria-labelledby="staging-department-gate-title"
		tabindex="-1"
		bind:this={modalElement}
		class="w-full max-w-3xl rounded-[2rem] bg-white/96 p-6 shadow-[0_36px_120px_-48px_rgba(15,23,42,0.45)] ring-1 ring-white/80"
		onkeydown={handleModalKeydown}
	>
		<div class="rounded-[1.75rem] bg-surface-container-low p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4">
				<h2
					id="staging-department-gate-title"
					class="text-3xl font-sans font-bold tracking-tight text-slate-950 sm:text-4xl"
				>
					Select department
				</h2>

				<button
					bind:this={closeButton}
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
					aria-label="Close department selector"
					onclick={handleClose}
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-8 grid gap-4">
				{#each departmentOptions as option (option.value)}
					{@const Icon = option.icon}
					<button
						type="button"
						class="group flex w-full items-center justify-between gap-5 rounded-[1.75rem] bg-white px-5 py-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:translate-y-0"
						onclick={() => onSelect(option.value)}
					>
						<div class="flex items-center gap-4">
							<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
								<Icon class="size-6" />
							</div>
							<div>
								<p class="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
									{option.value}
								</p>
								<p class="mt-1 text-sm leading-6 text-on-surface-variant">
									{option.description}
								</p>
							</div>
						</div>
						<span class="ui-pill px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
							Select
						</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
