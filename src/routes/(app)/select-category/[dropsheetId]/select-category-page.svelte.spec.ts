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

const { goto, getOnLoadStatusAllDepts, getNumberOfDrops, upsertLoaderSession } = vi.hoisted(
	() => ({
		goto: vi.fn(),
		getOnLoadStatusAllDepts: vi.fn<(dropSheetId: number) => DepartmentStatusQueryState>(),
		getNumberOfDrops: vi.fn(),
		upsertLoaderSession: vi.fn()
	})
);

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$lib/department-status.remote', () => ({
	getOnLoadStatusAllDepts
}));

vi.mock('$lib/load-view.remote', () => ({
	getNumberOfDrops
}));

vi.mock('$lib/loader-session.remote', () => ({
	upsertLoaderSession
}));

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
		getOnLoadStatusAllDepts.mockReset();
		getNumberOfDrops.mockReset();
		upsertLoaderSession.mockReset();
		workflowStores.resetOperationalState();

		getOnLoadStatusAllDepts.mockReturnValue(
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
	});

	it('renders department status indicators and keeps loading blocked until a loader is selected', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByText('Select Category')).toBeInTheDocument();
		await expect.element(page.getByText('Slit')).toBeInTheDocument();
		await expect.element(page.getByText('Soffit')).toBeInTheDocument();
		expect(getOnLoadStatusAllDepts).toHaveBeenCalledWith(42);
		await expect.element(page.getByRole('button', { name: /Wrap/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Roll/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Parts/i })).toBeDisabled();
		await expect.element(page.getByRole('option', { name: 'Alex' })).toBeInTheDocument();
		await expect.element(page.getByRole('option', { name: 'Casey' })).toBeInTheDocument();
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
		expect(goto).toHaveBeenCalledWith('/loading?dropsheetId=42&locationId=2&loaderId=88');
	});
});
