import { createRawSnippet } from 'svelte';
import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { workflowStores } from '$lib/workflow/stores';

const { pageState, invalidateAll } = vi.hoisted(() => ({
	pageState: {
		url: new URL('https://app.local/account')
	},
	invalidateAll: vi.fn()
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

vi.mock('$app/navigation', () => ({
	invalidateAll
}));

import AppLayout from './+layout.svelte';

const children = createRawSnippet(() => ({
	render: () => '<div>Workflow layout child</div>'
}));
const workflowLayoutChild = () => page.getByText('Workflow layout child').first();

const baseData = {
	displayName: 'Loader One',
	userRole: 'loading' as const,
	userEmail: 'loader@dakotasteelandtrim.com',
	isAdmin: false
};

describe('(app) layout workflow target sync', () => {
	beforeEach(() => {
		workflowStores.syncActiveTarget(null);
		workflowStores.resetOperationalState();
		pageState.url = new URL('https://app.local/account');
		invalidateAll.mockReset();
	});

	it('hydrates the workflow active target from layout data', async () => {
		render(AppLayout, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Freeport' as const
			},
			children
		});

		await expect.element(workflowLayoutChild()).toBeInTheDocument();
		expect(get(workflowStores.activeTarget)).toBe('Freeport');
	});

	it('tracks active target changes across rerenders', async () => {
		const view = render(AppLayout, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		expect(get(workflowStores.activeTarget)).toBe('Canton');

		await view.rerender({
			params: {},
			data: {
				...baseData,
				activeTarget: 'Sandbox' as const
			},
			children
		});

		expect(get(workflowStores.activeTarget)).toBe('Sandbox');
	});

	it('clears the workflow active target when layout data has no target', async () => {
		workflowStores.syncActiveTarget('Canton');

		render(AppLayout, {
			params: {},
			data: {
				...baseData,
				activeTarget: null
			},
			children
		});

		await expect.element(workflowLayoutChild()).toBeInTheDocument();
		expect(get(workflowStores.activeTarget)).toBeNull();
	});

	it('routes select-category back to the dropsheet list', async () => {
		pageState.url = new URL('https://app.local/select-category/42?loadNumber=L-042');

		render(AppLayout, {
			params: { dropsheetId: '42' },
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await expect.element(page.getByRole('link', { name: 'Back' })).toHaveAttribute(
			'href',
			'/dropsheets'
		);
	});

	it('routes order-status back to select-category when launched from that flow', async () => {
		pageState.url = new URL(
			'https://app.local/order-status/42?returnTo=%2Fselect-category%2F42%3FloadNumber%3DL-042'
		);

		render(AppLayout, {
			params: { dropsheetId: '42' },
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await expect.element(page.getByRole('link', { name: 'Back' })).toHaveAttribute(
			'href',
			'/select-category/42?loadNumber=L-042'
		);
		await expect.element(page.getByRole('heading', { name: 'Order Status' })).toBeInTheDocument();
	});

	it('renders the loading header with department, loader, driver, and weight while preserving shell actions', async () => {
		pageState.url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4&driverName=Dylan%20Driver'
		);
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(AppLayout, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await expect.element(page.getByTestId('app-header-title')).toHaveTextContent('Loading Wrap Alex');
		await expect
			.element(page.getByTestId('loading-route-header-meta'))
			.toHaveTextContent('Dylan Driver-2152.4 lbs');
		await expect.element(page.getByRole('button', { name: 'Refresh loading header' })).toBeInTheDocument();
		await expect.element(page.getByText('Sign out')).toBeInTheDocument();
		await expect.element(page.getByText('Canton')).toBeInTheDocument();
		await expect.element(page.getByText('AD')).toBeInTheDocument();
	});

	it('refreshes loading data from the legacy header action', async () => {
		pageState.url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4&driverName=Dylan%20Driver'
		);
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(AppLayout, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await page.getByRole('button', { name: 'Refresh loading header' }).click();

		expect(invalidateAll).toHaveBeenCalledOnce();
	});

	it('routes move-orders back to select-category when launched from that flow', async () => {
		pageState.url = new URL(
			'https://app.local/move-orders/42?returnTo=%2Fselect-category%2F42%3FloadNumber%3DL-042'
		);

		render(AppLayout, {
			params: { dropsheetId: '42' },
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await expect.element(page.getByRole('link', { name: 'Back' })).toHaveAttribute(
			'href',
			'/select-category/42?loadNumber=L-042'
		);
		await expect.element(page.getByRole('heading', { name: 'Dropsheet' })).toBeInTheDocument();
	});

	it('rejects unsafe returnTo values and falls back to home', async () => {
		pageState.url = new URL('https://app.local/order-status/42?returnTo=https%3A%2F%2Fevil.example.com');

		render(AppLayout, {
			params: { dropsheetId: '42' },
			data: {
				...baseData,
				activeTarget: 'Canton' as const
			},
			children
		});

		await expect.element(page.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/home');
	});
});
