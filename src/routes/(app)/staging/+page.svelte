<script lang="ts">
	import { onMount } from 'svelte';
	import { ScanBarcode, ChevronDown, MapPin } from '@lucide/svelte';
	import DepartmentSelectionModal from '$lib/components/workflow/department-selection-modal.svelte';
	import StagingLocationModal from '$lib/components/workflow/staging-location-modal.svelte';
	import StagingListPanel from '$lib/components/workflow/staging-list-panel.svelte';
	import { createStagingListController } from '$lib/workflow/staging-list-controller.svelte';
	import {
		workflowStores,
		type WorkflowDepartment,
		type WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	let selectedDepartment = $state<WorkflowDepartment>(null);
	let currentDropArea = $state<WorkflowDropAreaSelection>(null);
	let isDepartmentGateOpen = $state(true);
	let isLocationModalOpen = $state(false);
	let stagingListController = $state<ReturnType<typeof createStagingListController> | null>(null);

	onMount(() => {
		workflowStores.prepareForStagingEntry();
		stagingListController = createStagingListController();

		const unsubscribeDepartment = workflowStores.selectedDepartment.subscribe((department) => {
			selectedDepartment = department;
			isDepartmentGateOpen = department === null;
		});
		const unsubscribeDropArea = workflowStores.currentDropArea.subscribe((dropArea) => {
			currentDropArea = dropArea;
		});

		return () => {
			unsubscribeDepartment();
			unsubscribeDropArea();
			stagingListController?.destroy();
			stagingListController = null;
		};
	});

	function handleDepartmentSelect(department: NonNullable<WorkflowDepartment>) {
		if (selectedDepartment !== department) {
			workflowStores.clearCurrentDropArea();
		}

		workflowStores.setSelectedDepartment(department);
		isDepartmentGateOpen = false;
		isLocationModalOpen = false;
	}

	function handleLocationSelect(dropArea: NonNullable<WorkflowDropAreaSelection>) {
		workflowStores.setCurrentDropArea(dropArea);
		isLocationModalOpen = false;
	}
</script>

<div class="space-y-8">
	<!-- Scan & Filters (reference: staging-strict-v4) -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
		<div class="lg:col-span-6 space-y-2">
			<label class="ui-label text-xs px-1" for="scan-input">Scan Barcode</label>
			<div class="relative">
				<ScanBarcode class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary" />
				<input
					id="scan-input"
					data-testid="staging-scan-input"
					type="text"
					placeholder="Scan or type item barcode..."
					disabled={isDepartmentGateOpen}
					class="w-full h-16 pl-14 pr-6 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-lg placeholder:text-on-surface-variant/50"
				/>
			</div>
		</div>
		<div class="lg:col-span-3 space-y-2">
			<p class="ui-label text-xs px-1">Department</p>
			<button
				data-testid="staging-department-trigger"
				type="button"
				class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
				onclick={() => {
					isLocationModalOpen = false;
					isDepartmentGateOpen = true;
				}}
			>
				<span>{selectedDepartment ?? 'Select Department'}</span>
				<ChevronDown class="size-5 text-on-surface-variant" />
			</button>
		</div>
		<div class="lg:col-span-3 space-y-2">
			<p class="ui-label text-xs px-1">Location</p>
			<button
				data-testid="staging-location-trigger"
				type="button"
				disabled={isDepartmentGateOpen}
				class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
				onclick={() => (isLocationModalOpen = true)}
			>
				<span>{currentDropArea?.dropAreaLabel ?? 'Select Location'}</span>
				<MapPin class="size-5 text-on-surface-variant" />
			</button>
		</div>
	</section>

	<StagingListPanel
		department={selectedDepartment}
		items={stagingListController?.activeItems ?? []}
		loading={stagingListController?.activeLoading ?? false}
		error={stagingListController?.activeError ?? null}
	/>
</div>

{#if isDepartmentGateOpen}
	<DepartmentSelectionModal onSelect={handleDepartmentSelect} />
{/if}

{#if isLocationModalOpen && selectedDepartment}
	<StagingLocationModal
		department={selectedDepartment}
		onClose={() => (isLocationModalOpen = false)}
		onSelect={handleLocationSelect}
	/>
{/if}
