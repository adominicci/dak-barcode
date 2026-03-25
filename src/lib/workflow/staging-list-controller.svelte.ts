import { get } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { StagingListItem } from '$lib/types';
import { getStagingPartsForDay, getStagingPartsForDayRoll } from '$lib/staging.remote';
import { workflowStores, type WorkflowDepartment } from '$lib/workflow/stores';

type StagingListQuery = {
	current: StagingListItem[] | null | undefined;
	loading: boolean;
	error: Error | null | undefined;
	refresh: () => Promise<unknown>;
};

type CreateStagingListControllerOptions = {
	selectedDepartment?: Readable<WorkflowDepartment>;
	createGeneralQuery?: () => StagingListQuery;
	createRollQuery?: () => StagingListQuery;
};

export function createStagingListController({
	selectedDepartment = workflowStores.selectedDepartment,
	createGeneralQuery = () => getStagingPartsForDay(),
	createRollQuery = () => getStagingPartsForDayRoll(null)
}: CreateStagingListControllerOptions = {}) {
	let activeDepartment = $state(get(selectedDepartment));
	const generalQuery = createGeneralQuery();
	const rollQuery = createRollQuery();

	const unsubscribe = selectedDepartment.subscribe((department) => {
		activeDepartment = department;
	});

	const activeQuery = $derived.by(() => {
		if (activeDepartment === 'Roll') {
			return rollQuery;
		}

		if (activeDepartment === 'Wrap' || activeDepartment === 'Parts') {
			return generalQuery;
		}

		return null;
	});

	const activeItems = $derived(activeQuery?.current ?? []);
	const activeLoading = $derived(activeQuery?.loading ?? false);
	const activeError = $derived(activeQuery?.error ?? null);
	const isRollDepartment = $derived(activeDepartment === 'Roll');

	return {
		get activeDepartment() {
			return activeDepartment;
		},
		get activeQuery() {
			return activeQuery;
		},
		get activeItems() {
			return activeItems;
		},
		get activeLoading() {
			return activeLoading;
		},
		get activeError() {
			return activeError;
		},
		get isRollDepartment() {
			return isRollDepartment;
		},
		async refreshActiveList() {
			if (!activeQuery) {
				return;
			}

			await activeQuery.refresh();
		},
		destroy() {
			unsubscribe();
		}
	};
}
