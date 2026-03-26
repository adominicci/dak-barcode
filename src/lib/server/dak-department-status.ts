import * as v from 'valibot';
import type { DepartmentStatus } from '$lib/types';
import type { RawDakDepartmentStatus } from '$lib/types/raw-dak';
import { mapDakDepartmentStatus } from './type-mappers';
import { fetchDak } from './proxy';

export const DAK_DEPARTMENT_STATUS_ROUTE = '/v1/scan/department-status' as const;
export const DAK_DEPARTMENT_STATUS_DEPENDENCY = 'DAK-195' as const;

export const custDropSheetIdSchema = v.pipe(
	v.number(),
	v.integer('Expected a whole-number customer drop sheet id'),
	v.minValue(1, 'Expected a positive customer drop sheet id')
);
export const dropSheetIdSchema = v.pipe(
	v.number(),
	v.integer('Expected a whole-number drop sheet id'),
	v.minValue(1, 'Expected a positive drop sheet id')
);

function createPendingDepartmentStatus(
	scope: DepartmentStatus['scope'],
	subjectId: number
): DepartmentStatus {
	return {
		scope,
		subjectId,
		slit: null,
		trim: null,
		wrap: null,
		roll: null,
		parts: null,
		soffit: null
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function withQuery(path: string, params: Record<string, string | number | null | undefined>) {
	const url = new URL(path, 'https://dak.internal');

	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}

	return `${url.pathname}${url.search}`;
}

async function readDakJson(path: string): Promise<unknown> {
	const response = await fetchDak(path);

	if (!response.ok) {
		const details = (await response.text()).trim();
		const suffix = details ? ` ${details}` : '';

		throw new Error(
			`DAK request failed for ${path}: ${response.status} ${response.statusText}${suffix}`
		);
	}

	return response.json();
}

function hasUsableDepartmentStatus(record: Record<string, unknown>) {
	return (
		isFiniteNumber(record.drop_sheet_id) ||
		isFiniteNumber(record.dropSheetId) ||
		isFiniteNumber(record.DropSheetID)
	);
}

export async function getDakDepartmentStatus(custDropSheetId: number): Promise<DepartmentStatus> {
	return createPendingDepartmentStatus('drop', custDropSheetId);
}

export async function getDakOnLoadStatusAllDepts(dropSheetId: number): Promise<DepartmentStatus> {
	const path = withQuery(DAK_DEPARTMENT_STATUS_ROUTE, {
		dropsheet_id: dropSheetId
	});
	const body = await readDakJson(path);

	if (!isRecord(body) || !hasUsableDepartmentStatus(body)) {
		throw new Error(`DAK route ${DAK_DEPARTMENT_STATUS_ROUTE} returned no usable record.`);
	}

	return mapDakDepartmentStatus(body as RawDakDepartmentStatus);
}
