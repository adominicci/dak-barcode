import { createRawSnippet } from 'svelte';
import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { workflowStores } from '$lib/workflow/stores';
import AppLayout from './+layout.svelte';

const children = createRawSnippet(() => ({
	render: () => '<div>Workflow layout child</div>'
}));

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

		await expect.element(page.getByText('Workflow layout child')).toBeInTheDocument();
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

		await expect.element(page.getByText('Workflow layout child')).toBeInTheDocument();
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
});
