import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as v from 'valibot';

const fetchDst = vi.fn();

vi.mock('./proxy', () => ({
	fetchDst
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
	return fetchDst.mock.calls.at(-1) as [string, RequestInit | undefined];
}

beforeEach(() => {
	vi.resetModules();
	fetchDst.mockReset();
});

describe('dst query helpers', () => {
	it('loads active loaders through fetchDst and maps the canonical contract', async () => {
		fetchDst.mockResolvedValue(
			jsonResponse([
				{
					LoaderID: 7,
					Loader: 'Alex',
					IsActive: true
				}
			])
		);

		const { getDstLoaders } = await import('./dst-queries');

		await expect(getDstLoaders()).resolves.toEqual([
			{
				id: 7,
				name: 'Alex',
				isActive: true
			}
		]);

		expect(fetchDst).toHaveBeenCalledOnce();
		expect(getFetchCall()[0]).toBe('/api/barcode-get/get-loaders');
	});

	it('loads dropsheets with the legacy query parameter and stable camelCase output', async () => {
		fetchDst.mockResolvedValue(
			jsonResponse([
				{
					DropSheetID: 42,
					LoadNumber: 'L-100',
					LoadNum: '100',
					Trailer: 'TR-9',
					PercentCompleted: 87.5,
					LoadedTS: '2026-03-20T10:00:00Z',
					DropWeight: 1234.5,
					Driver: 12,
					DriverName: 'Dylan',
					AllLoaded: false,
					Loader: 'Alex'
				}
			])
		);

		const { getDstDropsheets } = await import('./dst-queries');

		await expect(getDstDropsheets('2026-03-23')).resolves.toEqual([
			{
				id: 42,
				loadNumber: 'L-100',
				loadNumberShort: '100',
				trailer: 'TR-9',
				percentCompleted: 87.5,
				loadedAt: '2026-03-20T10:00:00Z',
				dropWeight: 1234.5,
				driverId: 12,
				driverName: 'Dylan',
				allLoaded: false,
				loaderName: 'Alex'
			}
		]);

		const [path] = getFetchCall();
		const url = new URL(path, 'https://dst.example.com');

		expect(url.pathname).toBe('/api/barcode-get/select-loading-dropsheet');
		expect(url.searchParams.get('dropSheetDate')).toBe('2026-03-23');
	});

	it('loads dropsheet status through the POST endpoint with a JSON body', async () => {
		fetchDst.mockResolvedValue(
			jsonResponse({
				DropSheetID: 42,
				StatusOnLoadSlitDS: 'DUE',
				StatusOnLoadTrimDS: 'STOP',
				StatusOnLoadWrapDS: 'READY',
				StatusOnLoadRollDS: 'DONE',
				StatusOnLoadPartDS: 'WAIT',
				StatusOnLoadSoffitDS: null
			})
		);

		const { getDstDropsheetStatus } = await import('./dst-queries');

		await expect(getDstDropsheetStatus(42)).resolves.toEqual({
			scope: 'dropsheet',
			subjectId: 42,
			slit: 'DUE',
			trim: 'STOP',
			wrap: 'READY',
			roll: 'DONE',
			parts: 'WAIT',
			soffit: null
		});

		const [path, init] = getFetchCall();
		const headers = new Headers(init?.headers);

		expect(path).toBe('/api/barcode-update/check-onload-statusDS-departments');
		expect(init?.method).toBe('POST');
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(JSON.parse(String(init?.body))).toEqual({
			DropSheetID: 42
		});
	});

	it('returns null for invalid drop-area lookups instead of leaking an empty backend record', async () => {
		fetchDst.mockResolvedValue(jsonResponse({}));

		const { getDstDropArea } = await import('./dst-queries');

		await expect(getDstDropArea(999)).resolves.toBeNull();
		expect(getFetchCall()[0]).toBe('/api/barcode-get/get-droparea?dropareaid=999');
	});

	it('loads department drop areas through the selector endpoint', async () => {
		fetchDst.mockResolvedValue(
			jsonResponse([
				{
					DropAreaID: 5,
					DropArea: 'R12',
					wrapLocation: false,
					partLocation: true,
					rollLocation: true,
					loadLocation: true,
					driverLocation: false,
					firstCharacter: 'R'
				}
			])
		);

		const { getDstDropAreasByDepartment } = await import('./dst-queries');

		await expect(getDstDropAreasByDepartment('Roll')).resolves.toEqual([
			{
				id: 5,
				name: 'R12',
				supportsWrap: false,
				supportsParts: true,
				supportsRoll: true,
				supportsLoading: true,
				supportsDriverLocation: false,
				firstCharacter: 'R'
			}
		]);

		const [path, init] = getFetchCall();

		expect(path).toBe('/api/barcode-update/select-drop-area');
		expect(init?.method).toBe('POST');
		expect(JSON.parse(String(init?.body))).toEqual({
			Department: 'Roll'
		});
	});

	it('normalizes category-list responses to the canonical operational departments', async () => {
		fetchDst.mockResolvedValue(jsonResponse(['Roll', { category: 'Wrap' }, { Department: 'Parts' }]));

		const { getDstCategoryList } = await import('./dst-queries');

		await expect(getDstCategoryList()).resolves.toEqual(['Roll', 'Wrap', 'Parts']);
		expect(getFetchCall()[0]).toBe('/api/barcode-get/category-list');
	});

	it('loads the required load-view queries and enforces a usable primary record', async () => {
		fetchDst
			.mockResolvedValueOnce(
				jsonResponse({
					DropSequence: 3,
					DropSheetID: 42,
					DropSheetCustID: 84,
					LoadNumber: 'L-100',
					LoadDate: '2026-03-20',
					LocationID: 1,
					DSSequence: 9,
					fkCustomerID: 222,
					CustomerName: 'Acme',
					Driver: 'Dylan',
					TotalCount: '12/20',
					LabelCount: 20,
					Scanned: 12,
					NeedPick: 8
				})
			)
			.mockResolvedValueOnce(
				jsonResponse([
					{
						FirstOfPartListID: 'PL-1',
						LabelNumber: 77,
						OrderSoNumber: 'SO-9',
						LoadNumber: 'L-100',
						DSSequence: 9,
						DropArea: 'R12',
						Scanned: true,
						LocationID: 1,
						length: '10ft',
						CategoryID: 3,
						LPID: 999
					}
				])
			)
			.mockResolvedValueOnce(
				jsonResponse([
					{
						DropSequence: 3,
						DropSheetID: 42,
						DropSheetCustID: 84,
						LoadNumber: 'L-100',
						LoadDate: '2026-03-20',
						LocationID: 1,
						DSSequence: 9,
						fkCustomerID: 222,
						CustomerName: 'Acme',
						Driver: 'Dylan',
						TotalCount: '12/20',
						LabelCount: 20,
						Scanned: 12,
						NeedPick: 8
					}
				])
			)
			.mockResolvedValueOnce(jsonResponse({ NumberOfDrops: 14 }));

		const {
			getDstLoadViewDetail,
			getDstLoadViewDetailAll,
			getDstLoadViewUnion,
			getDstNumberOfDrops
		} = await import('./dst-queries');

		await expect(
			getDstLoadViewDetail({
				dropSheetId: 42,
				locationId: 1,
				sequence: 9
			})
		).resolves.toEqual({
			dropSequence: 3,
			dropSheetId: 42,
			dropSheetCustomerId: 84,
			loadNumber: 'L-100',
			loadDate: '2026-03-20',
			locationId: 1,
			sequence: 9,
			customerId: 222,
			customerName: 'Acme',
			driverName: 'Dylan',
			totalCountText: '12/20',
			labelCount: 20,
			scannedCount: 12,
			needPickCount: 8
		});

		await expect(
			getDstLoadViewUnion({
				loadNumber: 'L-100',
				sequence: 9,
				locationId: 1
			})
		).resolves.toEqual([
			{
				partListId: 'PL-1',
				labelNumber: 77,
				orderSoNumber: 'SO-9',
				loadNumber: 'L-100',
				sequence: 9,
				dropAreaName: 'R12',
				scanned: true,
				locationId: 1,
				lengthText: '10ft',
				categoryId: 3,
				lpid: 999
			}
		]);

		await expect(
			getDstLoadViewDetailAll({
				dropSheetId: 42,
				locationId: 1
			})
		).resolves.toEqual([
			{
				dropSequence: 3,
				dropSheetId: 42,
				dropSheetCustomerId: 84,
				loadNumber: 'L-100',
				loadDate: '2026-03-20',
				locationId: 1,
				sequence: 9,
				customerId: 222,
				customerName: 'Acme',
				driverName: 'Dylan',
				totalCountText: '12/20',
				labelCount: 20,
				scannedCount: 12,
				needPickCount: 8
			}
		]);

		await expect(
			getDstNumberOfDrops({
				dropSheetId: 42,
				locationId: 1
			})
		).resolves.toBe(14);

		expect(fetchDst.mock.calls).toHaveLength(4);
	});

	it('loads staging day queries into the canonical staging list item contract', async () => {
		fetchDst
			.mockResolvedValueOnce(
				jsonResponse([
					{
						LPIDDetail: 12,
						PartListID: 'PL-42',
						PartListDesc: 'Trim coil',
						OrderSONumber: 'SO-100',
						QtyDet: 3,
						DropArea: 'R12',
						LPID: 99
					}
				])
			)
			.mockResolvedValueOnce(
				jsonResponse([
					{
						LPIDDetail: 13,
						PartListID: 'PL-43',
						PartListDesc: 'Roll bundle',
						OrderSONumber: 'SO-101',
						QtyDet: 5,
						DropArea: 'R13',
						LPID: 100
					}
				])
			);

		const { getDstStagingPartsForDay, getDstStagingPartsForDayRoll } = await import(
			'./dst-queries'
		);

		await expect(getDstStagingPartsForDay()).resolves.toEqual([
			{
				lpidDetail: 12,
				partListId: 'PL-42',
				partListDescription: 'Trim coil',
				orderSoNumber: 'SO-100',
				quantity: 3,
				dropAreaName: 'R12',
				lpid: 99
			}
		]);

		await expect(getDstStagingPartsForDayRoll('SO-101')).resolves.toEqual([
			{
				lpidDetail: 13,
				partListId: 'PL-43',
				partListDescription: 'Roll bundle',
				orderSoNumber: 'SO-101',
				quantity: 5,
				dropAreaName: 'R13',
				lpid: 100
			}
		]);

		const [path] = getFetchCall();
		const url = new URL(path, 'https://dst.example.com');

		expect(url.pathname).toBe('/api/barcode-get/get-staging-parts-for-day-roll');
		expect(url.searchParams.get('order_so_number')).toBe('SO-101');
	});

	it('fails loudly for required single-record queries that return no usable payload', async () => {
		fetchDst.mockResolvedValue(jsonResponse({}));

		const { getDstLoadViewDetail } = await import('./dst-queries');

		await expect(
			getDstLoadViewDetail({
				dropSheetId: 42,
				locationId: 1,
				sequence: 9
			})
		).rejects.toThrow(
			'DST route /api/barcode-update/loadview-details-by-sequence returned no usable record.'
		);
	});

	it('surfaces non-ok DST responses with a descriptive error message', async () => {
		fetchDst.mockResolvedValue(
			new Response('Upstream exploded', {
				status: 500,
				statusText: 'Internal Server Error'
			})
		);

		const { getDstLoaders } = await import('./dst-queries');

		await expect(getDstLoaders()).rejects.toThrow(
			'DST request failed for /api/barcode-get/get-loaders: 500 Internal Server Error Upstream exploded'
		);
	});
});

describe('dst query schemas', () => {
	it('validates scalar query inputs used by the remote wrappers', async () => {
		const {
			departmentSchema,
			dropAreaIdSchema,
			dropSheetDateSchema,
			dropSheetIdSchema,
			orderSoNumberSchema
		} = await import('./dst-queries');

		expect(v.safeParse(dropSheetDateSchema, '2026-03-23').success).toBe(true);
		expect(v.safeParse(dropSheetDateSchema, '').success).toBe(false);
		expect(v.safeParse(dropSheetDateSchema, '2026-3-23').success).toBe(false);
		expect(v.safeParse(dropSheetDateSchema, '2026-03-23T12:00:00Z').success).toBe(false);
		expect(v.safeParse(dropSheetDateSchema, 42).success).toBe(false);
		expect(v.safeParse(dropSheetIdSchema, 42).success).toBe(true);
		expect(v.safeParse(dropSheetIdSchema, '42').success).toBe(false);
		expect(v.safeParse(dropAreaIdSchema, 9).success).toBe(true);
		expect(v.safeParse(dropAreaIdSchema, '9').success).toBe(false);
		expect(v.safeParse(departmentSchema, 'Roll').success).toBe(true);
		expect(v.safeParse(departmentSchema, 'Soffit').success).toBe(false);
		expect(v.safeParse(orderSoNumberSchema, undefined).success).toBe(true);
		expect(v.safeParse(orderSoNumberSchema, null).success).toBe(true);
		expect(v.safeParse(orderSoNumberSchema, 'SO-101').success).toBe(true);
		expect(v.safeParse(orderSoNumberSchema, 101).success).toBe(false);
	});

	it('validates the structured load-view query inputs used by the remote wrappers', async () => {
		const {
			loadViewDetailAllInputSchema,
			loadViewDetailInputSchema,
			loadViewUnionInputSchema,
			numberOfDropsInputSchema
		} = await import('./dst-queries');

		expect(
			v.safeParse(loadViewDetailInputSchema, {
				dropSheetId: 42,
				locationId: 1,
				sequence: 9
			}).success
		).toBe(true);
		expect(
			v.safeParse(loadViewDetailInputSchema, {
				dropSheetId: 42,
				locationId: 1
			}).success
		).toBe(false);
		expect(
			v.safeParse(loadViewUnionInputSchema, {
				loadNumber: 'L-100',
				sequence: 9,
				locationId: 1
			}).success
		).toBe(true);
		expect(
			v.safeParse(loadViewUnionInputSchema, {
				loadNumber: 'L-100',
				sequence: '9',
				locationId: 1
			}).success
		).toBe(false);
		expect(
			v.safeParse(loadViewDetailAllInputSchema, {
				dropSheetId: 42,
				locationId: 1
			}).success
		).toBe(true);
		expect(
			v.safeParse(numberOfDropsInputSchema, {
				dropSheetId: 42,
				locationId: 1
			}).success
		).toBe(true);
		expect(
			v.safeParse(numberOfDropsInputSchema, {
				dropSheetId: 42,
				locationId: '1'
			}).success
		).toBe(false);
	});
});
