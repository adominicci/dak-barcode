import { describe, expect, it } from 'vitest';
import { getOperatorErrorMessage } from './operator-error';

describe('getOperatorErrorMessage', () => {
	it('falls back for Svelte runtime error URLs', () => {
		expect(
			getOperatorErrorMessage(
				new Error('https://svelte.dev/e/experimental_async_required'),
				'Unable to load staging items.'
			)
		).toBe('Unable to load staging items.');
	});

	it('keeps application error messages', () => {
		expect(
			getOperatorErrorMessage(new Error('Loader roster failed to refresh.'), 'Unable to load staging items.')
		).toBe('Loader roster failed to refresh.');
	});

	it('keeps plain object messages from remote-function failures', () => {
		expect(
			getOperatorErrorMessage(
				{ message: 'DAK route /v1/logistics/dropsheet-loader-upsert returned no usable record.' },
				'Unable to start loading.'
			)
		).toBe('DAK route /v1/logistics/dropsheet-loader-upsert returned no usable record.');
	});

	it('falls back for non-error values', () => {
		expect(getOperatorErrorMessage(null, 'Unable to load staging items.')).toBe(
			'Unable to load staging items.'
		);
	});
});
