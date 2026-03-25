import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FixedDomainEmailField from './fixed-domain-email-field.svelte';

describe('fixed domain email field', () => {
	it('submits the visible username field in addition to the derived hidden email', async () => {
		render(FixedDomainEmailField, {
			id: 'login-email',
			username: 'andresd'
		});

		await expect.element(page.getByLabelText('Email')).toHaveAttribute('name', 'username');
	});
});
