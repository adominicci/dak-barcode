import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { get } from 'svelte/store';
import { workflowStores } from '$lib/workflow/stores';

type StagingQueryState = {
	current: Array<{
		lpidDetail: number;
		partListId: string;
		partListDescription: string;
		orderSoNumber: string;
		quantity: number;
		dropAreaName: string;
		lpid: number;
	}> | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

const { getStagingPartsForDay, getStagingPartsForDayRoll } = vi.hoisted(() => ({
	getStagingPartsForDay: vi.fn<() => StagingQueryState>(),
	getStagingPartsForDayRoll: vi.fn<(orderSoNumber?: string | null) => StagingQueryState>()
}));

vi.mock('$lib/staging.remote', () => ({
	getStagingPartsForDay,
	getStagingPartsForDayRoll
}));

import StagingPage from './+page.svelte';

function createStagingQuery(
	current: NonNullable<StagingQueryState['current']>,
	overrides: Partial<StagingQueryState> = {}
): StagingQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

describe('staging page department gate', () => {
	beforeEach(() => {
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
		getStagingPartsForDay.mockReset();
		getStagingPartsForDayRoll.mockReset();
		getStagingPartsForDay.mockReturnValue(
			createStagingQuery([
				{
					lpidDetail: 20,
					partListId: 'PART-100',
					partListDescription: 'Wrap coil',
					orderSoNumber: 'SO-100',
					quantity: 4,
					dropAreaName: 'W12',
					lpid: 200
				},
				{
					lpidDetail: 21,
					partListId: 'PART-101',
					partListDescription: 'Parts shelf',
					orderSoNumber: 'SO-101',
					quantity: 7,
					dropAreaName: '',
					lpid: 201
				}
			])
		);
		getStagingPartsForDayRoll.mockReturnValue(
			createStagingQuery([
				{
					lpidDetail: 22,
					partListId: 'ROLL-100',
					partListDescription: 'Roll bundle',
					orderSoNumber: 'SO-200',
					quantity: 9,
					dropAreaName: '',
					lpid: 202
				}
			])
		);
	});

	it('shows the blocking department gate and keeps scan controls disabled on entry', async () => {
		render(StagingPage);

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		await expect.element(page.getByTestId('staging-scan-input')).toBeDisabled();
		await expect.element(page.getByTestId('staging-location-trigger')).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Wrap' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Parts' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Roll' })).toBeInTheDocument();
	});

	it('resets stale workflow state on entry and stores the new department choice', async () => {
		workflowStores.setCurrentLoader({ loaderId: 12, loaderName: 'Loader 12' });
		workflowStores.setSelectedDepartment('Parts');
		workflowStores.setCurrentDropArea({ dropAreaId: 5, dropAreaLabel: 'Drop 5' });
		workflowStores.setScannedText('STALE-SCAN');

		render(StagingPage);

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		expect(get(workflowStores.currentLoader)).toBeNull();
		expect(get(workflowStores.selectedDepartment)).toBeNull();
		expect(get(workflowStores.currentDropArea)).toBeNull();
		expect(get(workflowStores.scannedText)).toBe('');

		await page.getByRole('button', { name: 'Roll' }).click();

		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();
		expect(get(workflowStores.selectedDepartment)).toBe('Roll');
		await expect.element(page.getByTestId('staging-department-trigger')).toHaveTextContent('Roll');
		await expect.element(page.getByTestId('staging-scan-input')).not.toBeDisabled();
	});

	it('closes the gate when the current department is re-selected', async () => {
		render(StagingPage);
		const gate = page.getByTestId('staging-department-gate');

		await gate.getByRole('button', { name: /^Roll/ }).click();
		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();

		await page.getByTestId('staging-department-gate').getByRole('button', { name: /^Roll/ }).click();

		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();
		expect(get(workflowStores.selectedDepartment)).toBe('Roll');
		await expect.element(page.getByTestId('staging-scan-input')).not.toBeDisabled();
		await expect.element(page.getByTestId('staging-location-trigger')).not.toBeDisabled();
	});

	it('renders the general list for Wrap and Parts, then switches to the roll list', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();

		expect(getStagingPartsForDay).toHaveBeenCalledTimes(1);
		expect(getStagingPartsForDayRoll).toHaveBeenCalledWith(null);
		await expect.element(page.getByText('Wrap coil')).toBeInTheDocument();
		await expect.element(page.getByText('Parts shelf')).toBeInTheDocument();
		await expect.element(page.getByText('Roll bundle')).not.toBeInTheDocument();
		await expect.element(page.getByText('Part Number')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Parts' }).click();
		await expect.element(page.getByText('Wrap coil')).toBeInTheDocument();
		await expect.element(page.getByText('Parts shelf')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Roll' }).click();
		await expect.element(page.getByText('Roll bundle')).toBeInTheDocument();
		await expect.element(page.getByText('Wrap coil')).not.toBeInTheDocument();
		await expect.element(page.getByText('Part Number')).not.toBeInTheDocument();
	});

	it('shows scanned and pending row states based on the current location assignment', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();

		await expect
			.element(page.getByTestId('staging-list-row-200'))
			.toHaveTextContent('Staged');
		await expect
			.element(page.getByTestId('staging-list-row-201'))
			.toHaveTextContent('Pending');
		await expect.element(page.getByText('W12')).toBeInTheDocument();
		await expect.element(page.getByText('Unassigned')).toBeInTheDocument();
	});

	it('renders empty and error states from the active query', async () => {
		getStagingPartsForDay.mockReturnValueOnce(createStagingQuery([]));
		getStagingPartsForDayRoll.mockReturnValueOnce(
			createStagingQuery([], {
				error: new Error('Roll staging is unavailable.')
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await expect.element(page.getByText('No staging items are ready for this department yet.')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Roll' }).click();
		await expect.element(page.getByText('Roll staging is unavailable.')).toBeInTheDocument();
	});
});
