import type { DepartmentStatus } from '$lib/types';

export type LoadingDepartmentStatusEntry = {
	label: 'Slit' | 'Trim' | 'Wrap' | 'Roll' | 'Parts' | 'Soffit';
	value: string | null;
	className: string;
	testId: string;
};

const DEPARTMENT_STATUS_LABELS: LoadingDepartmentStatusEntry['label'][] = [
	'Slit',
	'Trim',
	'Wrap',
	'Roll',
	'Parts',
	'Soffit'
];

function normalizeStatus(value: string | null): string | null {
	return value?.trim().toUpperCase() ?? null;
}

export function getLoadingDepartmentStatusClasses(value: string | null): string {
	switch (normalizeStatus(value)) {
		case 'DONE':
		case 'NA':
			return 'bg-emerald-500 text-white';
		case 'DUE':
			return 'bg-rose-500 text-white';
		case 'BOT':
		case 'BOL':
			return 'bg-amber-400 text-slate-950';
		default:
			return 'bg-surface-container-high text-slate-600';
	}
}

export function getLoadingDepartmentStatusEntries(
	status: DepartmentStatus | null
): LoadingDepartmentStatusEntry[] {
	return DEPARTMENT_STATUS_LABELS.map((label) => {
		const key = label.toLowerCase() as keyof Pick<
			DepartmentStatus,
			'slit' | 'trim' | 'wrap' | 'roll' | 'parts' | 'soffit'
		>;

		return {
			label,
			value: status?.[key] ?? null,
			className: getLoadingDepartmentStatusClasses(status?.[key] ?? null),
			testId: `loading-department-status-${key}`
		};
	});
}
