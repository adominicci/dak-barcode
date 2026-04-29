import type { DepartmentStatus, OperationalDepartment } from '$lib/types';

export type LoadingEntryDepartment = {
	department: OperationalDepartment;
	locationId: number;
	description: string;
	statusKey: keyof Pick<DepartmentStatus, 'wrap' | 'roll' | 'parts'>;
};

export const LOADING_ENTRY_DEPARTMENTS: LoadingEntryDepartment[] = [
	{
		department: 'Wrap',
		locationId: 2,
		description: 'Protect wrapped orders and finish the trailer handoff.',
		statusKey: 'wrap'
	},
	{
		department: 'Roll',
		locationId: 1,
		description: 'Stage roll inventory into driver-valid loading locations.',
		statusKey: 'roll'
	},
	{
		department: 'Parts',
		locationId: 3,
		description: 'Load loose parts and accessory packs into the active drop flow.',
		statusKey: 'parts'
	}
];

export function getLoadingEntryDepartment(
	department: OperationalDepartment
): LoadingEntryDepartment {
	const match = LOADING_ENTRY_DEPARTMENTS.find((entry) => entry.department === department);

	if (!match) {
		throw new Error(`Unsupported loading department: ${department}`);
	}

	return match;
}
