import * as v from 'valibot';
import {
	OPERATIONAL_DEPARTMENTS,
	type DepartmentStatus,
	type DropSheetCategoryAvailability,
	type DropArea,
	type DropSheet,
	type LegacyLoadViewAllEntry,
	type LegacyMoveOrderRow,
	type LegacyOrderStatusRow,
	type LoadViewBarcodeCounters,
	type LoadViewDetail,
	type LoadViewUnion,
	type Loader,
	type OperationalDepartment,
	type PalletBelongsToLpidResult,
	type Trailer,
	type WillCallDropsheetLookup,
	type WillCallSignatureRecord,
	type WillCallSignatureUploadInput,
	type StagingListItem
} from '$lib/types';
import type {
	RawDstCategoryListEntry,
	RawDstDepartmentStatusOnDrop,
	RawDstDepartmentStatusOnDropSheet,
	RawDstDropSheetCategoryAvailability,
	RawDstDropArea,
	RawDstDropSheet,
	RawDstWillCallDropSheet,
	RawDstWillCallSignature,
	RawDstLegacyLoadViewAllEntry,
	RawDstLegacyMoveOrderRow,
	RawDstLegacyOrderStatusRow,
	RawDstLoadViewBarcodeCounters,
	RawDstLoadViewDetail,
	RawDstLoadViewUnion,
	RawDstLoader,
	RawDstPalletBelongsToLpid,
	RawDstPalletLpidLookupRow,
	RawDstTrailer,
	RawDstStagingListItem
} from '$lib/types/raw-dst';
import {
	mapDstCategoryList,
	mapDstDepartmentStatusFromDrop,
	mapDstDepartmentStatusFromDropSheet,
	mapDstDropSheetCategoryAvailability,
	mapDstDropArea,
	mapDstDropSheet,
	mapDstWillCallDropsheet,
	mapDstWillCallSignature,
	mapDstLegacyLoadViewAllEntry,
	mapDstLegacyMoveOrderRow,
	mapDstLegacyOrderStatusRow,
	isUsableDstLoadViewBarcodeCounters,
	mapDstLpidForPalletLoad,
	mapDstLoadViewBarcodeCounters,
	mapDstLoadViewDetail,
	mapDstLoadViewUnion,
	mapDstLoader,
	mapDstPalletBelongsToLpid,
	mapDstTrailer,
	mapDstStagingListItem
} from './type-mappers';
import { fetchDst } from './proxy';

const DST_ROUTES = {
	loaders: '/api/barcode-get/get-loaders',
	trailers: '/api/barcode-get/get-trailers',
	insertLoader: '/api/barcode-update/insert-loader',
	updateLoader: '/api/barcode-get/update-loaders',
	dropsheets: '/api/barcode-get/select-loading-dropsheet',
	willCallDropsheet: '/api/barcode-get/get-dropsheet-willcall-orders',
	dropsheetStatus: '/api/barcode-update/check-onload-statusDS-departments',
	departmentStatusOnDrop: '/api/barcode-get/get-department-status-ondrop',
	dropsheetCategoryAvailability: '/api/barcode-update/get-percent-scanned-label-count',
	willCallSignature: '/api/barcode-get/get-signature-will-call',
	uploadWillCallSignature: '/api/barcode-update/upload-signature-will-call',
	updateDropsheetTrailer: '/api/barcode-update/update-trailer-dropsheet',
	updateDropsheetPickedByLoader: '/api/dropsheet/update-picked-by',
	dropArea: '/api/barcode-get/get-droparea',
	dropAreasByDepartment: '/api/barcode-update/select-drop-area',
	categoryList: '/api/barcode-get/category-list',
	legacyLoadViewAllForOrderStatus: '/api/barcode-get/loadview-all-get-orderstatus',
	legacyOrderStatusInDropsheet: '/api/barcode-get/get-orderstatus-in-dropsheet',
	legacyMoveOrdersLoaded: '/api/barcode-update/get-orders-loaded-move-new-location',
	getLpidForPalletLoad: '/api/barcode-update/get-lpid-pallet-load',
	checkPalletBelongsToLpid: '/api/barcode-get/check-pallet-belongs-lpid',
	updatePalletLoad: '/api/barcode-update/update-pallet-load',
	updateSingleLabelLoad: '/api/barcode-update/update-single-label-load',
	loadViewDetail: '/api/barcode-update/loadview-details-by-sequence',
	loadViewUnion: '/api/barcode-update/load-labels-union-view',
	loadViewDetailAll: '/api/barcode-update/loadview-detail-sequence-all',
	loadViewBarcodeCounters: '/api/barcode-update/loadview-barcode-counters',
	numberOfDrops: '/api/barcode-get/get-number-of-drops',
	stagingPartsForDay: '/api/barcode-get/get-staging-parts-for-day',
	stagingPartsForDayRoll: '/api/barcode-get/get-staging-parts-for-day-roll'
} as const;

