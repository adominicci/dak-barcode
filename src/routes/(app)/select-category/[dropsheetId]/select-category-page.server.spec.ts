import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getDstLoaders } = vi.hoisted(() => ({
	getDstLoaders: vi.fn()
}));

const { getDakLoadersForDropsheet } = vi.hoisted(() => ({
	getDakLoadersForDropsheet: vi.fn()
}));

const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

vi.mock('$lib/server/dst-queries', () => ({
	getDstLoaders
}));

vi.mock('$lib/server/dak-loader-sessions', () => ({
	getDakLoadersForDropsheet
}));

import { load } from './+page.server';

describe('select-category page server load', () => {
	beforeEach(() => {
		consoleError.mockClear();
	});

	it('returns the validated dropsheet id, the carried load number, driver name, the optional drop weight, and only active loader options', async () => {
		getDstLoaders.mockResolvedValue([
			{ id: 7, name: 'Alex', isActive: true },
			{ id: 8, name: 'Inactive Loader', isActive: false },
			{ id: 9, name: 'Casey', isActive: true }
		]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42')
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: '42',
			driverName: null,
			dropWeight: null,
			loaders: [
				{ id: 7, name: 'Alex', isActive: true },
				{ id: 9, name: 'Casey', isActive: true }
			],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: null
		});
	});

	it('prefers the load number carried from the dropsheet list query string', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockResolvedValue([
			{
				id: 1,
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex',
				startedAt: '2026-03-24T12:00:00.000Z',
				endedAt: null
			},
			{
				id: 2,
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex',
				startedAt: '2026-03-24T12:05:00.000Z',
				endedAt: null
			},
			{
				id: 3,
				dropSheetId: 42,
				loaderId: 8,
				department: 'Wrap',
				loaderName: 'Casey',
				startedAt: '2026-03-24T12:10:00.000Z',
				endedAt: null
			},
			{
				id: 4,
				dropSheetId: 42,
				loaderId: 9,
				department: 'Roll',
				loaderName: 'Jordan',
				startedAt: '2026-03-24T12:15:00.000Z',
				endedAt: null
			},
			{
				id: 5,
				dropSheetId: 42,
				loaderId: 10,
				department: 'Parts',
				loaderName: 'Taylor',
				startedAt: '2026-03-24T12:20:00.000Z',
				endedAt: null
			}
		]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042')
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: null,
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: ['Alex', 'Casey'] },
				{ department: 'Roll', loaderNames: ['Jordan'] },
				{ department: 'Parts', loaderNames: ['Taylor'] }
			],
			departmentLoadersError: null
		});
	});

	it('returns an explicit roster error when the loader session fetch fails', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockRejectedValue(new Error('Roster unavailable.'));

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042')
			} as never)
		).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: null,
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: 'Roster unavailable.'
		});

		expect(consoleError).toHaveBeenCalledWith(
			'Failed to load department loaders for dropsheet',
			expect.objectContaining({ dropSheetId: 42 })
		);
	});

	it('accepts the legacy deliveryNumber query when loadNumber is absent', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?deliveryNumber=L-042')
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: null,
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: null
		});
	});

	it('carries the driver name from the dropsheet list handoff when present', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL(
					'https://example.com/select-category/42?loadNumber=L-042&driverName=David%20Schmidt&dropWeight=2152.4'
				)
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: 'David Schmidt',
			dropWeight: 2152.4,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: null
		});
	});

	it('parses the carried dropsheet weight when the dropsheet list hands it forward', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042&dropWeight=2152.4')
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: null,
			dropWeight: 2152.4,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: null
		});
	});

	it('treats zero dropsheet weight as unknown when the handoff includes it explicitly', async () => {
		getDstLoaders.mockResolvedValue([{ id: 7, name: 'Alex', isActive: true }]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(
			load({
				params: { dropsheetId: '42' },
				url: new URL('https://example.com/select-category/42?loadNumber=L-042&dropWeight=0')
			} as never)
			).resolves.toEqual({
			dropSheetId: 42,
			loadNumber: 'L-042',
			driverName: null,
			dropWeight: null,
			loaders: [{ id: 7, name: 'Alex', isActive: true }],
			departmentLoaders: [
				{ department: 'Wrap', loaderNames: [] },
				{ department: 'Roll', loaderNames: [] },
				{ department: 'Parts', loaderNames: [] }
			],
			departmentLoadersError: null
		});
	});

	it('rejects invalid dropsheet ids with a 404', async () => {
		getDstLoaders.mockResolvedValue([]);
		getDakLoadersForDropsheet.mockResolvedValue([]);

		await expect(load({ params: { dropsheetId: 'not-a-number' } } as never)).rejects.toMatchObject(
			{
				status: 404
			}
		);
	});
});
