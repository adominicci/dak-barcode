import * as v from 'valibot';
import type { DepartmentStatus } from '$lib/types';

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

export async function getDakDepartmentStatus(custDropSheetId: number): Promise<DepartmentStatus> {
	return createPendingDepartmentStatus('drop', custDropSheetId);
}

export async function getDakOnLoadStatusAllDepts(dropSheetId: number): Promise<DepartmentStatus> {
	return createPendingDepartmentStatus('dropsheet', dropSheetId);
}