export const dropSheetDateSchema = v.pipe(
	v.string(),
	v.nonEmpty('Expected a date in YYYY-MM-DD format'),
	v.regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a date in YYYY-MM-DD format')
);
export const dropSheetIdSchema = v.number();
export const dropSheetTrailerUpdateInputSchema = v.object({
	dropSheetId: v.number(),
	trailerId: v.number()
});
export const dropSheetPickedByLoaderUpdateInputSchema = v.object({
	dropSheetId: v.number(),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name'))
});
export const dropAreaIdSchema = v.number();
export const departmentSchema = v.picklist(OPERATIONAL_DEPARTMENTS);
export const loaderNameSchema = v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name'));
export const loaderUpdateInputSchema = v.object({
	loaderId: v.number(),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name')),
	isActive: v.boolean()
});
export const orderSoNumberSchema = v.nullish(
	v.pipe(v.string(), v.nonEmpty('Expected a non-empty SO number'))
);

export const loadViewDetailInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number(),
	sequence: v.number()
});

export const loadViewUnionInputSchema = v.object({
	loadNumber: v.pipe(v.string(), v.nonEmpty('Expected a non-empty load number')),
	sequence: v.number(),
	locationId: v.number()
});

export const loadViewDetailAllInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number()
});

export const loadViewBarcodeCountersInputSchema = v.object({
	dropSheetId: v.number(),
	loadNumber: v.pipe(v.string(), v.nonEmpty('Expected a non-empty load number')),
	sequence: v.number(),
	locationId: v.number()
});

export const legacyLoadViewAllInputSchema = v.object({
	dropSheetId: v.number()
});

export const legacyOrderStatusInputSchema = v.object({
	dropSheetId: v.number(),
	dropSheetCustId: v.number()
});

export const legacyMoveOrdersInputSchema = v.object({
	dropSheetId: v.number(),
	dropSheetCustId: v.number()
});

export const getLpidForPalletLoadInputSchema = v.object({
	barcode: v.pipe(v.string(), v.nonEmpty('Expected a non-empty barcode')),
	loadNumber: v.pipe(v.string(), v.nonEmpty('Expected a non-empty load number')),
	isPallet: v.boolean()
});

export const checkPalletBelongsToLpidInputSchema = v.object({
	barcode: v.pipe(v.string(), v.nonEmpty('Expected a non-empty barcode')),
	lpid: v.number()
});

export const updatePalletLoadInputSchema = v.object({
	dropAreaId: v.number(),
	palletId: v.number(),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name')),
	lpid: v.number()
});

export const updateSingleLabelLoadInputSchema = v.object({
	locationId: v.number(),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name')),
	lpid: v.number(),
	labelNumber: v.number()
});

export const numberOfDropsInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number()
});

