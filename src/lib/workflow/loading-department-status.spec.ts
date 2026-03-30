import { describe, expect, it } from 'vitest';
import { getLoadingDepartmentStatusClasses } from './loading-department-status';

describe('loading department status colors', () => {
	it('uses the legacy loading colors for the department status strip', () => {
		expect(getLoadingDepartmentStatusClasses('DONE')).toBe('bg-emerald-500 text-white');
		expect(getLoadingDepartmentStatusClasses('NA')).toBe('bg-emerald-500 text-white');
		expect(getLoadingDepartmentStatusClasses('DUE')).toBe('bg-rose-500 text-white');
		expect(getLoadingDepartmentStatusClasses('BOT')).toBe('bg-amber-400 text-slate-950');
		expect(getLoadingDepartmentStatusClasses('BOL')).toBe('bg-amber-400 text-slate-950');
	});

	it('falls back to neutral styling for blank or unexpected status values', () => {
		expect(getLoadingDepartmentStatusClasses(null)).toBe(
			'bg-surface-container-high text-slate-600'
		);
		expect(getLoadingDepartmentStatusClasses('')).toBe('bg-surface-container-high text-slate-600');
		expect(getLoadingDepartmentStatusClasses('READY')).toBe(
			'bg-surface-container-high text-slate-600'
		);
	});
});
