import { page, userEvent } from 'vitest/browser';
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
		await expect
			.element(page.getByRole('dialog'))
			.not.toHaveTextContent('async label export workflow');
	});

	it('moves keyboard focus into the history dialog and back to the badge on Escape', async () => {
		render(AppVersionBadge, {
			testId: 'keyboard-version-badge'
		});

		const badge = page.getByTestId('keyboard-version-badge');
		const dialog = page.getByTestId('keyboard-version-badge-history-modal');

		badge.element().focus();
		await userEvent.keyboard('{Enter}');

		await expect.element(dialog).toBeInTheDocument();
		expect(dialog.element().contains(document.activeElement)).toBe(true);

		await userEvent.keyboard('{Escape}');

		await expect.element(dialog).not.toBeInTheDocument();
		expect(document.activeElement).toBe(badge.element());
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
		await expect
			.element(page.getByTestId('centered-version-badge-history-modal'))
			.toHaveClass(/text-left/);

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
