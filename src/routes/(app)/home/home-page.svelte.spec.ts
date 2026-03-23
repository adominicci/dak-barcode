import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './+page.svelte';

describe('home module selector', () => {
	it('renders the screenshot-style home chrome and two-column module surface', async () => {
		render(HomePage);

		await expect.element(page.getByTestId('home-topbar')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-title')).toHaveTextContent('Stage & Load Module');
		await expect.element(page.getByTestId('home-card-grid')).toHaveClass(/md:grid-cols-2/);
		await expect.element(page.getByTestId('home-card-staging')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-loading')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-will-call')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-add-loader')).toBeInTheDocument();
	});

	it('keeps the Add Loader utility treatment and the disabled Will Call state', async () => {
		render(HomePage);

		await expect.element(page.getByTestId('home-card-add-loader')).toHaveClass(/border-dashed/);
		await expect.element(page.getByTestId('home-card-will-call')).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	});

	it('renders the back affordance as non-interactive until navigation is wired', async () => {
		render(HomePage);

		await expect.element(page.getByRole('button', { name: 'Back' })).toBeDisabled();
	});
});
