export type WorkflowStatusTone = 'neutral' | 'ready' | 'done' | 'warning' | 'danger';

export function getWorkflowStatusTone(value: string | null): WorkflowStatusTone {
	switch (value) {
		case 'DONE':
		case 'NA':
			return 'done';
		case 'READY':
			return 'ready';
		case 'DUE':
			return 'danger';
		case 'WAIT':
			return 'warning';
		case 'STOP':
			return 'danger';
		default:
			return 'neutral';
	}
}

export function getWorkflowStatusClasses(value: string | null): string {
	switch (getWorkflowStatusTone(value)) {
		case 'done':
			return 'bg-emerald-500 text-white';
		case 'ready':
			return 'bg-sky-600 text-white';
		case 'warning':
			return 'bg-amber-400 text-slate-950';
		case 'danger':
			return 'bg-rose-500 text-white';
		default:
			return 'bg-surface-container-high text-slate-600';
	}
}
