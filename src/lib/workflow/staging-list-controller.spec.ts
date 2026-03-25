import { writable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import type { StagingListItem } from '$lib/types';
import { createStagingListController } from './staging-list-controller.svelte';
import type { WorkflowDepartment } from './stores';

type MockStagingQuery = {
	current: StagingListItem[] | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn<() => Promise<void>>>;
};

function createQuery(
	current: StagingListItem[],
	overrides: Partial<MockStagingQuery> = {}
): MockStagingQuery {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
		...overrides
	};
}

describe('createStagingListController', () => {
	it('uses the general list for Wrap and Parts, and the roll list for Roll', () => {
		const selectedDepartment = writable<WorkflowDepartment>('Wrap');
		const generalQuery = createQuery([
			{
				lpidDetail: 12,
				partListId: 'WRAP-01',
				partListDescription: 'Wrap beam',
				orderSoNumber: 'SO-100',
				quantity: 3,
				dropAreaName: '',
				lpid: 99
			}
		]);
		const rollQuery = createQuery([
			{
				lpidDetail: 13,
				partListId: 'ROLL-01',
				partListDescription: 'Roll bundle',
				orderSoNumber: 'SO-101',
				quantity: 5,
				dropAreaName: 'R13',
				lpid: 100
			}
		]);

		const controller = createStagingListController({
			selectedDepartment,
			createGeneralQuery: () => generalQuery,
			createRollQuery: () => rollQuery
		});

		expect(controller.activeItems).toEqual(generalQuery.current);
		expect(controller.activeError).toBeNull();
		expect(controller.activeLoading).toBe(false);
		expect(controller.isRollDepartment).toBe(false);

		selectedDepartment.set('Parts');
		expect(controller.activeItems).toEqual(generalQuery.current);
		expect(controller.isRollDepartment).toBe(false);

		selectedDepartment.set('Roll');
		expect(controller.activeItems).toEqual(rollQuery.current);
		expect(controller.isRollDepartment).toBe(true);

		controller.destroy();
	});

	it('refreshes only the active query', async () => {
		const selectedDepartment = writable<WorkflowDepartment>('Wrap');
		const generalQuery = createQuery([]);
		const rollQuery = createQuery([]);

		const controller = createStagingListController({
			selectedDepartment,
			createGeneralQuery: () => generalQuery,
			createRollQuery: () => rollQuery
		});

		await controller.refreshActiveList();
		expect(generalQuery.refresh).toHaveBeenCalledTimes(1);
		expect(rollQuery.refresh).not.toHaveBeenCalled();

		selectedDepartment.set('Roll');

		await controller.refreshActiveList();
		expect(generalQuery.refresh).toHaveBeenCalledTimes(1);
		expect(rollQuery.refresh).toHaveBeenCalledTimes(1);

		controller.destroy();
	});
});
