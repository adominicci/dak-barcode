import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchDak = vi.fn();

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
	return fetchDak.mock.calls.at(-1) as [string, RequestInit | undefined];
}

beforeEach(() => {
	vi.resetModules();
	fetchDak.mockReset();
});

describe('dak loader-session helpers', () => {
	it('loads a single loader session by loader id and maps canonical output', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				LoaderID: 21,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Roll',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z'
			})
		);

		const { getDakLoaderInfo } = await import('./dak-loader-sessions');

		await expect(getDakLoaderInfo(21)).resolves.toEqual({
			id: 21,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Roll',
			loaderName: 'Alex',
			startedAt: '2026-03-20T10:00:00Z',
			endedAt: null
		});

		expect(fetchDak).toHaveBeenCalledOnce();
		expect(getFetchCall()[0]).toBe('/v1/logistics/dropsheet-loader-select-single?loader_id=21');
	});

	it('loads all loader sessions for a dropsheet through the legacy selector endpoint', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse([
				{
					loader_id: 88,
					fkDropSheetID: 42,
					fkLoaderID: 7,
					Department: 'Wrap',
					loader_name: 'Alex',
					started_at: '2026-03-20T10:00:00Z'
				}
			])
		);

		const { getDakLoadersForDropsheet } = await import('./dak-loader-sessions');

		await expect(getDakLoadersForDropsheet(42)).resolves.toEqual([
			{
				id: 88,
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex',
				startedAt: '2026-03-20T10:00:00Z',
				endedAt: null
			}
		]);

		expect(fetchDak).toHaveBeenCalledOnce();
		expect(getFetchCall()[0]).toBe('/v1/logistics/dropsheet-loader-select?fk_dropsheet_id=42');
	});

	it('upserts a loader session through the shared dak proxy with a normalized JSON body', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				loader_id: 88,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Wrap',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z'
			})
		);

		const { upsertDakLoaderSession } = await import('./dak-loader-sessions');

		await expect(
			upsertDakLoaderSession({
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex',
				startedAt: '2026-03-20T10:00:00Z'
			})
		).resolves.toEqual({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Wrap',
			loaderName: 'Alex',
			startedAt: '2026-03-20T10:00:00Z',
			endedAt: null
		});

		const [path, init] = getFetchCall();
		const headers = new Headers(init?.headers);

		expect(path).toBe('/v1/logistics/dropsheet-loader-upsert');
		expect(init?.method).toBe('POST');
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(JSON.parse(String(init?.body))).toEqual({
			fkDropSheetID: 42,
			fkLoaderID: 7,
			Department: 'Wrap',
			loader_name: 'Alex',
			started_at: '2026-03-20T10:00:00Z'
		});
	});

	it('ends a loader session on the shared upsert endpoint with LoaderID and ended_at', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				LoaderID: 88,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Parts',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z',
				ended_at: '2026-03-20T12:00:00Z'
			})
		);

		const { endDakLoaderSession } = await import('./dak-loader-sessions');

		await expect(
			endDakLoaderSession({
				id: 88,
				dropSheetId: 42,
				loaderId: 7,
				department: 'Parts',
				loaderName: 'Alex',
				startedAt: '2026-03-20T10:00:00Z',
				endedAt: '2026-03-20T12:00:00Z'
			})
		).resolves.toEqual({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Parts',
			loaderName: 'Alex',
			startedAt: '2026-03-20T10:00:00Z',
			endedAt: '2026-03-20T12:00:00Z'
		});

		expect(getFetchCall()[0]).toBe('/v1/logistics/dropsheet-loader-upsert');
		expect(JSON.parse(String(getFetchCall()[1]?.body))).toEqual({
			LoaderID: 88,
			fkDropSheetID: 42,
			fkLoaderID: 7,
			Department: 'Parts',
			loader_name: 'Alex',
			started_at: '2026-03-20T10:00:00Z',
			ended_at: '2026-03-20T12:00:00Z'
		});
	});

	it('fails clearly when dak-web returns no usable single-loader record', async () => {
		fetchDak.mockResolvedValue(jsonResponse({}));

		const { getDakLoaderInfo } = await import('./dak-loader-sessions');

		await expect(getDakLoaderInfo(999)).rejects.toThrow(
			'DAK route /v1/logistics/dropsheet-loader-select-single returned no usable record.'
		);
	});

	it('fails clearly when dak-web returns an invalid loader-session list', async () => {
		fetchDak.mockResolvedValue(jsonResponse({}));

		const { getDakLoadersForDropsheet } = await import('./dak-loader-sessions');

		await expect(getDakLoadersForDropsheet(42)).rejects.toThrow(
			'DAK route /v1/logistics/dropsheet-loader-select returned an invalid list response.'
		);
	});
});
