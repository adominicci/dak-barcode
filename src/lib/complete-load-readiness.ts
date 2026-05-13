import type { DepartmentStatus, DropSheetCategoryAvailability } from '$lib/types';

const CLOSED_DEPARTMENT_STATUSES = new Set(['NA', 'DONE']);

type CompleteLoadReadinessInput = {
	percentCompleted: number | null;
	categoryAvailability: DropSheetCategoryAvailability | null;
	departmentStatus: DepartmentStatus | null;
};

export function isCompleteLoadReadyForDisplay({
	percentCompleted,
	categoryAvailability,
	departmentStatus
}: CompleteLoadReadinessInput): boolean {
	if (!isLoadFullyScanned(percentCompleted, categoryAvailability) || departmentStatus === null) {
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

function isLoadFullyScanned(
	percentCompleted: number | null,
	categoryAvailability: DropSheetCategoryAvailability | null
): boolean {
	if (categoryAvailability === null) {
		return percentCompleted !== null && percentCompleted >= 1;
	}

	const loadingCategories = [
		{
			hasLabels: categoryAvailability.wrapHasLabels,
			scannedPercent: categoryAvailability.wrapScannedPercent
		},
		{
			hasLabels: categoryAvailability.rollHasLabels,
			scannedPercent: categoryAvailability.rollScannedPercent
		},
		{
			hasLabels: categoryAvailability.partsHasLabels,
			scannedPercent: categoryAvailability.partsScannedPercent
		}
	].filter((category) => category.hasLabels > 0);

	return (
		loadingCategories.length > 0 &&
		loadingCategories.every((category) => category.scannedPercent >= 1)
	);
}
