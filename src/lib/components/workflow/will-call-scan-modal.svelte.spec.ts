import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { lookupWillCallDropsheet } = vi.hoisted(() => ({
	lookupWillCallDropsheet: vi.fn()
}));

vi.mock('$lib/will-call.remote', () => ({
	lookupWillCallDropsheet
}));

import WillCallScanModal from './will-call-scan-modal.svelte';

function createDeferred<T>() {
	let resolvePromise!: (value: T | PromiseLike<T>) => void;
	let rejectPromise!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolve, reject) => {
		resolvePromise = resolve;
		rejectPromise = reject;
	});

	return {
		promise,
		resolve: resolvePromise,
		reject: rejectPromise
	};
}

describe('will-call scan modal', () => {
	beforeEach(() => {
		lookupWillCallDropsheet.mockReset();
	});

	it('keeps the close action disabled while a lookup is pending and only resolves after the request finishes', async () => {
		const lookupRequest = createDeferred<{ dropSheetId: number }>();
		const onClose = vi.fn();
		const onResolved = vi.fn();
		lookupWillCallDropsheet.mockReturnValue(lookupRequest.promise);

		render(WillCallScanModal, {
			onClose,
			onResolved
		});

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
		});

		await expect.element(page.getByRole('button', { name: 'Close will call scan modal' })).toBeDisabled();
		expect(onClose).not.toHaveBeenCalled();

		lookupRequest.resolve({ dropSheetId: 42 });
		await vi.waitFor(() => {
			expect(onResolved).toHaveBeenCalledWith(42, 'WC-042');
		});
	});
});
