import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { LoadViewDetail, LoadViewUnion, LoaderInfo } from '$lib/types';
import { workflowStores } from '$lib/workflow/stores';

type RemoteQueryState<T> = {
	current: T;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type LoaderInfoQueryState = {
	current: LoaderInfo | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

const {
	goto,
	getLoaderInfo,
	getLoadViewDetailAll,
	getLoadViewUnion,
	endLoaderSession,
	pageState,
	navigationSpy
} = vi.hoisted(() => {
	const pageState = {
		url: new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4'
		)
	};

	const navigationSpy: {
		callback: ((navigation: any) => void) | null;
	} = {
		callback: null
	};

	return {
		goto: vi.fn(),
		getLoaderInfo: vi.fn<(loaderSessionId: number) => LoaderInfoQueryState>(),
		getLoadViewDetailAll: vi.fn<(input: { dropSheetId: number; locationId: number }) => RemoteQueryState<LoadViewDetail[]>>(),
		getLoadViewUnion: vi.fn<
			(input: { loadNumber: string; sequence: number; locationId: number }) => RemoteQueryState<LoadViewUnion[]>
		>(),
		endLoaderSession: vi.fn(),
		pageState,
		navigationSpy
	};
});

vi.mock('$app/state', () => ({
	page: pageState
}));

vi.mock('$app/navigation', () => ({
	goto,
	beforeNavigate: vi.fn((callback: (navigation: any) => void) => {
		navigationSpy.callback = callback;
	})
}));

vi.mock('$lib/loader-session.remote', () => ({
	getLoaderInfo,
	endLoaderSession
}));

vi.mock('$lib/load-view.remote', () => ({
	getLoadViewDetailAll,
	getLoadViewUnion
}));

import LoadingPage from './+page.svelte';

function createLoaderInfoQuery(
	current: LoaderInfo,
	overrides: Partial<LoaderInfoQueryState> = {}
): LoaderInfoQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createLoaderInfo(overrides: Partial<LoaderInfo> = {}): LoaderInfo {
	return {
		id: 88,
		dropSheetId: 42,
		loaderId: 7,
		department: 'Wrap',
		loaderName: 'Alex',
		startedAt: '2026-03-26T12:00:00.000Z',
		endedAt: null,
		...overrides
	};
}

function createRemoteQuery<T>(
	current: T,
	overrides: Partial<RemoteQueryState<T>> = {}
): RemoteQueryState<T> {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createDropDetail(overrides: Partial<LoadViewDetail> = {}): LoadViewDetail {
	return {
		dropSequence: 1,
		dropSheetId: 42,
		dropSheetCustomerId: 84,
		loadNumber: 'L-042',
		loadDate: '2026-03-26',
		locationId: 2,
		sequence: 1,
		customerId: 999,
		customerName: 'Acme Metals',
		driverName: 'Dylan Driver',
		totalCountText: '12/20',
		labelCount: 20,
		scannedCount: 12,
		needPickCount: 8,
		...overrides
	};
}

function createUnionLabel(overrides: Partial<LoadViewUnion> = {}): LoadViewUnion {
	return {
		partListId: 'PL-100',
		labelNumber: 1001,
		orderSoNumber: 'SO-100',
		loadNumber: 'L-042',
		sequence: 1,
		dropAreaName: 'R12',
		scanned: false,
		locationId: 2,
		lengthText: '10ft',
		categoryId: 2,
		lpid: 5001,
		...overrides
	};
}

describe('loading page', () => {
	beforeEach(() => {
		goto.mockReset();
		getLoaderInfo.mockReset();
		getLoadViewDetailAll.mockReset();
		getLoadViewUnion.mockReset();
		endLoaderSession.mockReset();
		navigationSpy.callback = null;
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
		pageState.url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4'
		);
		getLoaderInfo.mockReturnValue(createLoaderInfoQuery(createLoaderInfo()));
		getLoadViewDetailAll.mockReturnValue(
			createRemoteQuery([
				createDropDetail(),
				createDropDetail({
					dropSequence: 2,
					dropSheetCustomerId: 85,
					sequence: 2,
					customerName: 'Beacon Supply',
					driverName: 'Taylor Driver',
					totalCountText: '4/10',
					labelCount: 10,
					scannedCount: 4,
					needPickCount: 6
				})
			])
		);
		getLoadViewUnion.mockImplementation(({ sequence }) =>
			createRemoteQuery(
				sequence === 1
					? [
							createUnionLabel({
								partListId: 'PL-100',
								orderSoNumber: 'SO-100',
								scanned: true
							}),
							createUnionLabel({
								partListId: 'PL-101',
								labelNumber: 1002,
								orderSoNumber: 'SO-101',
								scanned: false
							})
						]
					: [
							createUnionLabel({
								partListId: 'PL-200',
								labelNumber: 2001,
								orderSoNumber: 'SO-200',
								sequence: 2,
								scanned: false
							})
						]
			)
		);
	});

	it('loads loader info from the category handoff and renders the resolved loading context', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		expect(getLoaderInfo).toHaveBeenCalledWith(88);
		expect(getLoadViewDetailAll).toHaveBeenCalledWith({
			dropSheetId: 42,
			locationId: 2
		});
		await expect.element(page.getByRole('heading', { name: 'Loading' })).toBeInTheDocument();
		await expect.element(page.getByText('Alex').first()).toBeInTheDocument();
		await expect.element(page.getByText('Wrap').first()).toBeInTheDocument();
		await expect.element(page.getByText('42').first()).toBeInTheDocument();
		await expect.element(page.getByText('2').first()).toBeInTheDocument();
	});

	it('renders the active drop detail, need-pick summary, and scanned vs unscanned labels', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		await expect.element(page.getByText('Drop 1 of 2')).toBeInTheDocument();
		await expect.element(page.getByText('Acme Metals')).toBeInTheDocument();
		await expect.element(page.getByText('Dylan Driver')).toBeInTheDocument();
		await expect.element(page.getByText('L-042').first()).toBeInTheDocument();
		await expect.element(page.getByText('2,152.4 lbs')).toBeInTheDocument();
		await expect.element(page.getByText('SO-100').first()).toBeInTheDocument();
		await expect.element(page.getByText('SO-101').first()).toBeInTheDocument();
		await expect.element(page.getByText(/^Scanned$/).first()).toBeInTheDocument();
		await expect.element(page.getByText(/^Unscanned$/).first()).toBeInTheDocument();
		await expect.element(page.getByText('Need pick').first()).toBeInTheDocument();
		await expect.element(page.getByText('8').first()).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Previous drop/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Next drop/i })).toBeEnabled();
	});

	it('hides the empty SO-number placeholder while the label list is still loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoadViewUnion.mockReturnValue(
			createRemoteQuery([], {
				loading: true
			})
		);

		render(LoadingPage);

		await expect.element(page.getByText('Loading label list...')).toBeInTheDocument();
		await expect.element(page.getByText('No SO numbers available')).not.toBeInTheDocument();
	});

	it('shows the need-pick summary only once for the active drop', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		const needPickLabels = Array.from(document.querySelectorAll('*')).filter(
			(element) => element.textContent?.trim() === 'Need pick'
		);

		expect(needPickLabels).toHaveLength(1);
	});

	it('moves between drops, refreshes the selected detail, and clamps navigation at the last drop', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		await page.getByRole('button', { name: /Next drop/i }).click();

		await expect.element(page.getByText('Drop 2 of 2')).toBeInTheDocument();
		await expect.element(page.getByText('Beacon Supply')).toBeInTheDocument();
		await expect.element(page.getByText('Taylor Driver')).toBeInTheDocument();
		await expect.element(page.getByText('SO-200').first()).toBeInTheDocument();
		expect(getLoadViewUnion).toHaveBeenLastCalledWith({
			loadNumber: 'L-042',
			sequence: 2,
			locationId: 2
		});
		await expect.element(page.getByRole('button', { name: /Next drop/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Previous drop/i })).toBeEnabled();
	});

	it('redirects to home when the loading entry params are invalid', async () => {
		pageState.url = new URL('https://app.local/loading?dropsheetId=42&locationId=2');

		render(LoadingPage);

		await vi.waitFor(() => {
			expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		});
		expect(getLoaderInfo).not.toHaveBeenCalled();
	});

	it('redirects to home when the page is reopened without the in-memory workflow context', async () => {
		render(LoadingPage);

		await vi.waitFor(() => {
			expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		});
		expect(getLoaderInfo).not.toHaveBeenCalled();
	});

	it('ends the loader session before allowing in-app navigation away from loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		endLoaderSession.mockResolvedValue(
			createLoaderInfo({
				endedAt: '2026-03-26T12:05:00.000Z'
			})
		);

		render(LoadingPage);

		const cancel = vi.fn();
		navigationSpy.callback?.({
			type: 'link',
			willUnload: false,
			to: {
				url: new URL('https://app.local/home'),
				route: { id: '/home' }
			},
			cancel
		});

		expect(cancel).toHaveBeenCalledOnce();
		await vi.waitFor(() => {
			expect(endLoaderSession).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 88,
					dropSheetId: 42,
					loaderId: 7,
					department: 'Wrap',
					loaderName: 'Alex',
					startedAt: '2026-03-26T12:00:00.000Z',
					endedAt: expect.any(String)
				})
			);
		});
		expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		expect(get(workflowStores.currentLoader)).toBeNull();
		expect(get(workflowStores.selectedDepartment)).toBeNull();
	});

	it('ends the loader session on exit even before loader info finishes loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoaderInfo.mockReturnValue(
			createLoaderInfoQuery(createLoaderInfo(), {
				current: null,
				loading: true
			})
		);
		endLoaderSession.mockResolvedValue(
			createLoaderInfo({
				endedAt: '2026-03-26T12:05:00.000Z'
			})
		);

		render(LoadingPage);

		const cancel = vi.fn();
		navigationSpy.callback?.({
			type: 'link',
			willUnload: false,
			to: {
				url: new URL('https://app.local/home'),
				route: { id: '/home' }
			},
			cancel
		});

		expect(cancel).toHaveBeenCalledOnce();
		await vi.waitFor(() => {
			expect(endLoaderSession).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 88,
					dropSheetId: 42,
					loaderId: 7,
					department: 'Wrap',
					loaderName: 'Alex',
					startedAt: '2026-03-26T12:00:00.000Z',
					endedAt: expect.any(String)
				})
			);
		});
		expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
	});
});
