import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoginPage from './+page.svelte';

describe('login page', () => {
	it('does not show a forgot password link on the sign in screen', async () => {
		render(LoginPage, {
			data: {
				notice: null
			},
			params: {},
			form: null
		});

		await expect.element(page.getByRole('link', { name: /forgot password/i })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /continue/i })).toBeInTheDocument();
	});
});
