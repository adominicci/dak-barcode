import { createRawSnippet } from 'svelte';
import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { workflowStores } from '$lib/workflow/stores';

const { pageState } = vi.hoisted(() => ({
	pageState: {
		url: new URL('https://app.local/account')
	}
}));

vi.mock('$app/state', () => ({
	page: pageState
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
});
