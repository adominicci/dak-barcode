import * as v from 'valibot';
import type { FrontendTarget, Trailer } from '$lib/types';
import type { RawDakEquipment } from '$lib/types/raw-dak';
import { fetchDak } from './proxy';

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

async function readDakEquipmentJson(path: string): Promise<unknown> {
	const response = await fetchDak(path, undefined, { dbTarget: 'EQUIPMENT' });

	if (!response.ok) {
		const details = (await response.text()).trim();
		const suffix = details ? ` ${details}` : '';

		throw new Error(
			`DAK request failed for ${path}: ${response.status} ${response.statusText}${suffix}`
		);
	}

	return response.json();
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

function expectEquipmentRecord(record: unknown, path: string): RawDakEquipment {
	if (!isRecord(record) || !isNonEmptyString(record.id) || !isNonEmptyString(record.equipment_name)) {
		throw new Error(`DAK route ${path} returned no usable equipment record.`);
	}

	return record as RawDakEquipment;
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

	return expectListResponse<RawDakEquipment>(body, DAK_EQUIPMENT_LOOKUP_ROUTE).map((entry) =>
		mapDakEquipmentTrailer(expectEquipmentRecord(entry, DAK_EQUIPMENT_LOOKUP_ROUTE))
	);
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