type LoadViewDetailInput = v.InferOutput<typeof loadViewDetailInputSchema>;
type LoadViewUnionInput = v.InferOutput<typeof loadViewUnionInputSchema>;
type LoadViewDetailAllInput = v.InferOutput<typeof loadViewDetailAllInputSchema>;
type LoadViewBarcodeCountersInput = v.InferOutput<typeof loadViewBarcodeCountersInputSchema>;
type LegacyLoadViewAllInput = v.InferOutput<typeof legacyLoadViewAllInputSchema>;
type LegacyOrderStatusInput = v.InferOutput<typeof legacyOrderStatusInputSchema>;
type LegacyMoveOrdersInput = v.InferOutput<typeof legacyMoveOrdersInputSchema>;
type GetLpidForPalletLoadInput = v.InferOutput<typeof getLpidForPalletLoadInputSchema>;
type CheckPalletBelongsToLpidInput = v.InferOutput<typeof checkPalletBelongsToLpidInputSchema>;
type UpdatePalletLoadInput = v.InferOutput<typeof updatePalletLoadInputSchema>;
type UpdateSingleLabelLoadInput = v.InferOutput<typeof updateSingleLabelLoadInputSchema>;
type NumberOfDropsInput = v.InferOutput<typeof numberOfDropsInputSchema>;
type DropSheetTrailerUpdateInput = v.InferOutput<typeof dropSheetTrailerUpdateInputSchema>;
type DropSheetPickedByLoaderUpdateInput = v.InferOutput<typeof dropSheetPickedByLoaderUpdateInputSchema>;
export type LoaderUpdateInput = v.InferOutput<typeof loaderUpdateInputSchema>;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

function withQuery(
	path: string,
	params: Record<string, string | number | boolean | null | undefined>
): string {
	const url = new URL(path, 'https://dst.internal');

	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}

	return `${url.pathname}${url.search}`;
}

function jsonInit(payload: unknown): RequestInit {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	};
}

async function readDstJson(path: string, init?: RequestInit): Promise<unknown> {
	const response = await fetchDst(path, init);

	if (!response.ok) {
		const details = (await response.text()).trim();
		const suffix = details ? ` ${details}` : '';

		throw new Error(
			`DST request failed for ${path}: ${response.status} ${response.statusText}${suffix}`
		);
	}

	return response.json();
}

function expectListResponse<T>(body: unknown, path: string): T[] {
	if (!Array.isArray(body)) {
		throw new Error(`DST route ${path} returned an invalid list response.`);
	}

	return body as T[];
}

function expectRecordResponse<T extends Record<string, unknown>>(
	body: unknown,
	path: string,
	isUsable: (record: Record<string, unknown>) => boolean
): T {
	if (!isRecord(body) || !isUsable(body)) {
		throw new Error(`DST route ${path} returned no usable record.`);
	}

	return body as T;
}

function maybeRecordResponse<T extends Record<string, unknown>>(
	body: unknown,
	isUsable: (record: Record<string, unknown>) => boolean
): T | null {
	if (!isRecord(body) || !isUsable(body)) {
		return null;
	}

	return body as T;
}

function hasUsableDropArea(record: Record<string, unknown>) {
	return isFiniteNumber(record.DropAreaID) && record.DropAreaID > 0 && isNonEmptyString(record.DropArea);
}

function hasUsableDropSheetStatus(record: Record<string, unknown>) {
	return isFiniteNumber(record.DropSheetID);
}

function hasUsableWillCallDropSheet(record: Record<string, unknown>) {
	return isFiniteNumber(record.DropSheetID);
}

function hasUsableDepartmentStatusOnDrop(record: Record<string, unknown>) {
	return isFiniteNumber(record.CustDropSheetID);
}

function hasUsableDropSheetCategoryAvailability(record: Record<string, unknown>) {
	return isFiniteNumber(record.DropSheetID);
}

function hasUsableLoadViewDetail(record: Record<string, unknown>) {
	return (
		isFiniteNumber(record.DropSheetID) &&
		isFiniteNumber(record.DropSheetCustID) &&
		isFiniteNumber(record.DSSequence)
	);
}

function hasUsableNumberOfDrops(record: Record<string, unknown>) {
	return isFiniteNumber(record.NumberOfDrops);
}

function hasUsablePalletLpidLookup(record: Record<string, unknown>) {
	return isFiniteNumber(record.LPID) && record.LPID > 0;
}

function hasUsablePalletBelongsToLpid(record: Record<string, unknown>) {
	return (
		isFiniteNumber(record.LPID) &&
		record.LPID > 0 &&
		isFiniteNumber(record.PalletID) &&
		record.PalletID > 0
	);
}

export async function getDstLoaders(): Promise<Loader[]> {
	const body = await readDstJson(DST_ROUTES.loaders);

	return expectListResponse<RawDstLoader>(body, DST_ROUTES.loaders).map(mapDstLoader);
}

