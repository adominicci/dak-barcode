import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './+page.svelte';

const baseData = {
	activeTarget: 'Canton' as const,
	displayName: 'Loader One',
	isAdmin: false,
	userEmail: 'loader@dakotasteelandtrim.com',
	userRole: 'loading' as const
};

describe('home module selector', () => {
	it('renders the screenshot-style home chrome and two-column module surface', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByTestId('home-topbar')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-title')).toHaveTextContent('Stage & Load Module');
		await expect.element(page.getByTestId('home-card-grid')).toHaveClass(/md:grid-cols-2/);
		await expect.element(page.getByTestId('home-card-staging')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-loading')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-will-call')).toBeInTheDocument();
		await expect.element(page.getByTestId('home-card-add-loader')).toBeInTheDocument();
	});

	it('keeps the Add Loader utility treatment and the disabled Will Call state', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByTestId('home-card-add-loader')).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByTestId('home-card-add-loader-icon')).toHaveClass(
			/bg-white\/18/
		);
		await expect.element(page.getByTestId('home-card-staging')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-loading')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-will-call')).toHaveClass(/ui-primary-soft/);
		await expect.element(page.getByTestId('home-card-will-call-icon')).toHaveClass(
			/ui-primary-soft/
		);
		await expect.element(page.getByTestId('home-card-will-call')).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	});

	it('shows the resolved target and workflow destinations on the home surface', async () => {
		render(HomePage, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Freeport'
			}
		});

		await expect.element(page.getByTestId('home-active-target')).toHaveTextContent('Freeport');
		await expect.element(page.getByTestId('home-active-target')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-staging')).toHaveAttribute(
			'href',
			'/staging?returnTo=%2Fhome'
		);
		await expect.element(page.getByTestId('home-card-loading')).toHaveAttribute(
			'href',
			'/dropsheets?returnTo=%2Fhome'
		);
		await expect.element(page.getByTestId('home-card-add-loader')).toHaveAttribute(
			'href',
			'/loaders?returnTo=%2Fhome'
		);
	});

	it('shows admins a direct path back to the target selector', async () => {
		render(HomePage, {
			params: {},
			data: {
				...baseData,
				activeTarget: 'Sandbox',
				isAdmin: true,
				userRole: 'admin'
			}
		});

		await expect.element(page.getByRole('link', { name: 'Change target' })).toHaveAttribute(
			'href',
			'/location?returnTo=%2Fhome'
		);
	});

	it('keeps the back affordance disabled for now and hides the target link for operators', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByRole('button', { name: 'Back' })).toBeDisabled();
		await expect.element(page.getByRole('link', { name: 'Change target' })).not.toBeInTheDocument();
	});
});
