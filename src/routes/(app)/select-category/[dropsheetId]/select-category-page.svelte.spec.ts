import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { get } from 'svelte/store';
import { workflowStores } from '$lib/workflow/stores';

type DepartmentStatusQueryState = {
	current: {
		scope: 'dropsheet';
		subjectId: number;
		slit: string | null;
		trim: string | null;
		wrap: string | null;
		roll: string | null;
		parts: string | null;
		soffit: string | null;
	} | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type CategoryAvailabilityQueryState = {
	current: {
		dropSheetId: number;
		wrapHasLabels: number;
		wrapScannedPercent: number;
		rollHasLabels: number;
		rollScannedPercent: number;
		partsHasLabels: number;
		partsScannedPercent: number;
		allLoaded: boolean;
	} | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type DepartmentLoaderGroup = {
	department: 'Wrap' | 'Roll' | 'Parts';
	loaderNames: string[];
};

const { goto, getDropsheetCategoryAvailability, getDropsheetStatus, getNumberOfDrops, upsertLoaderSession } = vi.hoisted(
	() => ({
		goto: vi.fn(),
		getDropsheetCategoryAvailability: vi.fn<(dropSheetId: number) => CategoryAvailabilityQueryState>(),
		getDropsheetStatus: vi.fn<(dropSheetId: number) => DepartmentStatusQueryState>(),
		getNumberOfDrops: vi.fn(),
		upsertLoaderSession: vi.fn()
	})
);

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$lib/dropsheets.remote', () => ({
	getDropsheetCategoryAvailability,
	getDropsheetStatus
}));

vi.mock('$lib/load-view.remote', () => ({ getNumberOfDrops }));

vi.mock('$lib/loader-session.remote', () => ({ upsertLoaderSession }));

import SelectCategoryPage from './+page.svelte';

function createStatusQuery(
	current: NonNullable<DepartmentStatusQueryState['current']>,
	overrides: Partial<DepartmentStatusQueryState> = {}
): DepartmentStatusQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createCategoryAvailabilityQuery(
	current: NonNullable<CategoryAvailabilityQueryState['current']>,
	overrides: Partial<CategoryAvailabilityQueryState> = {}
): CategoryAvailabilityQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

const layoutData = {
	activeTarget: 'Canton' as const,
	displayName: 'Loader One',
	isAdmin: false,
	userEmail: 'loader@dakotasteelandtrim.com',
	userRole: 'loading' as const,
	departmentLoaders: [
		{ department: 'Wrap', loaderNames: [] },
		{ department: 'Roll', loaderNames: [] },
		{ department: 'Parts', loaderNames: [] }
	] as DepartmentLoaderGroup[]
};

