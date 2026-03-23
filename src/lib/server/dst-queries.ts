import * as v from 'valibot';
import {
	OPERATIONAL_DEPARTMENTS,
	type DepartmentStatus,
	type DropArea,
	type DropSheet,
	type LoadViewDetail,
	type LoadViewUnion,
	type Loader,
	type OperationalDepartment,
	type StagingListItem
} from '$lib/types';
import type {
	RawDstCategoryListEntry,
	RawDstDepartmentStatusOnDropSheet,
	RawDstDropArea,
	RawDstDropSheet,
	RawDstLoadViewDetail,
	RawDstLoadViewUnion,
	RawDstLoader,
	RawDstStagingListItem
} from '$lib/types/raw-dst';
import {
	mapDstCategoryList,
	mapDstDepartmentStatusFromDropSheet,
	mapDstDropArea,
	mapDstDropSheet,
	mapDstLoadViewDetail,
	mapDstLoadViewUnion,
	mapDstLoader,
	mapDstStagingListItem
} from './type-mappers';
import { fetchDst } from './proxy';

const DST_ROUTES = {
	loaders: '/api/barcode-get/get-loaders',
	dropsheets: '/api/barcode-get/select-loading-dropsheet',
	dropsheetStatus: '/api/barcode-update/check-onload-statusDS-departments',
	dropArea: '/api/barcode-get/get-droparea',
	dropAreasByDepartment: '/api/barcode-update/select-drop-area',
	categoryList: '/api/barcode-get/category-list',
	loadViewDetail: '/api/barcode-update/loadview-details-by-sequence',
	loadViewUnion: '/api/barcode-update/load-labels-union-view',
	loadViewDetailAll: '/api/barcode-update/loadview-detail-sequence-all',
	numberOfDrops: '/api/barcode-get/get-number-of-drops',
	stagingPartsForDay: '/api/barcode-get/get-staging-parts-for-day',
	stagingPartsForDayRoll: '/api/barcode-get/get-staging-parts-for-day-roll'
} as const;

export const dropSheetDateSchema = v.string();
export const dropSheetIdSchema = v.number();
export const dropAreaIdSchema = v.number();
export const departmentSchema = v.picklist(OPERATIONAL_DEPARTMENTS);
export const orderSoNumberSchema = v.nullish(v.string());

export const loadViewDetailInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number(),
	sequence: v.number()
});

export const loadViewUnionInputSchema = v.object({
	loadNumber: v.string(),
	sequence: v.number(),
	locationId: v.number()
});

export const loadViewDetailAllInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number()
});

export const numberOfDropsInputSchema = v.object({
	dropSheetId: v.number(),
	locationId: v.number()
});

type LoadViewDetailInput = v.InferOutput<typeof loadViewDetailInputSchema>;
type LoadViewUnionInput = v.InferOutput<typeof loadViewUnionInputSchema>;
type LoadViewDetailAllInput = v.InferOutput<typeof loadViewDetailAllInputSchema>;
type NumberOfDropsInput = v.InferOutput<typeof numberOfDropsInputSchema>;

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
	params: Record<string, string | number | null | undefined>
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

export async function getDstLoaders(): Promise<Loader[]> {
	const body = await readDstJson(DST_ROUTES.loaders);

	return expectListResponse<RawDstLoader>(body, DST_ROUTES.loaders).map(mapDstLoader);
}

export async function getDstDropsheets(dropSheetDate: string): Promise<DropSheet[]> {
	const path = withQuery(DST_ROUTES.dropsheets, { dropSheetDate });
	const body = await readDstJson(path);

	return expectListResponse<RawDstDropSheet>(body, path).map(mapDstDropSheet);
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
