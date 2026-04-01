import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { pageState } = vi.hoisted(() => ({
	pageState: {
		url: new URL('https://app.local/login'),
		data: {}
	}
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

import RootLayout from './+layout.svelte';

const children = createRawSnippet(() => ({
	render: () => '<div data-testid="layout-child">Layout child</div>'
}));

describe('root layout document title', () => {
	beforeEach(() => {
		pageState.url = new URL('https://app.local/login');
		pageState.data = {};
	});

	it('renders a meaningful title for auth routes', async () => {
		render(RootLayout, { children });

		await expect.element(page.getByTestId('layout-child')).toBeInTheDocument();
		await expect(document.title).toBe('Sign In - Stage & Load');
	});

	it('renders a meaningful title for dynamic loading routes', async () => {
		pageState.url = new URL('https://app.local/select-category/25237?loadNumber=04012026-1006');
		pageState.data = {
			loadNumber: '04012026-1006'
		};

		render(RootLayout, { children });

		await expect(document.title).toBe('Select Category 04012026-1006 - Stage & Load');
	});
});