describe('select-category page', () => {
	beforeEach(() => {
		goto.mockReset();
		getDropsheetCategoryAvailability.mockReset();
		getDropsheetStatus.mockReset();
		getNumberOfDrops.mockReset();
		upsertLoaderSession.mockReset();
		workflowStores.resetOperationalState();

		getDropsheetStatus.mockReturnValue(
			createStatusQuery({
				scope: 'dropsheet',
				subjectId: 42,
				slit: 'DONE',
				trim: 'READY',
				wrap: 'WAIT',
				roll: 'STOP',
				parts: 'DUE',
				soffit: null
			})
		);

		getDropsheetCategoryAvailability.mockReturnValue(
			createCategoryAvailabilityQuery({
				dropSheetId: 42,
				wrapHasLabels: 6,
				wrapScannedPercent: 0.5,
				rollHasLabels: 4,
				rollScannedPercent: 0.25,
				partsHasLabels: 3,
				partsScannedPercent: 0.75,
				allLoaded: false
			})
		);
	});

	it('renders the compact summary cards and department actions without the old sidebar or heading block', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				departmentLoaders: [
					{ department: 'Wrap', loaderNames: ['Kaleb', 'Anthony'] },
					{ department: 'Roll', loaderNames: ['Kaleb'] },
					{ department: 'Parts', loaderNames: [] }
				] as DepartmentLoaderGroup[],
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByText('Select Category')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-panel')).not.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Driver'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Delivery Number'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Weight'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('David Schmidt'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('L-042', { exact: true }))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-summary-grid')).not.toHaveTextContent(
			'lbs lbs'
		);
		await expect.element(page.getByTestId('select-category-summary-grid')).toHaveClass(/gap-2/);
		await expect.element(page.getByRole('button', { name: /Wrap/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Roll/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Parts/i })).toBeInTheDocument();
		await expect.element(page.getByText('Location 2')).not.toBeInTheDocument();
		await expect.element(page.getByText('Location 1')).not.toBeInTheDocument();
		await expect
			.element(page.getByText('Protect wrapped orders and finish the trailer handoff.'))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByText('Stage roll inventory into driver-valid loading locations.'))
			.not.toBeInTheDocument();
		await expect.element(page.getByText('50%')).toBeInTheDocument();
		await expect.element(page.getByText('25%')).toBeInTheDocument();
		await expect.element(page.getByText('75%')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-roster')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-roster')).toHaveTextContent(
			'Loaders'
		);
		await expect.element(page.getByTestId('select-category-loader-roster')).not.toHaveTextContent(
			'Current roster'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Wrap')).toHaveTextContent(
			'Kaleb'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Wrap')).toHaveTextContent(
			'Anthony'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Roll')).toHaveTextContent(
			'Kaleb'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Parts')).toHaveTextContent(
			'No loaders yet for this department.'
		);
		await expect.element(page.getByTestId('select-category-loader-grid')).toHaveClass(/grid/);
		await expect.element(page.getByTestId('select-category-loader-grid')).toHaveClass(/grid-cols-3/);
		await expect.element(page.getByTestId('select-category-actions')).toHaveClass(/grid-cols-3/);
		await expect.element(page.getByText('Order Status')).toBeInTheDocument();
		await expect.element(page.getByText('Dropsheet')).toBeInTheDocument();
		await expect.element(page.getByText('Navigate')).not.toBeInTheDocument();
		await expect.element(page.getByText('Signature', { exact: true })).not.toBeInTheDocument();
	});

	it('opens the loader modal on every department tap and persists the chosen loader for the loading handoff', async () => {
		getNumberOfDrops.mockResolvedValue(14);
		upsertLoaderSession.mockResolvedValue({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Wrap',
			loaderName: 'Alex',
			startedAt: '2026-03-24T12:00:00.000Z',
			endedAt: null
		});
		goto.mockResolvedValue(undefined);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await page.getByRole('button', { name: /Wrap/i }).click();
		await expect.element(page.getByTestId('selection-modal')).toBeInTheDocument();

		await page.getByRole('button', { name: 'Alex' }).click();

		expect(getNumberOfDrops).toHaveBeenCalledWith({
			dropSheetId: 42,
			locationId: 2
		});
		expect(upsertLoaderSession).toHaveBeenCalledWith(
			expect.objectContaining({
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex'
			})
		);
		expect(get(workflowStores.selectedDepartment)).toBe('Wrap');
		expect(get(workflowStores.currentLoader)).toEqual({
			loaderId: 7,
			loaderName: 'Alex'
		});
		await expect.element(page.getByRole('button', { name: /Wrap/i })).toHaveTextContent('Alex');
		expect(goto).toHaveBeenCalledWith(
			'/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-24T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4&driverName=David+Schmidt'
		);
	});

	it('keeps the status strip and category cards responsive enough for the shared iPad layout', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByTestId('select-category-summary-grid')).toHaveClass(/grid/);
		await expect.element(page.getByTestId('select-category-status-grid')).toHaveClass(/grid-cols-6/);
		await expect.element(page.getByTestId('select-category-actions')).toHaveClass(/gap-3/);
		await expect.element(page.getByTestId('select-category-department-Wrap')).toHaveClass(/min-h-\[7rem\]/);
	});
});
