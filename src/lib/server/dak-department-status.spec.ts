import { beforeEach, vi } from 'vitest';
import * as v from 'valibot';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { DepartmentStatus } from '$lib/types';
import {
	DAK_DEPARTMENT_STATUS_DEPENDENCY,
	DAK_DEPARTMENT_STATUS_ROUTE,
	custDropSheetIdSchema,
	dropSheetIdSchema,
	getDakDepartmentStatus,
	getDakOnLoadStatusAllDepts
} from './dak-department-status';

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

function getFetchCall() {
	return fetchDak.mock.calls.at(-1) as [string, RequestInit | undefined];
}

describe('dak department status stub helpers', () => {
	beforeEach(() => {
		vi.resetModules();
		fetchDak.mockReset();
	});

	it('validates both scalar status query inputs', () => {
		expect(v.safeParse(custDropSheetIdSchema, 55).success).toBe(true);
		expect(v.safeParse(custDropSheetIdSchema, '55').success).toBe(false);
		expect(v.safeParse(custDropSheetIdSchema, 0).success).toBe(false);
		expect(v.safeParse(dropSheetIdSchema, 42).success).toBe(true);
		expect(v.safeParse(dropSheetIdSchema, '42').success).toBe(false);
		expect(v.safeParse(dropSheetIdSchema, -1).success).toBe(false);
	});

	it('returns the canonical drop-scoped placeholder status', async () => {
		const expected: DepartmentStatus = {
			scope: 'drop',
			subjectId: 55,
			slit: null,
			trim: null,
			wrap: null,
			roll: null,
			parts: null,
			soffit: null
		};

		await expect(getDakDepartmentStatus(55)).resolves.toEqual(expected);
	});

	it('returns the canonical dropsheet-scoped placeholder status', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				drop_sheet_id: 42,
				slit: 'NA',
				trim: 'NA',
				wrap: 'NA',
				roll: 'READY',
				parts: 'NA',
				soffit: 'NA',
				is_blocked: {
					wrap: false,
					roll: false,
					parts: false
				}
			})
		);

		const expected: DepartmentStatus = {
			scope: 'dropsheet',
			subjectId: 42,
			slit: 'NA',
			trim: 'NA',
			wrap: 'NA',
			roll: 'READY',
			parts: 'NA',
			soffit: 'NA'
		};

		await expect(getDakOnLoadStatusAllDepts(42)).resolves.toEqual(expected);
		expect(fetchDak).toHaveBeenCalledOnce();
		expect(getFetchCall()[0]).toBe('/v1/scan/department-status?dropsheet_id=42');
	});

	it('keeps the department-status dependency constants aligned with the pending backend ticket', () => {
		expect(DAK_DEPARTMENT_STATUS_ROUTE).toBe('/v1/scan/department-status');
		expect(DAK_DEPARTMENT_STATUS_DEPENDENCY).toBe('DAK-195');
		expectTypeOf(getDakDepartmentStatus).toEqualTypeOf<
			(custDropSheetId: number) => Promise<DepartmentStatus>
		>();
		expectTypeOf(getDakOnLoadStatusAllDepts).toEqualTypeOf<
			(dropSheetId: number) => Promise<DepartmentStatus>
		>();
	});
});
