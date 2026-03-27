import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { workflowStores } from '$lib/workflow/stores';

type QueryState<T> = {
	current: T;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type LegacySequence = {
	dropSheetId: number;
	dropSheetCustId: number;
	sequence: string;
	loadNumber: string;
	driver: string;
	status: string | null;
};

type LegacyMoveRow = {
	dropSheetCustId: number;
	partListId: string;
	qtyDet: string;
	labelNumber: number;
	scanned: boolean;
	orderSoNumber: string;
	customerName: string;
	loadingLocationID: number;
	dropArea: string;
	partColor: string | null;
	fkDropSheetID: number;
	recordType: number;
	lpid: number;
	dSSequence: number;
	unload: boolean;
	unloadManualScan: boolean;
};

const {
	getLegacyLoadViewAll,
	getLegacyMoveOrdersRows,
	getLpidForPalletLoad,
	checkPalletBelongsToLpid,
	updatePalletLoad,
	updateSingleLabelLoad
} = vi.hoisted(() => ({
	getLegacyLoadViewAll: vi.fn<(dropSheetId: number) => QueryState<LegacySequence[]>>(),
	getLegacyMoveOrdersRows: vi.fn<
		(input: { dropSheetId: number; dropSheetCustId: number }) => QueryState<LegacyMoveRow[]>
	>(),
	getLpidForPalletLoad: vi.fn(),
	checkPalletBelongsToLpid: vi.fn(),
	updatePalletLoad: vi.fn(),
	updateSingleLabelLoad: vi.fn()
}));

vi.mock('$lib/legacy-workflow.remote', () => ({
	getLegacyLoadViewAll,
	getLegacyMoveOrdersRows,
	getLpidForPalletLoad,
	checkPalletBelongsToLpid,
	updatePalletLoad,
	updateSingleLabelLoad
}));

const { getDropAreasByDepartment, getDropArea, toastSuccess } = vi.hoisted(() => ({
	getDropAreasByDepartment: vi.fn(),
	getDropArea: vi.fn(),
	toastSuccess: vi.fn()
}));

vi.mock('$lib/drop-areas.remote', () => ({
	getDropAreasByDepartment,
	getDropArea
}));

vi.mock('svelte-sonner', () => ({
	toast: {
		success: toastSuccess
	}
}));

import MoveOrdersPage from './+page.svelte';

function createQueryState<T>(current: T, overrides: Partial<QueryState<T>> = {}): QueryState<T> {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createDropArea(overrides: Record<string, unknown> = {}) {
	return {
		id: 41,
		name: 'D12',
		supportsWrap: true,
		supportsParts: true,
		supportsRoll: true,
		supportsLoading: true,
		supportsDriverLocation: true,
		firstCharacter: 'D',
		...overrides
	};
}

describe('move-orders page', () => {
	const layoutData = {
		activeTarget: 'Canton' as const,
		displayName: 'Loader One',
		isAdmin: false,
		userEmail: 'loader@dakotasteelandtrim.com',
		userRole: 'loading' as const
	};

	beforeEach(() => {
		getLegacyLoadViewAll.mockReset();
		getLegacyMoveOrdersRows.mockReset();
		getLpidForPalletLoad.mockReset();
		checkPalletBelongsToLpid.mockReset();
		updatePalletLoad.mockReset();
		updateSingleLabelLoad.mockReset();
		getDropAreasByDepartment.mockReset();
		getDropArea.mockReset();
		toastSuccess.mockReset();
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();

		getLegacyLoadViewAll.mockReturnValue(
			createQueryState([
				{
					dropSheetId: 42,
					dropSheetCustId: 101,
					sequence: '002',
					loadNumber: 'L-042',
					driver: 'David Schmidt',
					status: 'Ready'
				},
				{
					dropSheetId: 42,
					dropSheetCustId: 99,
					sequence: 'ALL',
					loadNumber: 'L-042',
					driver: 'David Schmidt',
					status: null
				},
				{
					dropSheetId: 42,
					dropSheetCustId: 100,
					sequence: '001',
					loadNumber: 'L-042',
					driver: 'David Schmidt',
					status: 'Due'
				},
				{
					dropSheetId: 42,
					dropSheetCustId: 102,
					sequence: '010',
					loadNumber: 'L-042',
					driver: 'David Schmidt',
					status: 'Ready'
				}
			])
		);

		getLegacyMoveOrdersRows.mockReturnValue(
			createQueryState([
				{
					dropSheetCustId: 100,
					partListId: 'PN-8829-XL',
					qtyDet: 'W1-L-1',
					labelNumber: 1,
					scanned: true,
					orderSoNumber: 'SO-001',
					customerName: 'Parts Co',
					loadingLocationID: 1,
					dropArea: 'PB',
					partColor: 'Red',
					fkDropSheetID: 42,
					recordType: 1,
					lpid: 501,
					dSSequence: 1,
					unload: false,
					unloadManualScan: false
				}
			])
		);

		getDropAreasByDepartment.mockReturnValue(createQueryState([createDropArea()]));
		getDropArea.mockResolvedValue(createDropArea());
	});

	it('shows a loading state before the sequence data is ready', async () => {
		getLegacyLoadViewAll.mockReturnValue(
			createQueryState([], {
				loading: true
			})
		);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await expect.element(page.getByTestId('move-orders-loading-state')).toBeInTheDocument();
		await expect.element(page.getByTestId('move-orders-loading-spinner')).toBeInTheDocument();
		await expect.element(page.getByText('Loading order status')).toBeInTheDocument();
		await expect.element(page.getByText('Loading move orders')).not.toBeInTheDocument();
		expect(getLegacyMoveOrdersRows).not.toHaveBeenCalled();
	});

	it('renders the updated chips, table, and move action for the selected sequence', async () => {
		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await expect.element(page.getByText('Move orders')).toBeInTheDocument();
		await expect.element(page.getByText('Legacy move orders')).not.toBeInTheDocument();
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('David Schmidt', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('L-042', { exact: true }))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('move-orders-summary')).toHaveClass(/gap-1\.5/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('David Schmidt', { exact: true }))
			.toHaveClass(/text-lg/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('David Schmidt', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('L-042', { exact: true }))
			.toHaveClass(/text-lg/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('L-042', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('2,152.4', { exact: true }))
			.toHaveClass(/text-xl/);
		await expect
			.element(page.getByTestId('move-orders-summary').getByText('2,152.4', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect.element(page.getByTestId('move-orders-summary').getByText('lbs', { exact: true })).toHaveClass(
			/text-\[10px\]/
		);
		await expect.element(page.getByTestId('move-orders-summary').getByText('lbs', { exact: true })).toHaveClass(
			/font-medium/
		);
		await expect
			.element(page.getByTestId('move-orders-sequences').getByRole('button', { name: '001' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('move-orders-sequences').getByRole('button').first())
			.toHaveTextContent('ALL');
		await expect
			.element(page.getByTestId('move-orders-sequences').getByRole('button').nth(1))
			.toHaveTextContent('001');
		await expect
			.element(page.getByTestId('move-orders-sequences').getByRole('button').nth(2))
			.toHaveTextContent('002');
		await expect.element(page.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
		await expect.element(page.getByText('Location')).toBeInTheDocument();
		await expect.element(page.getByText('Part Number')).toBeInTheDocument();
		await expect.element(page.getByText('Order Number')).toBeInTheDocument();
		await expect.element(page.getByText('Customer Name')).toBeInTheDocument();
		await expect.element(page.getByText('LID')).toBeInTheDocument();
		await expect.element(page.getByText('PB')).toBeInTheDocument();
		await expect.element(page.getByText('W1-L-1')).toBeInTheDocument();
		await expect.element(page.getByText('Scanned')).toBeInTheDocument();
		await expect.element(page.getByText('Move', { exact: true }).first()).toBeInTheDocument();
		await expect.element(page.getByText('PN-8829-XL')).toBeInTheDocument();
		await expect.element(page.getByText('SO-001')).toBeInTheDocument();
		await expect.element(page.getByText('Parts Co')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('move-orders-panel-header').getByText('David Schmidt', { exact: true }))
			.not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Move row for SO-001/i })).toBeInTheDocument();
		expect(getLegacyMoveOrdersRows).toHaveBeenCalledWith({
			dropSheetId: 42,
			dropSheetCustId: 99
		});
	});

	it('disables move for unscanned rows and keeps the modal closed', async () => {
		getLegacyMoveOrdersRows.mockReturnValueOnce(
			createQueryState([
				{
					dropSheetCustId: 100,
					partListId: 'PN-8829-XL',
					qtyDet: 'W1-L-1',
					labelNumber: 1,
					scanned: false,
					orderSoNumber: 'SO-001',
					customerName: 'Parts Co',
					loadingLocationID: 1,
					dropArea: 'PB',
					partColor: 'Red',
					fkDropSheetID: 42,
					recordType: 1,
					lpid: 501,
					dSSequence: 1,
					unload: false,
					unloadManualScan: false
				}
			])
		);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await expect.element(page.getByRole('button', { name: /Move row for SO-001/i })).toBeDisabled();
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
	});

	it('opens the location modal and completes a pallet move for scanned rows', async () => {
		const refresh = vi.fn();
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLegacyMoveOrdersRows.mockReturnValueOnce(
			createQueryState(
				[
					{
						dropSheetCustId: 100,
						partListId: 'PALLET-42',
						qtyDet: 'W1-L-1',
						labelNumber: 1,
						scanned: true,
						orderSoNumber: 'SO-001',
						customerName: 'Parts Co',
						loadingLocationID: 1,
						dropArea: 'PB',
						partColor: 'Red',
						fkDropSheetID: 42,
						recordType: 1,
						lpid: 501,
						dSSequence: 1,
						unload: false,
						unloadManualScan: false
					}
				],
				{ refresh }
			)
		);
		getLpidForPalletLoad.mockResolvedValue(501);
		checkPalletBelongsToLpid.mockResolvedValue({
			lpid: 501,
			palletId: 777,
			palletLabel: 'PALLET-42',
			palletScan: true
		});
		updatePalletLoad.mockResolvedValue(undefined);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await page.getByRole('button', { name: /Move row for SO-001/i }).click();
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await page.getByRole('button', { name: /D12/i }).click();

		await vi.waitFor(() => {
			expect(getLpidForPalletLoad).toHaveBeenCalledWith({
				barcode: 'PALLET-42',
				loadNumber: 'L-042',
				isPallet: true
			});
		});
		expect(checkPalletBelongsToLpid).toHaveBeenCalledWith({
			barcode: 'PALLET-42',
			lpid: 501
		});
		expect(updatePalletLoad).toHaveBeenCalledWith({
			dropAreaId: 41,
			palletId: 777,
			loaderName: 'Alex',
			lpid: 501
		});
		await vi.waitFor(() => {
			expect(refresh).toHaveBeenCalledOnce();
		});
		expect(toastSuccess).toHaveBeenCalledWith('Move completed.');
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 41,
			dropAreaLabel: 'D12'
		});
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
	});

	it('opens the location modal without a selected department and still accepts a scanned driver location', async () => {
		const refresh = vi.fn();
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		getLegacyMoveOrdersRows.mockReturnValueOnce(
			createQueryState(
				[
					{
						dropSheetCustId: 100,
						partListId: 'PALLET-42',
						qtyDet: 'W1-L-1',
						labelNumber: 1,
						scanned: true,
						orderSoNumber: 'SO-001',
						customerName: 'Parts Co',
						loadingLocationID: 1,
						dropArea: 'PB',
						partColor: 'Red',
						fkDropSheetID: 42,
						recordType: 1,
						lpid: 501,
						dSSequence: 1,
						unload: false,
						unloadManualScan: false
					}
				],
				{ refresh }
			)
		);
		getLpidForPalletLoad.mockResolvedValue(501);
		checkPalletBelongsToLpid.mockResolvedValue({
			lpid: 501,
			palletId: 777,
			palletLabel: 'PALLET-42',
			palletScan: true
		});
		updatePalletLoad.mockResolvedValue(undefined);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await page.getByRole('button', { name: /Move row for SO-001/i }).click();
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect.element(page.getByText('Select a loading department before moving items.')).not.toBeInTheDocument();
		await page.getByLabelText('Scan new location').fill('41');
		await page.getByRole('button', { name: 'Set location' }).click();

		await vi.waitFor(() => {
			expect(updatePalletLoad).toHaveBeenCalledWith({
				dropAreaId: 41,
				palletId: 777,
				loaderName: 'Alex',
				lpid: 501
			});
		});
		expect(getDropAreasByDepartment).not.toHaveBeenCalled();
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('uses the single-label move command for non-pallet rows', async () => {
		const refresh = vi.fn();
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLegacyMoveOrdersRows.mockReturnValueOnce(
			createQueryState(
				[
					{
						dropSheetCustId: 100,
						partListId: 'PN-8829-XL',
						qtyDet: 'W1-L-1',
						labelNumber: 88,
						scanned: true,
						orderSoNumber: 'SO-001',
						customerName: 'Parts Co',
						loadingLocationID: 1,
						dropArea: 'PB',
						partColor: 'Red',
						fkDropSheetID: 42,
						recordType: 2,
						lpid: 501,
						dSSequence: 1,
						unload: false,
						unloadManualScan: false
					}
				],
				{ refresh }
			)
		);
		updateSingleLabelLoad.mockResolvedValue(undefined);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await page.getByRole('button', { name: /Move row for SO-001/i }).click();
		await page.getByRole('button', { name: /D12/i }).click();

		await vi.waitFor(() => {
			expect(updateSingleLabelLoad).toHaveBeenCalledWith({
				locationId: 41,
				loaderName: 'Alex',
				lpid: 501,
				labelNumber: 88
			});
		});
		expect(getLpidForPalletLoad).not.toHaveBeenCalled();
		expect(checkPalletBelongsToLpid).not.toHaveBeenCalled();
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('shows modal validation feedback for invalid non-driver locations', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getDropArea.mockResolvedValue(
			createDropArea({
				id: 99,
				name: 'W12',
				supportsLoading: false,
				supportsDriverLocation: false
			})
		);

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await page.getByRole('button', { name: /Move row for SO-001/i }).click();
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await page.getByLabelText('Scan new location').fill('99');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(99);
		await expect.element(page.getByText('Location is not valid.')).toBeInTheDocument();
		expect(updatePalletLoad).not.toHaveBeenCalled();
		expect(updateSingleLabelLoad).not.toHaveBeenCalled();
	});

	it('surfaces move failures without losing the active sequence filter', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		updatePalletLoad.mockRejectedValue(new Error('Updating pallet load failed.'));
		getLpidForPalletLoad.mockResolvedValue(501);
		checkPalletBelongsToLpid.mockResolvedValue({
			lpid: 501,
			palletId: 777,
			palletLabel: 'PALLET-42',
			palletScan: true
		});

		render(MoveOrdersPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				returnTo: '/select-category/42?loadNumber=L-042'
			}
		});

		await page.getByRole('button', { name: '002' }).click();
		await page.getByRole('button', { name: /Move row for SO-001/i }).click();
		await page.getByRole('button', { name: /D12/i }).click();

		await expect.element(page.getByText('Updating pallet load failed.')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: '002' })).toHaveClass(/bg-primary/);
	});
});
