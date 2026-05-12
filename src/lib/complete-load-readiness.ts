import type { DepartmentStatus, DropSheetCategoryAvailability } from '$lib/types';

const CLOSED_DEPARTMENT_STATUSES = new Set(['NA', 'DONE']);

export function isCompleteLoadReadyForDisplay(
	categoryAvailability: DropSheetCategoryAvailability | null,
	departmentStatus: DepartmentStatus | null
): boolean {
	if (categoryAvailability?.allLoaded !== true || departmentStatus === null) {
		return false;
	}

	const statuses = [
		departmentStatus.slit,
		departmentStatus.trim,
		departmentStatus.wrap,
		departmentStatus.roll,
		departmentStatus.parts,
		departmentStatus.soffit
	];

	return statuses.every((status) => {
		const normalizedStatus = status?.trim().toUpperCase();
		return normalizedStatus ? CLOSED_DEPARTMENT_STATUSES.has(normalizedStatus) : false;
	});
}
