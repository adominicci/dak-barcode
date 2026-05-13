import * as v from 'valibot';
import type { FrontendTarget, Trailer } from '$lib/types';
import type { RawDakEquipment } from '$lib/types/raw-dak';
import { fetchDak, type FetchDakOptions } from './proxy';

export const DAK_EQUIPMENT_LOOKUP_ROUTE = '/v1/lookup-tables/equipments' as const;
export const DAK_DROPSHEET_TRAILER_UPDATE_ROUTE =
	'/v1/logistics/dropsheet-trailer-update' as const;

export const dakDropSheetTrailerUpdateInputSchema = v.object({
	dropSheetId: v.number(),
	trailerId: v.pipe(v.string(), v.trim(), v.nonEmpty('Expected a non-empty trailer ID')),
	trailerName: v.pipe(v.string(), v.trim(), v.nonEmpty('Expected a non-empty trailer name')),
	trailerUrl: v.nullish(v.string())
});

type DakDropSheetTrailerUpdateInput = v.InferOutput<
	typeof dakDropSheetTrailerUpdateInputSchema
>;

function withQuery(path: string, params: Record<string, string | number | null | undefined>) {
	const url = new URL(path, 'https://dak.internal');

	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}

	return `${url.pathname}${url.search}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

async function readDakInternal(
	path: string,
	init?: RequestInit,
	options?: FetchDakOptions
): Promise<unknown> {
	const response = await fetchDak(path, init, options);

	if (!response.ok) {
		const details = (await response.text()).trim();
		const suffix = details ? ` ${details}` : '';

		throw new Error(
			`DAK request failed for ${path}: ${response.status} ${response.statusText}${suffix}`
		);
	}

	return response.json();
}

async function readDakEquipmentJson(path: string): Promise<unknown> {
	return readDakInternal(path, undefined, { dbTarget: 'EQUIPMENT' });
}

function jsonInit(body: unknown): RequestInit {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};
}

async function readDakJson(path: string, init?: RequestInit): Promise<unknown> {
	return readDakInternal(path, init);
}

function expectListResponse<T>(body: unknown, path: string): T[] {
	if (!Array.isArray(body)) {
		throw new Error(`DAK route ${path} returned an invalid list response.`);
	}

	return body as T[];
}

function isUsableEquipmentRecord(record: unknown): record is RawDakEquipment {
	return isRecord(record) && isNonEmptyString(record.id) && isNonEmptyString(record.equipment_name);
}

function mapDakEquipmentTrailer(raw: RawDakEquipment): Trailer {
	return {
		id: raw.id,
		name: raw.equipment_name,
		photoUrl: raw.photo_url ?? null
	};
}

export async function getDakEquipmentTrailers(location: FrontendTarget): Promise<Trailer[]> {
	const path = withQuery(DAK_EQUIPMENT_LOOKUP_ROUTE, {
		equipment_category: 'Trailers',
		location
	});
	const body = await readDakEquipmentJson(path);
	const records = expectListResponse<unknown>(body, DAK_EQUIPMENT_LOOKUP_ROUTE);
	const trailers = records.filter(isUsableEquipmentRecord).map(mapDakEquipmentTrailer);
	const skippedCount = records.length - trailers.length;

	if (skippedCount > 0) {
		console.warn(
			`Skipped ${skippedCount} unusable trailer equipment record(s) from ${DAK_EQUIPMENT_LOOKUP_ROUTE}.`,
			{ location, totalRecords: records.length, usableRecords: trailers.length }
		);
	}

	return trailers;
}

export async function updateDakDropSheetTrailer(
	input: DakDropSheetTrailerUpdateInput
): Promise<void> {
	await readDakJson(
		DAK_DROPSHEET_TRAILER_UPDATE_ROUTE,
		jsonInit({
			DropSheetID: input.dropSheetId,
			trailer_id: input.trailerId,
			trailer_name: input.trailerName,
			trailer_url: input.trailerUrl ?? null
		})
	);
}
