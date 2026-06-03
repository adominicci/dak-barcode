import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import AppVersionBadge from './app-version-badge.svelte';

describe('app version badge', () => {
	afterEach(() => {
		document.body.style.textAlign = '';
	});

	it('opens the in-app version history dialog', async () => {
		render(AppVersionBadge, {
			testId: 'test-version-badge'
		});

		await expect.element(page.getByTestId('test-version-badge')).toHaveTextContent('v2.0');

		await page.getByTestId('test-version-badge').click();

		await expect.element(page.getByTestId('test-version-badge-history-modal')).toBeInTheDocument();
		await expect.element(page.getByRole('dialog')).toHaveTextContent('Stage & Load versions');
		await expect.element(page.getByRole('dialog')).toHaveTextContent('Stage & Load version visibility');
		await expect
			.element(page.getByRole('dialog'))
			.toHaveTextContent('Displays the active app version on login and authenticated headers.');
	});

	it('keeps version history text left-aligned inside centered auth surfaces', async () => {
		document.body.style.textAlign = 'center';

		render(AppVersionBadge, {
			testId: 'centered-version-badge'
		});

		await page.getByTestId('centered-version-badge').click();
		await expect
			.element(page.getByTestId('centered-version-badge-history-modal'))
			.toBeInTheDocument();

		const dialog = page.getByTestId('centered-version-badge-history-modal').element();
		const currentVersion = dialog.querySelector('p');
		const releaseVersion = dialog.querySelector('article p');

		if (!(currentVersion instanceof HTMLElement) || !(releaseVersion instanceof HTMLElement)) {
			throw new Error('Expected version history text nodes.');
		}

		expect(getComputedStyle(currentVersion).textAlign).toBe('left');
		expect(getComputedStyle(releaseVersion).textAlign).toBe('left');
	});
});
