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

function expectHomeActionForm(buttonTestId: string, expectedAction: string) {
	const actionButton = document.querySelector(`[data-testid="${buttonTestId}"]`);
	if (!(actionButton instanceof HTMLButtonElement)) {
		throw new Error(`Expected home action button ${buttonTestId}.`);
	}

	const formElement = actionButton.closest('form');
	if (!(formElement instanceof HTMLFormElement)) {
		throw new Error(`Expected form wrapper for ${buttonTestId}.`);
	}

	const returnToInput = formElement.querySelector('input[name="returnTo"]');
	if (!(returnToInput instanceof HTMLInputElement)) {
		throw new Error(`Expected returnTo input for ${buttonTestId}.`);
	}

	expect(formElement.getAttribute('action')).toBe(expectedAction);
	expect(returnToInput.value).toBe('/home');
}

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

	it('keeps the Will Call card styled as an active workflow entry and opens the scanner modal', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByTestId('home-card-will-call')).toHaveClass(/ui-primary-gradient/);
		await expect.element(page.getByTestId('home-card-will-call-icon')).toHaveClass(/bg-white\/18/);

		await page.getByTestId('home-card-will-call').click();

		await expect.element(page.getByTestId('will-call-scan-modal')).toBeInTheDocument();
		await expect.element(page.getByTestId('will-call-scan-input')).toHaveFocus();
	});

	it('routes a successful will call scan into select-category with the legacy context payload', async () => {
		lookupWillCallDropsheet.mockResolvedValue({
			dropSheetId: 42
		});

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
			expect(goto).toHaveBeenCalledWith(
				'/select-category/42?loadNumber=WC-042&deliveryNumber=WC-042&driverName=WILL+CALL&willcall=true&returnTo=%2Fhome'
			);
		});
	});

	it('shows an inline scanner-safe error and keeps the scan field ready when the lookup fails', async () => {
		lookupWillCallDropsheet.mockRejectedValue(new Error('Load number WC-404 is not a will call order.'));

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
		expectHomeActionForm('home-card-staging', '/staging');
		expectHomeActionForm('home-card-loading', '/dropsheets');
		expectHomeActionForm('home-card-add-loader', '/loaders');
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

		const changeTargetButton = document.querySelector('button[type="submit"]');
		if (!(changeTargetButton instanceof HTMLButtonElement)) {
			throw new Error('Expected change target button.');
		}

		expect(changeTargetButton.textContent?.trim()).toBe('Change target');
		const formElement = changeTargetButton.closest('form');
		if (!(formElement instanceof HTMLFormElement)) {
			throw new Error('Expected change target form.');
		}

		const returnToInput = formElement.querySelector('input[name="returnTo"]');
		if (!(returnToInput instanceof HTMLInputElement)) {
			throw new Error('Expected change target returnTo input.');
		}

		expect(formElement.getAttribute('action')).toBe('/location');
		expect(returnToInput.value).toBe('/home');
	});

	it('keeps the back affordance disabled for now and hides the target link for operators', async () => {
		render(HomePage, { data: baseData, params: {} });

		await expect.element(page.getByRole('button', { name: 'Back' })).toBeDisabled();
		await expect
			.element(page.getByRole('button', { name: 'Change target' }))
			.not.toBeInTheDocument();
	});
});
