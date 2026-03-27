import { describe, expect, it, vi } from 'vitest';

const { getOrderStatusPageLoaders } = vi.hoisted(() => ({
	getOrderStatusPageLoaders: vi.fn()
}));

vi.mock('$lib/server/dst-queries', () => ({
	getDstLoaders: getOrderStatusPageLoaders
}));

import { load } from './+page.server';

describe('order-status page server load', () => {
	it('returns the validated dropsheet id, handoff summary, and active loader options', async () => {
		getOrderStatusPageLoaders.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL(
					'https://example.com/order-status/42?loadNumber=L-042&driverName=David%20Schmidt&dropWeight=2152.4&returnTo=%2Fselect-category%2F42%3FloadNumber%3DL-042'
				)
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: 'David Schmidt',
			dropWeight: 2152.4,
			returnTo: '/select-category/42?loadNumber=L-042'
		});
	});

	it('treats missing summary values as null and keeps the select-category return target optional', async () => {
		getOrderStatusPageLoaders.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/order-status/42')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: '42',
			driverName: null,
			dropWeight: null,
			returnTo: null
		});
	});
});
