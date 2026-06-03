import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AuthLayout from './+layout.svelte';

const children = createRawSnippet(() => ({
	render: () => '<div>Auth layout child</div>'
}));

describe('(auth) layout', () => {
	it('shows the scanning product title with the current app version', async () => {
		render(AuthLayout, { children });

		await expect.element(page.getByRole('heading', { name: 'Scanning' })).toBeInTheDocument();
		await expect.element(page.getByTestId('auth-version-badge')).toHaveTextContent('v2.0');
		await expect.element(page.getByText('Auth layout child')).toBeInTheDocument();
	});
});
