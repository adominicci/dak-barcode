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

const { goto, getDropsheetCategoryAvailability, getDropsheetStatus, getOnLoadStatusAllDepts, getNumberOfDrops, upsertLoaderSession } = vi.hoisted(
	() => ({
		goto: vi.fn(),
		getDropsheetCategoryAvailability: vi.fn<(dropSheetId: number) => CategoryAvailabilityQueryState>(),
		getDropsheetStatus: vi.fn<(dropSheetId: number) => DepartmentStatusQueryState>(),
		getOnLoadStatusAllDepts: vi.fn<(dropSheetId: number) => DepartmentStatusQueryState>(),
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

vi.mock('$lib/department-status.remote', () => ({
	getOnLoadStatusAllDepts
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
	userRole: 'loading' as const
};

describe('select-category page', () => {
	beforeEach(() => {
		goto.mockReset();
		getDropsheetCategoryAvailability.mockReset();
		getDropsheetStatus.mockReset();
		getOnLoadStatusAllDepts.mockReset();
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

		getOnLoadStatusAllDepts.mockReturnValue(
			createStatusQuery({
				scope: 'dropsheet',
				subjectId: 42,
				slit: 'NA',
				trim: 'NA',
				wrap: 'NA',
				roll: 'READY',
				parts: 'NA',
				soffit: 'NA'
			})
		);
	});

	it('renders the top strip and department card badges from DST dropsheet status, shows the carried load number, and keeps loading blocked until a loader is selected', async () => {
		getDropsheetCategoryAvailability.mockReturnValue(
			createCategoryAvailabilityQuery({
				dropSheetId: 42,
				wrapHasLabels: 0,
				wrapScannedPercent: 0,
				rollHasLabels: 4,
				rollScannedPercent: 0.5,
				partsHasLabels: 0,
				partsScannedPercent: 0,
				allLoaded: false
			})
		);

		getDropsheetStatus.mockReturnValue(
			createStatusQuery({
				scope: 'dropsheet',
				subjectId: 42,
				slit: 'NA',
				trim: 'NA',
				wrap: 'NA',
				roll: 'DONE',
				parts: 'NA',
				soffit: 'NA'
			})
		);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				dropWeight: 2152.4,
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByText('Select Category')).toBeInTheDocument();
		await expect.element(page.getByText('L-042', { exact: true })).toBeInTheDocument();
		expect(getDropsheetStatus).toHaveBeenCalledWith(42);
		expect(getDropsheetCategoryAvailability).toHaveBeenCalledWith(42);
		expect(getOnLoadStatusAllDepts).not.toHaveBeenCalled();
		await expect.element(page.getByRole('button', { name: /Roll/i }).getByText('DONE')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Roll/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Wrap/i })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Parts/i })).not.toBeInTheDocument();
		await expect.element(page.getByRole('option', { name: 'Alex' })).toBeInTheDocument();
		await expect.element(page.getByRole('option', { name: 'Casey' })).toBeInTheDocument();
	});

	it('shows per-department progress percentages from the DST availability payload alongside the DST status badge', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				dropWeight: 2152.4,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByRole('button', { name: /Wrap/i }).getByText('50%')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Roll/i }).getByText('25%')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Parts/i }).getByText('75%')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Roll/i }).getByText('STOP')).toBeInTheDocument();
	});

	it('uses compact sizing hooks for the shared iPad layout', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				dropWeight: 2152.4,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByTestId('select-category-title')).toHaveClass(/text-2xl/);
		await expect.element(page.getByTestId('select-category-stat-cards')).toHaveClass(/gap-2/);
		await expect.element(page.getByTestId('select-category-loader-panel')).toHaveClass(/p-5/);
		await expect.element(page.getByTestId('select-category-department-Wrap')).toHaveClass(/p-5/);
		await expect.element(page.getByTestId('select-category-loader-select')).toHaveClass(/h-14/);
	});

	it('maps Wrap to location 2, creates the loader session, stores the selection, and navigates into loading', async () => {
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
				dropWeight: 2152.4,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByLabelText('Loader').selectOptions('7');
		await page.getByRole('button', { name: /Wrap/i }).click();

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
		expect(goto).toHaveBeenCalledWith(
			'/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-24T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4'
		);
	});
});
