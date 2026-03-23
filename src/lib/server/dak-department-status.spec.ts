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

describe('dak department status stub helpers', () => {
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
		const expected: DepartmentStatus = {
			scope: 'dropsheet',
			subjectId: 42,
			slit: null,
			trim: null,
			wrap: null,
			roll: null,
			parts: null,
			soffit: null
		};

		await expect(getDakOnLoadStatusAllDepts(42)).resolves.toEqual(expected);
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
