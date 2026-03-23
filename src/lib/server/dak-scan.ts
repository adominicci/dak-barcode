import * as v from 'valibot';
import type { LoadingScanRequest, ScanResult, StagingScanRequest } from '$lib/types';
import type { RawDakLoadingScanRequest, RawDakStagingScanRequest } from '$lib/types/raw-dak';

export const DAK_STAGING_SCAN_ROUTE = '/v1/scan/process-staging' as const;
export const DAK_LOADING_SCAN_ROUTE = '/v1/scan/process-loading' as const;
export const DAK_STAGING_SCAN_DEPENDENCY = 'DAK-193' as const;
export const DAK_LOADING_SCAN_DEPENDENCY = 'DAK-194' as const;

export const stagingScanInputSchema = v.object({
	scannedText: v.pipe(v.string(), v.nonEmpty('Expected scanned text')),
	department: v.picklist(['Roll', 'Wrap', 'Parts']),
	dropAreaId: v.number()
});

export const loadingScanInputSchema = v.object({
	...stagingScanInputSchema.entries,
	loadNumber: v.pipe(v.string(), v.nonEmpty('Expected a non-empty load number')),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name'))
});

export function serializeDakStagingScanRequest(
	input: StagingScanRequest
): RawDakStagingScanRequest {
	return {
		scanned_text: input.scannedText,
		department: input.department,
		drop_area_id: input.dropAreaId
	};
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

function pendingScanResult(
	route: typeof DAK_STAGING_SCAN_ROUTE | typeof DAK_LOADING_SCAN_ROUTE,
	dependency: typeof DAK_STAGING_SCAN_DEPENDENCY | typeof DAK_LOADING_SCAN_DEPENDENCY,
	label: 'staging' | 'loading'
): ScanResult {
	return {
		outcome: 'api-error',
		message: `The dak-web ${label} scan endpoint ${route} is not available yet. Backend delivery is still pending on ${dependency}.`
	};
}

export async function processDakStagingScan(input: StagingScanRequest): Promise<ScanResult> {
	serializeDakStagingScanRequest(input);

	return pendingScanResult(DAK_STAGING_SCAN_ROUTE, DAK_STAGING_SCAN_DEPENDENCY, 'staging');
}

export async function processDakLoadingScan(input: LoadingScanRequest): Promise<ScanResult> {
	serializeDakLoadingScanRequest(input);

	return pendingScanResult(DAK_LOADING_SCAN_ROUTE, DAK_LOADING_SCAN_DEPENDENCY, 'loading');
}