export async function getDstTrailers(): Promise<Trailer[]> {
	const body = await readDstJson(DST_ROUTES.trailers);

	return expectListResponse<RawDstTrailer>(body, DST_ROUTES.trailers).map(mapDstTrailer);
}

export async function insertDstLoader(loaderName: string): Promise<void> {
	await readDstJson(
		DST_ROUTES.insertLoader,
		jsonInit({
			Loader: loaderName
		})
	);
}

export async function updateDstLoader(input: LoaderUpdateInput): Promise<void> {
	const path = withQuery(DST_ROUTES.updateLoader, {
		Loader: input.loaderName,
		IsActive: input.isActive,
		LoaderID: input.loaderId
	});

	await readDstJson(
		path,
		{
			method: 'PUT'
		}
	);
}

export async function getDstDropsheets(dropSheetDate: string): Promise<DropSheet[]> {
	const path = withQuery(DST_ROUTES.dropsheets, { dropSheetDate });
	const body = await readDstJson(path);

	return expectListResponse<RawDstDropSheet>(body, path).map(mapDstDropSheet);
}

export async function getDstWillCallDropsheet(
	loadNumber: string
): Promise<WillCallDropsheetLookup> {
	const path = withQuery(DST_ROUTES.willCallDropsheet, {
		LoadNumber: loadNumber
	});
	const body = await readDstJson(path);

	return mapDstWillCallDropsheet(
		expectRecordResponse<RawDstWillCallDropSheet>(body, path, hasUsableWillCallDropSheet)
	);
}

export async function getDstWillCallSignature(
	dropSheetId: number
): Promise<WillCallSignatureRecord> {
	const path = withQuery(DST_ROUTES.willCallSignature, {
		DropSheetID: dropSheetId
	});
	const body = await readDstJson(path);

	if (!isRecord(body)) {
		throw new Error(`DST route ${path} returned an invalid record response.`);
	}

	return mapDstWillCallSignature(body as RawDstWillCallSignature, dropSheetId);
}

export async function uploadDstWillCallSignature(
	input: WillCallSignatureUploadInput
): Promise<void> {
	await readDstJson(
		DST_ROUTES.uploadWillCallSignature,
		jsonInit({
			DropSheetID: input.dropSheetId,
			Signature_Path: input.signaturePath,
			ReceivedBy: input.receivedBy
		})
	);
}

export async function updateDstDropSheetTrailer(
	input: DropSheetTrailerUpdateInput
): Promise<void> {
	await readDstJson(
		DST_ROUTES.updateDropsheetTrailer,
		jsonInit({
			TrailerID: input.trailerId,
			dropsheetid: input.dropSheetId
		})
	);
}

export async function updateDstDropSheetPickedByLoader(
	input: DropSheetPickedByLoaderUpdateInput
): Promise<void> {
	await readDstJson(
		DST_ROUTES.updateDropsheetPickedByLoader,
		jsonInit({
			dropsheet_id: input.dropSheetId,
			picked_by: input.loaderName
		})
	);
}

export async function getDstDropsheetStatus(dropSheetId: number): Promise<DepartmentStatus> {
	const body = await readDstJson(
		DST_ROUTES.dropsheetStatus,
		jsonInit({
			DropSheetID: dropSheetId
		})
	);

	return mapDstDepartmentStatusFromDropSheet(
		expectRecordResponse<RawDstDepartmentStatusOnDropSheet>(
			body,
			DST_ROUTES.dropsheetStatus,
			hasUsableDropSheetStatus
		)
	);
}

export async function getDstDepartmentStatusOnDrop(
	custDropSheetId: number
): Promise<DepartmentStatus> {
	const path = withQuery(DST_ROUTES.departmentStatusOnDrop, {
		CustDropSheetID: custDropSheetId
	});
	const body = await readDstJson(path);

	return mapDstDepartmentStatusFromDrop(
		expectRecordResponse<RawDstDepartmentStatusOnDrop>(
			body,
			path,
			hasUsableDepartmentStatusOnDrop
		)
	);
}

