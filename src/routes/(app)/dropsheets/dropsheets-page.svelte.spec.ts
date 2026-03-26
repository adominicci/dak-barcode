import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const layoutData = {
	activeTarget: 'Canton' as const,
	displayName: 'Loader One',
	isAdmin: false,
	selectedDate: '2026-03-24',
	userEmail: 'loader@dakotasteelandtrim.com',
	userRole: 'loading' as const
};

type DropsheetQueryState = {
	current: Array<{
		id: number;
		loadNumber: string;
		loadNumberShort: string | null;
		trailer: string | null;
		percentCompleted: number;
		loadedAt: string | null;
		dropWeight: number;
		driverId: number | null;
		driverName: string | null;
		allLoaded: boolean;
		loaderName: string | null;
	}>;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

const { goto, getDropsheets } = vi.hoisted(() => ({
	goto: vi.fn(),
	getDropsheets: vi.fn<(date: string) => DropsheetQueryState>()
}));

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$lib/dropsheets.remote', () => ({
	getDropsheets
}));

import DropsheetsPage from './+page.svelte';

function createDropsheetQuery(
	current: DropsheetQueryState['current'],
	overrides: Partial<DropsheetQueryState> = {}
): DropsheetQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

describe('dropsheets page', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-24T12:00:00-04:00'));
		goto.mockReset();
		getDropsheets.mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('defaults the date picker to today, reloads the list for a new date, and navigates on row click', async () => {
		getDropsheets.mockImplementation((date) => {
			if (date === '2026-03-25') {
				return createDropsheetQuery([
					{
						id: 91,
						loadNumber: 'L-091',
						loadNumberShort: '091',
						trailer: 'TR-25',
						percentCompleted: 100,
						loadedAt: '2026-03-25T08:00:00Z',
						dropWeight: 3022.4,
						driverId: 44,
						driverName: 'Taylor Day Two',
						allLoaded: true,
						loaderName: 'Chris'
					}
				]);
			}

			return createDropsheetQuery([
				{
					id: 42,
					loadNumber: 'L-042',
					loadNumberShort: '042',
					trailer: 'TR-9',
					percentCompleted: 87.5,
					loadedAt: '2026-03-24T08:00:00Z',
					dropWeight: 2152.4,
					driverId: 12,
					driverName: 'Dylan Driver',
					allLoaded: false,
					loaderName: 'Alex'
				}
			]);
		});

		const view = render(DropsheetsPage, {
			params: {},
			form: undefined,
			data: {
				...layoutData
			}
		});

		await expect.element(page.getByRole('button', { name: /L-042/i })).toBeInTheDocument();
		expect(getDropsheets).toHaveBeenCalledWith('2026-03-24');

		await view.rerender({
			params: {},
			form: undefined,
			data: {
				...layoutData,
				selectedDate: '2026-03-25'
			}
		});

		goto.mockResolvedValue(undefined);

		await page.getByRole('button', { name: /L-091/i }).click();

		expect(goto).toHaveBeenCalledWith(
			'/select-category/91?loadNumber=L-091&deliveryNumber=L-091'
		);
	});

	it('shows the empty state when the selected date has no dropsheets', async () => {
		getDropsheets.mockReturnValue(createDropsheetQuery([]));

		render(DropsheetsPage, {
			params: {},
			form: undefined,
			data: {
				...layoutData
			}
		});

		await expect.element(page.getByText('No dropsheets scheduled for this date.')).toBeInTheDocument();
		await expect.element(page.getByText('Choose another date or refresh when dispatch publishes the schedule.')).toBeInTheDocument();
	});
});
