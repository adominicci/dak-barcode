<script lang="ts">
	import { Boxes, Package, ScanBarcode } from '@lucide/svelte';
	import type { WorkflowDepartment } from '$lib/workflow/stores';

	type DepartmentOption = {
		description: string;
		icon: typeof Boxes;
		value: NonNullable<WorkflowDepartment>;
	};

	let { onSelect }: { onSelect: (department: NonNullable<WorkflowDepartment>) => void } = $props();

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
</script>

<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm sm:items-center">
	<div
		data-testid="staging-department-gate"
		role="dialog"
		aria-modal="true"
		aria-labelledby="staging-department-gate-title"
		class="w-full max-w-3xl rounded-[2rem] bg-white/96 p-6 shadow-[0_36px_120px_-48px_rgba(15,23,42,0.45)] ring-1 ring-white/80"
	>
		<div class="rounded-[1.75rem] bg-surface-container-low p-6 sm:p-8">
			<p class="ui-label">Staging entry</p>
			<h2
				id="staging-department-gate-title"
				class="mt-3 font-serif text-3xl tracking-[-0.03em] text-slate-950 sm:text-4xl"
			>
				Choose the staging department before scanning.
			</h2>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">
				Staging starts with a clean session every time. Pick the department now so the page can
				lock into the right workflow without introducing a loader step.
			</p>

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
