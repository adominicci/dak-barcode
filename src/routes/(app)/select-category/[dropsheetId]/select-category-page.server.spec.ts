import { describe, expect, it, vi } from 'vitest';

const { getDstLoaders } = vi.hoisted(() => ({
	getDstLoaders: vi.fn()
}));

vi.mock('$lib/server/dst-queries', () => ({
	getDstLoaders
}));

import { load } from './+page.server';

describe('select-category page server load', () => {
	it('returns the validated dropsheet id, the carried load number, the optional drop weight, and only active loader options', async () => {
		getDstLoaders.mockResolvedValue([
			{ id: 7, name: 'Alex', isActive: true },
			{ id: 8, name: 'Inactive Loader', isActive: false },
			{ id: 9, name: 'Casey', isActive: true }
		]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: '42',
			dropWeight: null,
			loaders: [
				{ id: 7, name: 'Alex', isActive: true },
				{ id: 9, name: 'Casey', isActive: true }
			]
		});
	});

	it('prefers the load number carried from the dropsheet list query string', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }]
		});
	});

	it('accepts the legacy deliveryNumber query when loadNumber is absent', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?deliveryNumber=L-042')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }]
		});
	});

	it('parses the carried dropsheet weight when the dropsheet list hands it forward', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042&dropWeight=2152.4')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			dropWeight: 2152.4,
			loaders: [{ id: 7, name: 'Alex', isActive: true }]
		});
	});

	it('preserves zero dropsheet weight when the handoff includes it explicitly', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042&dropWeight=0')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			dropWeight: 0,
			loaders: [{ id: 7, name: 'Alex', isActive: true }]
		});
	});

	it('rejects invalid dropsheet ids with a 404', async () => {
		getDstLoaders.mockResolvedValue([]);

		await expect(load({ params: { dropsheetId: 'not-a-number' } } as never)).rejects.toMatchObject(
			{
				status: 404
			}
		);
	});
});