export async function getDstDropSheetCategoryAvailability(
	dropSheetId: number
): Promise<DropSheetCategoryAvailability> {
	const body = await readDstJson(
		DST_ROUTES.dropsheetCategoryAvailability,
		jsonInit({
			DropSheetID: dropSheetId
		})
	);

	return mapDstDropSheetCategoryAvailability(
		expectRecordResponse<RawDstDropSheetCategoryAvailability>(
			body,
			DST_ROUTES.dropsheetCategoryAvailability,
			hasUsableDropSheetCategoryAvailability
		)
	);
}

export async function getDstDropArea(dropAreaId: number): Promise<DropArea | null> {
	const path = withQuery(DST_ROUTES.dropArea, {
		dropareaid: dropAreaId
	});
	const body = await readDstJson(path);
	const record = maybeRecordResponse<RawDstDropArea>(body, hasUsableDropArea);

	return record ? mapDstDropArea(record) : null;
}

export async function getDstDropAreasByDepartment(
	department: OperationalDepartment
): Promise<DropArea[]> {
	const body = await readDstJson(
		DST_ROUTES.dropAreasByDepartment,
		jsonInit({
			Department: department
		})
	);

	return expectListResponse<RawDstDropArea>(body, DST_ROUTES.dropAreasByDepartment).map(
		mapDstDropArea
	);
}

export async function getDstCategoryList(): Promise<OperationalDepartment[]> {
	const body = await readDstJson(DST_ROUTES.categoryList);

	return mapDstCategoryList(expectListResponse<RawDstCategoryListEntry>(body, DST_ROUTES.categoryList));
}

export async function getDstLoadViewDetail(
	input: LoadViewDetailInput
): Promise<LoadViewDetail> {
	const body = await readDstJson(
		DST_ROUTES.loadViewDetail,
		jsonInit({
			DropSheetID: input.dropSheetId,
			LocationID: input.locationId,
			DSSequence: input.sequence
		})
	);

	return mapDstLoadViewDetail(
		expectRecordResponse<RawDstLoadViewDetail>(
			body,
			DST_ROUTES.loadViewDetail,
			hasUsableLoadViewDetail
		)
	);
}

export async function getDstLoadViewUnion(
	input: LoadViewUnionInput
): Promise<LoadViewUnion[]> {
	const body = await readDstJson(
		DST_ROUTES.loadViewUnion,
		jsonInit({
			LoadNumber: input.loadNumber,
			DSSequence: input.sequence,
			LocationID: input.locationId
		})
	);

	return expectListResponse<RawDstLoadViewUnion>(body, DST_ROUTES.loadViewUnion).map(
		mapDstLoadViewUnion
	);
}

export async function getDstLoadViewDetailAll(
	input: LoadViewDetailAllInput
): Promise<LoadViewDetail[]> {
	const body = await readDstJson(
		DST_ROUTES.loadViewDetailAll,
		jsonInit({
			DropSheetID: input.dropSheetId,
			LocationID: input.locationId
		})
	);

	return expectListResponse<RawDstLoadViewDetail>(body, DST_ROUTES.loadViewDetailAll).map(
		mapDstLoadViewDetail
	);
}

export async function getDstLoadViewBarcodeCounters(
	input: LoadViewBarcodeCountersInput
): Promise<LoadViewBarcodeCounters> {
	const body = await readDstJson(
		DST_ROUTES.loadViewBarcodeCounters,
		jsonInit({
			DropSheetID: input.dropSheetId,
			LoadNumber: input.loadNumber,
			DSSequence: input.sequence,
			LocationID: input.locationId
		})
	);

	return mapDstLoadViewBarcodeCounters(
		expectRecordResponse<RawDstLoadViewBarcodeCounters>(
			body,
			DST_ROUTES.loadViewBarcodeCounters,
			isUsableDstLoadViewBarcodeCounters
		)
	);
}

export async function getDstLegacyLoadViewAll(
	input: LegacyLoadViewAllInput
): Promise<LegacyLoadViewAllEntry[]> {
	const path = withQuery(DST_ROUTES.legacyLoadViewAllForOrderStatus, {
		DropSheetID: input.dropSheetId
	});
	const body = await readDstJson(path);

	return expectListResponse<RawDstLegacyLoadViewAllEntry>(body, path).map(
		mapDstLegacyLoadViewAllEntry
	);
}

