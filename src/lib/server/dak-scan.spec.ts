import * as v from 'valibot';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { LoadingScanRequest, ScanResult, StagingScanRequest } from '$lib/types';
import type { RawDakLoadingScanRequest, RawDakStagingScanRequest } from '$lib/types/raw-dak';
import {
	DAK_LOADING_SCAN_DEPENDENCY,
	DAK_LOADING_SCAN_ROUTE,
	DAK_STAGING_SCAN_DEPENDENCY,
	DAK_STAGING_SCAN_ROUTE,
	loadingScanInputSchema,
	processDakLoadingScan,
	processDakStagingScan,
	serializeDakLoadingScanRequest,
	serializeDakStagingScanRequest,
	stagingScanInputSchema
} from './dak-scan';

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

beforeEach(() => {
	fetchDak.mockReset();
});

describe('dak scan stub helpers', () => {
	it('validates the staging scan input shape used by the remote command', () => {
		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: 'R123',
				department: 'Roll',
				dropAreaId: 7
			}).success
		).toBe(true);

		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: '',
				department: 'Roll',
				dropAreaId: 7
			}).success
		).toBe(false);

		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: 'R123',
				department: 'Roll',
				dropAreaId: 0
			}).success
		).toBe(false);

		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: 'R123',
				department: 'Roll',
				dropAreaId: 3.7
			}).success
		).toBe(false);

		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: 'LP-100',
				department: 'Wrap'
			}).success
		).toBe(true);

		expect(
			v.safeParse(stagingScanInputSchema, {
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: null
			}).success
		).toBe(true);
	});

	it('validates the loading scan input shape used by the remote command', () => {
		expect(
			v.safeParse(loadingScanInputSchema, {
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: 9,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			}).success
		).toBe(true);

		expect(
			v.safeParse(loadingScanInputSchema, {
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: 9,
				loadNumber: '',
				loaderName: 'Alex'
			}).success
		).toBe(false);
	});

	it('serializes staging scan requests to the dak-web snake_case contract', () => {
		const input: StagingScanRequest = {
			scannedText: 'R123',
			department: 'Parts',
			dropAreaId: 11
		};

		expect(serializeDakStagingScanRequest(input)).toEqual<RawDakStagingScanRequest>({
			scanned_text: 'R123',
			department: 'Parts',
			drop_area_id: 11
		});
	});

	it('omits nullable staging location fields from the dak-web payload', () => {
		const input: StagingScanRequest = {
			scannedText: 'LP-77',
			department: 'Wrap',
			dropAreaId: null
		};

		expect(serializeDakStagingScanRequest(input)).toEqual<RawDakStagingScanRequest>({
			scanned_text: 'LP-77',
			department: 'Wrap'
		});
	});

	it('serializes loading scan requests to the dak-web snake_case contract', () => {
		const input: LoadingScanRequest = {
			scannedText: 'LP-77',
			department: 'Wrap',
			dropAreaId: 8,
			loadNumber: 'L-100',
			loaderName: 'Alex'
		};

		expect(serializeDakLoadingScanRequest(input)).toEqual<RawDakLoadingScanRequest>({
			scanned_text: 'LP-77',
			department: 'Wrap',
			drop_area_id: 8,
			load_number: 'L-100',
			loader_name: 'Alex'
		});
	});

	it('posts staging scans through the shared dak proxy and normalizes location responses', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				scan_type: 'location',
				status: 'success',
				message: 'Location updated.',
				needs_location: false,
				drop_area: {
					drop_area_id: 41,
					drop_area: 'W12'
				}
			})
		);

		await expect(
			processDakStagingScan({
				scannedText: '41',
				department: 'Wrap',
				dropAreaId: null
			})
		).resolves.toEqual({
			scanType: 'location',
			status: 'success',
			message: 'Location updated.',
			needsLocation: false,
			dropArea: {
				id: 41,
				label: 'W12'
			}
		});

		expect(fetchDak).toHaveBeenCalledOnce();
		const [path, init] = fetchDak.mock.calls[0] as [string, RequestInit | undefined];
		const headers = new Headers(init?.headers);

		expect(path).toBe('/v1/scan/process-staging');
		expect(init?.method).toBe('POST');
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(JSON.parse(String(init?.body))).toEqual({
			scanned_text: '41',
			department: 'Wrap'
		});
	});

	it('normalizes staging api failures into a scanner-safe error result', async () => {
		fetchDak.mockResolvedValue(
			new Response('Backend exploded', {
				status: 500
			})
		);

		await expect(
			processDakStagingScan({
				scannedText: 'LP-100',
				department: 'Parts',
				dropAreaId: 12
			})
		).resolves.toEqual({
			scanType: null,
			status: 'api-error',
			message: 'Backend exploded',
			needsLocation: false,
			dropArea: null
		});
	});

	it('normalizes malformed staging payloads into an api error result', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				status: 'success'
			})
		);

		await expect(
			processDakStagingScan({
				scannedText: 'LP-100',
				department: 'Parts',
				dropAreaId: 12
			})
		).resolves.toEqual({
			scanType: null,
			status: 'api-error',
			message:
				'The dak-web staging scan endpoint returned an invalid response payload.',
			needsLocation: false,
			dropArea: null
		});
	});

	it('returns a descriptive pending-backend result for loading scans', async () => {
		const expected: ScanResult = {
			scanType: null,
			status: 'api-error',
			message:
				'The dak-web loading scan endpoint /v1/scan/process-loading is not available yet. Backend delivery is still pending on DAK-194.',
			needsLocation: false,
			dropArea: null
		};

		await expect(
			processDakLoadingScan({
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: 9,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual(expected);
	});

	it('keeps the scan endpoint constants aligned with the backend dependency tickets', () => {
		expect(DAK_STAGING_SCAN_ROUTE).toBe('/v1/scan/process-staging');
		expect(DAK_STAGING_SCAN_DEPENDENCY).toBe('DAK-193');
		expect(DAK_LOADING_SCAN_ROUTE).toBe('/v1/scan/process-loading');
		expect(DAK_LOADING_SCAN_DEPENDENCY).toBe('DAK-194');
		expectTypeOf(processDakStagingScan).toEqualTypeOf<
			(input: StagingScanRequest) => Promise<ScanResult>
		>();
		expectTypeOf(processDakLoadingScan).toEqualTypeOf<
			(input: LoadingScanRequest) => Promise<ScanResult>
		>();
	});
});
