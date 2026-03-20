import { readonly, writable, type Readable } from 'svelte/store';
import type { Target } from '$lib/auth/types';

export type WorkflowDepartment = 'Roll' | 'Wrap' | 'Parts' | null;

export type WorkflowLoaderSelection = {
	loaderId: number;
	loaderName: string;
} | null;

export type WorkflowDropAreaSelection = {
	dropAreaId: number;
	dropAreaLabel: string;
} | null;

export type WorkflowStores = {
	activeTarget: Readable<Target | null>;
	currentLoader: Readable<WorkflowLoaderSelection>;
	selectedDepartment: Readable<WorkflowDepartment>;
	currentDropArea: Readable<WorkflowDropAreaSelection>;
	scannedText: Readable<string>;
	syncActiveTarget: (target: Target | null) => void;
	setCurrentLoader: (loader: NonNullable<WorkflowLoaderSelection>) => void;
	clearCurrentLoader: () => void;
	setSelectedDepartment: (department: NonNullable<WorkflowDepartment>) => void;
	clearSelectedDepartment: () => void;
	setCurrentDropArea: (dropArea: NonNullable<WorkflowDropAreaSelection>) => void;
	clearCurrentDropArea: () => void;
	setScannedText: (text: string) => void;
	clearScannedText: () => void;
	resetOperationalState: () => void;
	prepareForStagingEntry: () => void;
	prepareForLoadingEntry: () => void;
};

export function createWorkflowStores(): WorkflowStores {
	const activeTarget = writable<Target | null>(null);
	const currentLoader = writable<WorkflowLoaderSelection>(null);
	const selectedDepartment = writable<WorkflowDepartment>(null);
	const currentDropArea = writable<WorkflowDropAreaSelection>(null);
	const scannedText = writable('');

	const clearCurrentLoader = () => currentLoader.set(null);
	const clearSelectedDepartment = () => selectedDepartment.set(null);
	const clearCurrentDropArea = () => currentDropArea.set(null);
	const clearScannedText = () => scannedText.set('');

	const resetOperationalState = () => {
		clearCurrentLoader();
		clearSelectedDepartment();
		clearCurrentDropArea();
		clearScannedText();
	};

	return {
		activeTarget: readonly(activeTarget),
		currentLoader: readonly(currentLoader),
		selectedDepartment: readonly(selectedDepartment),
		currentDropArea: readonly(currentDropArea),
		scannedText: readonly(scannedText),
		syncActiveTarget: (target) => activeTarget.set(target),
		setCurrentLoader: (loader) => currentLoader.set(loader),
		clearCurrentLoader,
		setSelectedDepartment: (department) => selectedDepartment.set(department),
		clearSelectedDepartment,
		setCurrentDropArea: (dropArea) => currentDropArea.set(dropArea),
		clearCurrentDropArea,
		setScannedText: (text) => scannedText.set(text),
		clearScannedText,
		resetOperationalState,
		prepareForStagingEntry: () => resetOperationalState(),
		prepareForLoadingEntry: () => resetOperationalState()
	};
}

export const workflowStores = createWorkflowStores();