export async function getDstLegacyOrderStatusRows(
	input: LegacyOrderStatusInput
): Promise<LegacyOrderStatusRow[]> {
	const path = withQuery(DST_ROUTES.legacyOrderStatusInDropsheet, {
		DropSheetID: input.dropSheetId,
		DropSheetCustID: input.dropSheetCustId
	});
	const body = await readDstJson(path);

	return expectListResponse<RawDstLegacyOrderStatusRow>(body, path).map(
		mapDstLegacyOrderStatusRow
	);
}

export async function getDstLegacyMoveOrdersRows(
	input: LegacyMoveOrdersInput
): Promise<LegacyMoveOrderRow[]> {
	const body = await readDstJson(
		DST_ROUTES.legacyMoveOrdersLoaded,
		jsonInit({
			DropSheetID: input.dropSheetId,
			CustomerDropSheetID: input.dropSheetCustId
		})
	);

	return expectListResponse<RawDstLegacyMoveOrderRow>(body, DST_ROUTES.legacyMoveOrdersLoaded).map(
		mapDstLegacyMoveOrderRow
	);
}

export async function getDstLpidForPalletLoad(
	input: GetLpidForPalletLoadInput
): Promise<number> {
	const body = await readDstJson(
		DST_ROUTES.getLpidForPalletLoad,
		jsonInit({
			Barcode: input.barcode,
			LoadNumber: input.loadNumber,
			Pallet: input.isPallet
		})
	);
	const rows = expectListResponse<RawDstPalletLpidLookupRow>(body, DST_ROUTES.getLpidForPalletLoad);
	const firstRow = rows.find((row) => hasUsablePalletLpidLookup(row as Record<string, unknown>));

	if (!firstRow) {
		throw new Error(`DST route ${DST_ROUTES.getLpidForPalletLoad} returned no usable LPID record.`);
	}

	return mapDstLpidForPalletLoad(firstRow);
}

export async function checkDstPalletBelongsToLpid(
	input: CheckPalletBelongsToLpidInput
): Promise<PalletBelongsToLpidResult> {
	const path = withQuery(DST_ROUTES.checkPalletBelongsToLpid, {
		Barcode: input.barcode,
		LPID: input.lpid
	});
	const body = await readDstJson(path);

	return mapDstPalletBelongsToLpid(
		expectRecordResponse<RawDstPalletBelongsToLpid>(
			body,
			path,
			hasUsablePalletBelongsToLpid
		)
	);
}

export async function updateDstPalletLoad(input: UpdatePalletLoadInput): Promise<void> {
	await readDstJson(
		DST_ROUTES.updatePalletLoad,
		jsonInit({
			DropArea: input.dropAreaId,
			PalletID: input.palletId,
			Loader: input.loaderName,
			LPIDNumber: input.lpid
		})
	);
}

export async function updateDstSingleLabelLoad(
	input: UpdateSingleLabelLoadInput
): Promise<void> {
	await readDstJson(
		DST_ROUTES.updateSingleLabelLoad,
		jsonInit({
			Location: input.locationId,
			Loader: input.loaderName,
			LPID: input.lpid,
			LabelNumber: input.labelNumber
		})
	);
}

export async function getDstNumberOfDrops(input: NumberOfDropsInput): Promise<number> {
	const path = withQuery(DST_ROUTES.numberOfDrops, {
		DropSheetID: input.dropSheetId,
		LocationID: input.locationId
	});
	const body = await readDstJson(path);
	const record = expectRecordResponse<Record<string, unknown>>(body, path, hasUsableNumberOfDrops);

	return record.NumberOfDrops as number;
}

export async function getDstStagingPartsForDay(): Promise<StagingListItem[]> {
	const body = await readDstJson(DST_ROUTES.stagingPartsForDay);

	return expectListResponse<RawDstStagingListItem>(body, DST_ROUTES.stagingPartsForDay).map(
		mapDstStagingListItem
	);
}

export async function getDstStagingPartsForDayRoll(
	orderSoNumber?: string | null
): Promise<StagingListItem[]> {
	const path = withQuery(DST_ROUTES.stagingPartsForDayRoll, {
		order_so_number: orderSoNumber
	});
	const body = await readDstJson(path);

	return expectListResponse<RawDstStagingListItem>(body, path).map(mapDstStagingListItem);
}
