import { describe, expect, it, vi } from 'vitest';

const { getDstLoaders } = vi.hoisted(() => ({
	getDstLoaders: vi.fn()
}));

vi.mock('$lib/server/dst-queries', () => ({
	getDstLoaders
}));

import { load } from './+page.server';

describe('select-category page server load', () => {
	it('returns the validated dropsheet id and only active loader options', async () => {
		getDstLoaders.mockResolvedValue([
			{ id: 7, name: 'Alex', isActive: true },
			{ id: 8, name: 'Inactive Loader', isActive: false },
			{ id: 9, name: 'Casey', isActive: true }
		]);

		await expect(load({ params: { dropsheetId: '42' } } as never)).resolves.toEqual({
			dropSheetId: 42,
			loaders: [
				{ id: 7, name: 'Alex', isActive: true },
				{ id: 9, name: 'Casey', isActive: true }
			]
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
