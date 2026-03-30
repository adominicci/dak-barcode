import { describe, expect, it } from 'vitest';
import { getWorkflowStatusClasses, getWorkflowStatusTone } from './status-tones';

describe('workflow status tones', () => {
	it('renders DUE as danger while keeping WAIT as warning', () => {
		expect(getWorkflowStatusTone('DUE')).toBe('danger');
		expect(getWorkflowStatusClasses('DUE')).toBe('bg-rose-500 text-white');
		expect(getWorkflowStatusTone('WAIT')).toBe('warning');
		expect(getWorkflowStatusClasses('WAIT')).toBe('bg-amber-400 text-slate-950');
	});
});
