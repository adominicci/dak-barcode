import * as v from 'valibot';
import type { LoaderInfo, LoaderSession, LoaderSessionUpsertInput } from '$lib/types';
import type { RawDakLoaderInfo, RawDakLoaderSession } from '$lib/types/raw-dak';
import { mapDakLoaderInfo, mapDakLoaderSession } from './type-mappers';
import { fetchDak } from './proxy';

const DAK_ROUTES = {
	upsertLoaderSession: '/v1/logistics/dropsheet-loader-upsert',
	loaderInfo: '/v1/logistics/dropsheet-loader-select-single',
	loadersForDropsheet: '/v1/logistics/dropsheet-loader-select'
} as const;

export const loaderIdSchema = v.number();
export const dropSheetIdSchema = v.number();
export const loaderSessionUpsertInputSchema = v.object({
	dropSheetId: v.number(),
	loaderId: v.number(),
	department: v.picklist(['Roll', 'Wrap', 'Parts']),
	loaderName: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader name')),
	startedAt: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader start timestamp')),
	id: v.optional(v.nullish(v.number())),
	endedAt: v.optional(v.nullish(v.string()))
});

export const loaderSessionEndInputSchema = v.object({
	...loaderSessionUpsertInputSchema.entries,
	id: v.number(),
	endedAt: v.pipe(v.string(), v.nonEmpty('Expected a non-empty loader end timestamp'))
});

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

function readNumberLike(value: unknown): number | null {
	if (isFiniteNumber(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function withQuery(
	path: string,
	params: Record<string, string | number | null | undefined>
): string {
	const url = new URL(path, 'https://dak.internal');

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

async function readDakJson(path: string, init?: RequestInit): Promise<unknown> {
	const response = await fetchDak(path, init);

	if (!response.ok) {
		const details = (await response.text()).trim();
		const suffix = details ? ` ${details}` : '';

		throw new Error(
			`DAK request failed for ${path}: ${response.status} ${response.statusText}${suffix}`
		);
	}

	return response.json();
}

function expectListResponse<T>(body: unknown, path: string): T[] {
	if (!Array.isArray(body)) {
		throw new Error(`DAK route ${path} returned an invalid list response.`);
	}

	return body as T[];
}

function expectRecordResponse<T extends Record<string, unknown>>(
	body: unknown,
	path: string,
	isUsable: (record: Record<string, unknown>) => boolean
): T {
	if (!isRecord(body) || !isUsable(body)) {
		throw new Error(`DAK route ${path} returned no usable record.`);
	}

	return body as T;
}

function hasUsableLoaderInfo(record: Record<string, unknown>) {
	return (
		isFiniteNumber(record.LoaderID) &&
		isFiniteNumber(record.fkDropSheetID) &&
		isFiniteNumber(record.fkLoaderID) &&
		isNonEmptyString(record.Department) &&
		isNonEmptyString(record.loader_name) &&
		isNonEmptyString(record.started_at)
	);
}

function hasUsableLoaderSession(record: Record<string, unknown>) {
	return (
		(isFiniteNumber(record.LoaderID) || isFiniteNumber(record.loader_id)) &&
		isFiniteNumber(record.fkDropSheetID) &&
		isFiniteNumber(record.fkLoaderID) &&
		isNonEmptyString(record.Department) &&
		isNonEmptyString(record.loader_name) &&
		isNonEmptyString(record.started_at)
	);
}

function isMinimalLoaderSessionResponse(record: Record<string, unknown>) {
	return (
		!isFiniteNumber(record.fkDropSheetID) &&
		!isFiniteNumber(record.fkLoaderID) &&
		!isNonEmptyString(record.Department) &&
		!isNonEmptyString(record.loader_name) &&
		!isNonEmptyString(record.started_at)
	);
}

function toMinimalLoaderSessionResponse(
	body: unknown,
	input: LoaderSessionUpsertInput
): RawDakLoaderSession | null {
	if (!isRecord(body) || !isMinimalLoaderSessionResponse(body)) {
		return null;
	}

	const id = readNumberLike(body.loader_id) ?? readNumberLike(body.LoaderID);

	if (id === null) {
		return null;
	}

	return {
		loader_id: id,
		fkDropSheetID: input.dropSheetId,
		fkLoaderID: input.loaderId,
		Department: input.department,
		loader_name: input.loaderName,
		started_at: input.startedAt,
		ended_at:
			typeof body.ended_at === 'string'
				? body.ended_at
				: typeof input.endedAt === 'string'
					? input.endedAt
					: null
	};
}

function toDakLoaderSessionPayload(input: LoaderSessionUpsertInput) {
	const payload: Record<string, number | string | null> = {
		fkDropSheetID: input.dropSheetId,
		fkLoaderID: input.loaderId,
		Department: input.department,
		loader_name: input.loaderName,
		started_at: input.startedAt
	};

	if (input.id != null) {
		payload.LoaderID = input.id;
	}

	if (input.endedAt != null) {
		payload.ended_at = input.endedAt;
	}

	return payload;
}

export async function getDakLoaderInfo(loaderId: number): Promise<LoaderInfo> {
	const path = withQuery(DAK_ROUTES.loaderInfo, {
		loader_id: loaderId
	});
	const body = await readDakJson(path);

	return mapDakLoaderInfo(
		expectRecordResponse<RawDakLoaderInfo>(body, DAK_ROUTES.loaderInfo, hasUsableLoaderInfo)
	);
}

export async function getDakLoadersForDropsheet(dropSheetId: number): Promise<LoaderSession[]> {
	const path = withQuery(DAK_ROUTES.loadersForDropsheet, {
		fk_dropsheet_id: dropSheetId
	});
	const body = await readDakJson(path);

	return expectListResponse<RawDakLoaderSession>(body, DAK_ROUTES.loadersForDropsheet).map(
		(entry) =>
			mapDakLoaderSession(
				expectRecordResponse<RawDakLoaderSession>(
					entry,
					DAK_ROUTES.loadersForDropsheet,
					hasUsableLoaderSession
				)
			)
	);
}

export async function upsertDakLoaderSession(
	input: LoaderSessionUpsertInput
): Promise<LoaderSession> {
	const body = await readDakJson(
		DAK_ROUTES.upsertLoaderSession,
		jsonInit(toDakLoaderSessionPayload(input))
	);
	const normalizedBody =
		toMinimalLoaderSessionResponse(body, input) ??
		expectRecordResponse<RawDakLoaderSession>(
			body,
			DAK_ROUTES.upsertLoaderSession,
			hasUsableLoaderSession
		);

	return mapDakLoaderSession(normalizedBody);
}

export async function endDakLoaderSession(
	input: LoaderSessionUpsertInput & { id: number; endedAt: string }
): Promise<LoaderSession> {
	return upsertDakLoaderSession(input);
}
