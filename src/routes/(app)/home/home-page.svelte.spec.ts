import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { goto, lookupWillCallDropsheet } = vi.hoisted(() => ({
	goto: vi.fn(),
	lookupWillCallDropsheet: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$lib/will-call.remote', () => ({
	lookupWillCallDropsheet
}));

import HomePage from './+page.svelte';

const baseData = {
	activeTarget: 'Canton' as const,
	displayName: 'Loader One',
	isAdmin: false,
	userEmail: 'loader@dakotasteelandtrim.com',
	userRole: 'loading' as const
};

describe('home module selector', () => {
	beforeEach(() => {
		goto.mockReset();
		lookupWillCallDropsheet.mockReset();
	});

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

	it('keeps the Add Loader utility treatment and turns Will Call into an active workflow entry', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByTestId('home-card-add-loader')).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByTestId('home-card-add-loader-icon')).toHaveClass(
			/bg-white\/18/
		);
		await expect.element(page.getByTestId('home-card-staging')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-loading')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-will-call')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-will-call-icon')).toHaveClass(
			/bg-white\/18/
		);

		await page.getByTestId('home-card-will-call').click();

		await expect.element(page.getByTestId('will-call-scan-modal')).toBeInTheDocument();
		await expect.element(page.getByTestId('will-call-scan-input')).toHaveFocus();
	});

	it('routes a successful will call scan into select-category with the legacy handoff payload', async () => {
		const runLookup = vi.fn().mockResolvedValue({
			dropSheetId: 42
		});
		lookupWillCallDropsheet.mockReturnValue({ run: runLookup });

		render(HomePage, { data: baseData, params: {} });

		await page.getByTestId('home-card-will-call').click();
		await page.getByTestId('will-call-scan-input').fill('WC-042');
		const inputElement = document.querySelector('[data-testid="will-call-scan-input"]');
		if (!(inputElement instanceof HTMLInputElement)) {
			throw new Error('Expected will call scan input element.');
		}

		inputElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			})
		);

		await vi.waitFor(() => {
			expect(lookupWillCallDropsheet).toHaveBeenCalledWith('WC-042');
			expect(runLookup).toHaveBeenCalledOnce();
			expect(goto).toHaveBeenCalledWith(
				'/select-category/42?loadNumber=WC-042&deliveryNumber=WC-042&driverName=WILL+CALL&willcall=true&returnTo=%2Fhome'
			);
		});
	});

	it('shows an inline scanner-safe error and keeps the scan field ready when a will call lookup fails', async () => {
		const runLookup = vi
			.fn()
			.mockRejectedValue(new Error('Load number WC-404 is not a will call order.'));
		lookupWillCallDropsheet.mockReturnValue({ run: runLookup });

		render(HomePage, { data: baseData, params: {} });

		await page.getByTestId('home-card-will-call').click();
		await page.getByTestId('will-call-scan-input').fill('WC-404');
		const inputElement = document.querySelector('[data-testid="will-call-scan-input"]');
		if (!(inputElement instanceof HTMLInputElement)) {
			throw new Error('Expected will call scan input element.');
		}

		inputElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByTestId('will-call-scan-error')).toHaveTextContent(
			'Load number WC-404 is not a will call order.'
		);
		expect(runLookup).toHaveBeenCalledOnce();
		await expect.element(page.getByTestId('will-call-scan-input')).toHaveValue('');
		await expect.element(page.getByTestId('will-call-scan-input')).toHaveFocus();
		expect(goto).not.toHaveBeenCalled();
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

	it('renders a header sign out action that posts to the shared logout route', async () => {
		render(HomePage, { data: baseData, params: {} });

		const signOutButton = page.getByRole('button', { name: 'Sign out' });

		await expect.element(signOutButton).toBeInTheDocument();
		await expect.element(signOutButton).toHaveAttribute('type', 'submit');

		const signOutForm = document.querySelector('[data-testid="home-sign-out-form"]');
		if (!(signOutForm instanceof HTMLFormElement)) {
			throw new Error('Expected home sign out form.');
		}

		await expect.element(signOutForm).toHaveAttribute('method', 'POST');
		await expect.element(signOutForm).toHaveAttribute('action', '/logout');
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
