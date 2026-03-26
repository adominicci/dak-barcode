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

	it('renders a dedicated full-email autofill bridge for password managers', async () => {
		render(FixedDomainEmailField, {
			id: 'login-email',
			username: 'andresd'
		});

		const emailBridge = document.querySelector('input[name="email"]') as HTMLInputElement | null;

		await expect.element(page.getByLabelText('Email')).toHaveAttribute('autocomplete', 'off');
		expect(emailBridge).not.toBeNull();
		await expect.element(emailBridge).toHaveAttribute('type', 'email');
		await expect.element(emailBridge).toHaveAttribute('autocomplete', 'username');
		await expect.element(emailBridge).toHaveValue('andresd@dakotasteelandtrim.com');
	});
});
