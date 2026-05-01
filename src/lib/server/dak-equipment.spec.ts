import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchDak } = vi.hoisted(() => ({
	fetchDak: vi.fn()
}));

vi.mock('./proxy', () => ({
	fetchDak
}));

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json'
		},
		...init
	});
}

function getFetchCall() {
	return fetchDak.mock.calls.at(-1) as [
		string,
		RequestInit | undefined,
		{ dbTarget?: string } | undefined
	];
}

describe('dak equipment lookup helpers', () => {
	beforeEach(() => {
		vi.resetModules();
		fetchDak.mockReset();
	});

	it('loads trailers from the EQUIPMENT database filtered by category and selected location', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse([
				{
					id: '1754339873475x672952932394336300',
					equipment_name: '16208-Transfer Trailer',
					photo_url: null,
					equipment_category: 'Trailers',
					location: 'Freeport'
				}
			])
		);

		const { getDakEquipmentTrailers } = await import('./dak-equipment');

		await expect(getDakEquipmentTrailers('Freeport')).resolves.toEqual([
			{
				id: '1754339873475x672952932394336300',
				name: '16208-Transfer Trailer',
				photoUrl: null
			}
		]);

		expect(fetchDak).toHaveBeenCalledOnce();
		const [path, init, options] = getFetchCall();
		const url = new URL(path, 'https://dak.internal');

		expect(url.pathname).toBe('/v1/lookup-tables/equipments');
		expect(url.searchParams.get('equipment_category')).toBe('Trailers');
		expect(url.searchParams.get('location')).toBe('Freeport');
		expect(init).toBeUndefined();
		expect(options).toEqual({ dbTarget: 'EQUIPMENT' });
	});

	it('updates dropsheet trailer fields through the active dak-web database', async () => {
		fetchDak.mockResolvedValue(jsonResponse({ affected_rows: 1 }));

		const { updateDakDropSheetTrailer } = await import('./dak-equipment');

		await expect(
			updateDakDropSheetTrailer({
				dropSheetId: 42,
				trailerId: '1754339873475x672952932394336300',
				trailerName: '16208-Transfer Trailer',
				trailerUrl: null
			})
		).resolves.toBeUndefined();

		expect(fetchDak).toHaveBeenCalledOnce();
		const [path, init, options] = getFetchCall();
		const headers = new Headers(init?.headers);

		expect(path).toBe('/v1/logistics/dropsheet-trailer-update');
		expect(init?.method).toBe('POST');
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(options).toBeUndefined();
		expect(JSON.parse(String(init?.body))).toEqual({
			DropSheetID: 42,
			trailer_id: '1754339873475x672952932394336300',
			trailer_name: '16208-Transfer Trailer',
			trailer_url: null
		});
	});

	it('fails clearly when dak-web returns an invalid equipment list', async () => {
		fetchDak.mockResolvedValue(jsonResponse({ id: 'not-a-list' }));

		const { getDakEquipmentTrailers } = await import('./dak-equipment');

		await expect(getDakEquipmentTrailers('Canton')).rejects.toThrow(
			'DAK route /v1/lookup-tables/equipments returned an invalid list response.'
		);
	});
});
