import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

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

type LegacyOrderRow = {
	dropSheetCustId: number;
	orderSoNumber: string;
	customerName: string;
	fkDropSheetId: number;
	sequence: number;
	orderSlitterStatus: string | null;
	orderTrimStatus: string | null;
	orderWrapStatus: string | null;
	orderPartStatus: string | null;
	orderRollStatus: string | null;
	orderSoffitStatus: string | null;
	statusSort: number;
};

const { getLegacyLoadViewAll, getLegacyOrderStatusRows } = vi.hoisted(() => ({
	getLegacyLoadViewAll: vi.fn<(dropSheetId: number) => QueryState<LegacySequence[]>>(),
	getLegacyOrderStatusRows: vi.fn<
		(input: { dropSheetId: number; dropSheetCustId: number }) => QueryState<LegacyOrderRow[]>
	>()
}));

vi.mock('$lib/legacy-workflow.remote', () => ({
	getLegacyLoadViewAll,
	getLegacyOrderStatusRows
}));

import OrderStatusPage from './+page.svelte';

function createQueryState<T>(current: T, overrides: Partial<QueryState<T>> = {}): QueryState<T> {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

describe('order-status page', () => {
	const layoutData = {
		activeTarget: 'Canton' as const,
		displayName: 'Loader One',
		isAdmin: false,
		userEmail: 'loader@dakotasteelandtrim.com',
		userRole: 'loading' as const
	};

	beforeEach(() => {
		getLegacyLoadViewAll.mockReset();
		getLegacyOrderStatusRows.mockReset();

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

		getLegacyOrderStatusRows.mockReturnValue(
			createQueryState([
				{
					dropSheetCustId: 100,
					orderSoNumber: 'SO-001',
					customerName: 'Parts Co',
					fkDropSheetId: 42,
					sequence: 1,
					orderSlitterStatus: 'DONE',
					orderTrimStatus: 'READY',
					orderWrapStatus: 'WAIT',
					orderPartStatus: 'DONE',
					orderRollStatus: 'NA',
					orderSoffitStatus: 'NA',
					statusSort: 1
				}
			])
		);
	});

	it('shows a loading state before the sequence data is ready', async () => {
		getLegacyLoadViewAll.mockReturnValue(
			createQueryState([], {
				loading: true
			})
		);

		render(OrderStatusPage, {
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

		await expect.element(page.getByTestId('order-status-loading-state')).toBeInTheDocument();
		await expect.element(page.getByTestId('order-status-loading-spinner')).toBeInTheDocument();
		await expect.element(page.getByText('Loading order status')).toBeInTheDocument();
		await expect.element(page.getByText('No order status rows are available for this sequence.')).not.toBeInTheDocument();
		expect(getLegacyOrderStatusRows).not.toHaveBeenCalled();
	});

	it('renders the legacy chips and order status table for the selected sequence', async () => {
		render(OrderStatusPage, {
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

		await expect.element(page.getByText('Order status')).toBeInTheDocument();
		await expect.element(page.getByText('Legacy order status')).not.toBeInTheDocument();
		await expect
			.element(page.getByTestId('order-status-summary').getByText('David Schmidt', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('order-status-summary').getByText('L-042', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('order-status-summary').getByText('2,152.4 lbs'))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('order-status-summary')).toHaveClass(/gap-1\.5/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('David Schmidt', { exact: true }))
			.toHaveClass(/text-lg/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('David Schmidt', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('L-042', { exact: true }))
			.toHaveClass(/text-lg/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('L-042', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('2,152.4', { exact: true }))
			.toHaveClass(/text-xl/);
		await expect
			.element(page.getByTestId('order-status-summary').getByText('2,152.4', { exact: true }))
			.toHaveClass(/font-semibold/);
		await expect.element(page.getByTestId('order-status-summary').getByText('lbs', { exact: true })).toHaveClass(
			/text-\[10px\]/
		);
		await expect.element(page.getByTestId('order-status-summary').getByText('lbs', { exact: true })).toHaveClass(
			/font-medium/
		);
		await expect.element(page.getByTestId('order-status-sequences').getByRole('button').first()).toHaveTextContent('ALL');
		await expect
			.element(page.getByTestId('order-status-sequences').getByRole('button').nth(1))
			.toHaveTextContent('001');
		await expect
			.element(page.getByTestId('order-status-sequences').getByRole('button').nth(2))
			.toHaveTextContent('002');
		await expect.element(page.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: '001' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: '002' })).toBeInTheDocument();
		await expect.element(page.getByText('Order #')).toBeInTheDocument();
		await expect.element(page.getByText('Order Number')).not.toBeInTheDocument();
		await expect.element(page.getByText('Customer Name')).toBeInTheDocument();
		await expect.element(page.getByText('Slit')).toBeInTheDocument();
		await expect.element(page.getByText('Soffit')).toBeInTheDocument();
		await expect.element(page.getByText('SO-001')).toBeInTheDocument();
		await expect.element(page.getByText('Parts Co')).toBeInTheDocument();
		await expect
			.element(
				page
					.getByTestId('order-status-panel-header')
					.getByText('David Schmidt', { exact: true })
			)
			.not.toBeInTheDocument();
		await expect.element(page.getByText('DONE', { exact: true }).first()).toBeInTheDocument();
		await expect.element(page.getByText('READY', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('WAIT', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('NA', { exact: true }).first()).toBeInTheDocument();
		await expect.element(page.getByText('DONE', { exact: true }).first()).toHaveClass(
			/bg-emerald-500/
		);
		await expect.element(page.getByText('DONE', { exact: true }).first()).not.toHaveClass(
			/bg-white/
		);
		await expect.element(page.getByText('READY', { exact: true })).toHaveClass(/bg-sky-600/);
		await expect.element(page.getByText('WAIT', { exact: true })).toHaveClass(/bg-amber-400/);
		await expect.element(page.getByText('NA', { exact: true }).first()).toHaveClass(
			/bg-emerald-500/
		);
		expect(getLegacyOrderStatusRows).toHaveBeenCalledWith({
			dropSheetId: 42,
			dropSheetCustId: 99
		});
	});

	it('switches rows when another sequence chip is selected', async () => {
		getLegacyOrderStatusRows.mockReturnValueOnce(
			createQueryState([
				{
					dropSheetCustId: 100,
					orderSoNumber: 'SO-001',
					customerName: 'Parts Co',
					fkDropSheetId: 42,
					sequence: 1,
					orderSlitterStatus: 'DONE',
					orderTrimStatus: 'READY',
					orderWrapStatus: 'WAIT',
					orderPartStatus: 'DONE',
					orderRollStatus: 'NA',
					orderSoffitStatus: 'NA',
					statusSort: 1
				}
			])
		);
		getLegacyOrderStatusRows.mockReturnValueOnce(
			createQueryState([
				{
					dropSheetCustId: 101,
					orderSoNumber: 'SO-002',
					customerName: 'Wrap Co',
					fkDropSheetId: 42,
					sequence: 2,
					orderSlitterStatus: 'NA',
					orderTrimStatus: 'NA',
					orderWrapStatus: 'DONE',
					orderPartStatus: 'READY',
					orderRollStatus: 'NA',
					orderSoffitStatus: 'NA',
					statusSort: 2
				}
			])
		);

		render(OrderStatusPage, {
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

		await page.getByTestId('order-status-sequences').getByRole('button', { name: '002' }).click();
		await expect.element(page.getByText('SO-002')).toBeInTheDocument();
		expect(getLegacyOrderStatusRows).toHaveBeenCalledWith({
			dropSheetId: 42,
			dropSheetCustId: 101
		});
	});
});
