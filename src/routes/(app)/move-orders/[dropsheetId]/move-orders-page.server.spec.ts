import { describe, expect, it, vi } from 'vitest';

const { getMoveOrdersPageLoaders } = vi.hoisted(() => ({
	getMoveOrdersPageLoaders: vi.fn()
}));

vi.mock('$lib/server/dst-queries', () => ({
	getDstLoaders: getMoveOrdersPageLoaders
}));

import { load } from './+page.server';

describe('move-orders page server load', () => {
	it('returns the validated dropsheet id, handoff summary, and optional return target', async () => {
		getMoveOrdersPageLoaders.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL(
					'https://example.com/move-orders/42?loadNumber=L-042&driverName=David%20Schmidt&dropWeight=2152.4&returnTo=%2Fselect-category%2F42%3FloadNumber%3DL-042'
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

	it('falls back safely when deep-linked without summary query parameters', async () => {
		getMoveOrdersPageLoaders.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/move-orders/42')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: '42',
			driverName: null,
			dropWeight: null,
			returnTo: null
		});
	});

	it('drops unsafe returnTo values from the handoff payload', async () => {
		getMoveOrdersPageLoaders.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/move-orders/42?returnTo=https%3A%2F%2Fevil.example.com')
			} as never)
		).resolves.toMatchObject({
			returnTo: null
		});
	});
});
