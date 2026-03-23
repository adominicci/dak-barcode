import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
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

	it('returns a descriptive pending-backend result for staging scans', async () => {
		const expected: ScanResult = {
			outcome: 'api-error',
			message:
				'The dak-web staging scan endpoint /v1/scan/process-staging is not available yet. Backend delivery is still pending on DAK-193.'
		};

		await expect(
			processDakStagingScan({
				scannedText: 'R123',
				department: 'Roll',
				dropAreaId: 7
			})
		).resolves.toEqual(expected);
	});

	it('returns a descriptive pending-backend result for loading scans', async () => {
		const expected: ScanResult = {
			outcome: 'api-error',
			message:
				'The dak-web loading scan endpoint /v1/scan/process-loading is not available yet. Backend delivery is still pending on DAK-194.'
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
