import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { LoaderInfo } from '$lib/types';
import { workflowStores } from '$lib/workflow/stores';

type LoaderInfoQueryState = {
	current: LoaderInfo | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

const {
	goto,
	getLoaderInfo,
	endLoaderSession,
	pageState,
	navigationSpy
} = vi.hoisted(() => {
	const pageState = {
		url: new URL('https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88')
	};

	const navigationSpy: {
		callback: ((navigation: any) => void) | null;
	} = {
		callback: null
	};

	return {
		goto: vi.fn(),
		getLoaderInfo: vi.fn<(loaderSessionId: number) => LoaderInfoQueryState>(),
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

describe('loading page', () => {
	beforeEach(() => {
		goto.mockReset();
		getLoaderInfo.mockReset();
		endLoaderSession.mockReset();
		navigationSpy.callback = null;
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
		pageState.url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88'
		);
		getLoaderInfo.mockReturnValue(createLoaderInfoQuery(createLoaderInfo()));
	});

	it('loads loader info from the category handoff and renders the resolved loading context', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		expect(getLoaderInfo).toHaveBeenCalledWith(88);
		await expect.element(page.getByText('Loading')).toBeInTheDocument();
		await expect.element(page.getByText('Alex').first()).toBeInTheDocument();
		await expect.element(page.getByText('Wrap').first()).toBeInTheDocument();
		await expect.element(page.getByText('42').first()).toBeInTheDocument();
		await expect.element(page.getByText('2').first()).toBeInTheDocument();
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
});
