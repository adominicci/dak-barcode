import * as v from 'valibot';
import { OPERATIONAL_DEPARTMENTS } from '$lib/types';
import type { LoadingScanRequest, ScanResult, StagingScanRequest } from '$lib/types';
import type {
	RawDakLoadingScanRequest,
	RawDakScanResult,
	RawDakStagingScanRequest,
	RawCustomerPortalLoadingScanResult
} from '$lib/types/raw-dak';
import { fetchDak, fetchDst } from './proxy';
import { mapCustomerPortalLoadingScanResult, mapDakScanResult } from './type-mappers';

export const DAK_STAGING_SCAN_ROUTE = '/v1/scan/process-staging' as const;
export const DAK_LOADING_SCAN_ROUTE = '/v1/scan/process-loading' as const;
export const DST_LOADING_SCAN_ROUTE = '/api/barcode-update/process-loading-scan-v2' as const;
export const DAK_STAGING_SCAN_DEPENDENCY = 'DAK-193' as const;
export const DAK_LOADING_SCAN_DEPENDENCY = 'DAK-194' as const;

export const stagingScanInputSchema = v.object({
	scannedText: v.pipe(v.string(), v.nonEmpty('Expected scanned text')),
	department: v.picklist(OPERATIONAL_DEPARTMENTS),
	dropAreaId: v.optional(
		v.nullable(
			v.pipe(
				v.number(),
				v.integer('Expected a whole-number drop area id'),
				v.minValue(1, 'Expected a positive drop area id')
			)
		)
	)
});

export const loadingScanInputSchema = v.object({
	...stagingScanInputSchema.entries,
	loadNumber: v.pipe(v.string(), v.nonEmpty('Expected a non-empty load number')),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name')),
	dropSheetId: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
	locationId: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
	sequence: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
	selectedDropIndex: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)))
});

export function serializeDakStagingScanRequest(
	input: StagingScanRequest
): RawDakStagingScanRequest {
	const payload: RawDakStagingScanRequest = {
		scanned_text: input.scannedText,
		department: input.department
	};

	if (typeof input.dropAreaId === 'number') {
		payload.drop_area_id = input.dropAreaId;
	}

	return payload;
}

export function serializeDakLoadingScanRequest(
	input: LoadingScanRequest
): RawDakLoadingScanRequest {
	return {
		...serializeDakStagingScanRequest(input),
		load_number: input.loadNumber,
		loader_name: input.loaderName
	};
}

export function serializeDstLoadingScanRequest(input: LoadingScanRequest) {
	return {
		ScannedText: input.scannedText,
		Department: input.department,
		DropAreaID: typeof input.dropAreaId === 'number' ? input.dropAreaId : null,
		LoadNumber: input.loadNumber,
		LoaderName: input.loaderName,
		DropSheetID: input.dropSheetId,
		LocationID: input.locationId,
		DSSequence: input.sequence,
		SelectedDropIndex: input.selectedDropIndex
	};
}

function pendingScanResult(
	route: typeof DAK_STAGING_SCAN_ROUTE | typeof DAK_LOADING_SCAN_ROUTE,
	dependency: typeof DAK_STAGING_SCAN_DEPENDENCY | typeof DAK_LOADING_SCAN_DEPENDENCY,
	label: 'staging' | 'loading'
): ScanResult {
	return {
		scanType: null,
		status: 'api-error',
		message: `The dak-web ${label} scan endpoint ${route} is not available yet. Backend delivery is still pending on ${dependency}.`,
		needsLocation: false,
		needPick: null,
		dropArea: null
	};
}

function apiErrorResult(message: string): ScanResult {
	return {
		scanType: null,
		status: 'api-error',
		message,
		needsLocation: false,
		needPick: null,
		dropArea: null
	};
}

export async function processDakStagingScan(input: StagingScanRequest): Promise<ScanResult> {
	try {
		const response = await fetchDak(DAK_STAGING_SCAN_ROUTE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(serializeDakStagingScanRequest(input))
		});

		if (!response.ok) {
			const message = (await response.text()).trim();
			return apiErrorResult(message || 'The staging scan request failed.');
		}

		let payload: RawDakScanResult;
		try {
			payload = (await response.json()) as RawDakScanResult;
		} catch {
			return apiErrorResult('The dak-web staging scan endpoint returned an invalid response payload.');
		}

		try {
			return mapDakScanResult(payload);
		} catch {
			return apiErrorResult('The dak-web staging scan endpoint returned an invalid response payload.');
		}
	} catch (error) {
		return apiErrorResult(error instanceof Error ? error.message : 'The staging scan request failed.');
	}
}

export async function processDakLoadingScan(input: LoadingScanRequest): Promise<ScanResult> {
	try {
		const response = await fetchDak(DAK_LOADING_SCAN_ROUTE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(serializeDakLoadingScanRequest(input))
		});

		if (!response.ok) {
			const message = (await response.text()).trim();
			return apiErrorResult(message || 'The loading scan request failed.');
		}

		let payload: RawDakScanResult;
		try {
			payload = (await response.json()) as RawDakScanResult;
		} catch {
			return apiErrorResult('The dak-web loading scan endpoint returned an invalid response payload.');
		}

		try {
			return mapDakScanResult(payload);
		} catch {
			return apiErrorResult('The dak-web loading scan endpoint returned an invalid response payload.');
		}
	} catch (error) {
		return apiErrorResult(error instanceof Error ? error.message : 'The loading scan request failed.');
	}
}

export async function processDstLoadingScan(input: LoadingScanRequest): Promise<ScanResult> {
	try {
		const response = await fetchDst(DST_LOADING_SCAN_ROUTE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(serializeDstLoadingScanRequest(input))
		});

		if (!response.ok) {
			const message = (await response.text()).trim();
			return apiErrorResult(message || 'The loading scan request failed.');
		}

		let payload: RawCustomerPortalLoadingScanResult;
		try {
			payload = (await response.json()) as RawCustomerPortalLoadingScanResult;
		} catch {
			return apiErrorResult(
				'The CustomerPortal loading scan endpoint returned an invalid response payload.'
			);
		}

		try {
			return mapCustomerPortalLoadingScanResult(payload);
		} catch {
			return apiErrorResult(
				'The CustomerPortal loading scan endpoint returned an invalid response payload.'
			);
		}
	} catch (error) {
		return apiErrorResult(error instanceof Error ? error.message : 'The loading scan request failed.');
	}
}
