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

export type WorkflowLoadingHeaderContext = {
	driverName: string | null;
	dropWeight: number | null;
} | null;

export type WorkflowStores = {
	activeTarget: Readable<Target | null>;
	currentLoader: Readable<WorkflowLoaderSelection>;
	selectedDepartment: Readable<WorkflowDepartment>;
	currentDropArea: Readable<WorkflowDropAreaSelection>;
	currentLoadingHeaderContext: Readable<WorkflowLoadingHeaderContext>;
	scannedText: Readable<string>;
	syncActiveTarget: (target: Target | null) => void;
	setCurrentLoader: (loader: NonNullable<WorkflowLoaderSelection>) => void;
	clearCurrentLoader: () => void;
	setSelectedDepartment: (department: NonNullable<WorkflowDepartment>) => void;
	clearSelectedDepartment: () => void;
	setCurrentDropArea: (dropArea: NonNullable<WorkflowDropAreaSelection>) => void;
	clearCurrentDropArea: () => void;
	setCurrentLoadingHeaderContext: (context: NonNullable<WorkflowLoadingHeaderContext>) => void;
	clearCurrentLoadingHeaderContext: () => void;
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
	const currentLoadingHeaderContext = writable<WorkflowLoadingHeaderContext>(null);
	const scannedText = writable('');

	const clearCurrentLoader = () => currentLoader.set(null);
	const clearSelectedDepartment = () => selectedDepartment.set(null);
	const clearCurrentDropArea = () => currentDropArea.set(null);
	const clearCurrentLoadingHeaderContext = () => currentLoadingHeaderContext.set(null);
	const clearScannedText = () => scannedText.set('');

	const resetOperationalState = () => {
		clearCurrentLoader();
		clearSelectedDepartment();
		clearCurrentDropArea();
		clearCurrentLoadingHeaderContext();
		clearScannedText();
	};

	const resetTransientScanState = () => {
		clearCurrentDropArea();
		clearCurrentLoadingHeaderContext();
		clearScannedText();
	};

	return {
		activeTarget: readonly(activeTarget),
		currentLoader: readonly(currentLoader),
		selectedDepartment: readonly(selectedDepartment),
		currentDropArea: readonly(currentDropArea),
		currentLoadingHeaderContext: readonly(currentLoadingHeaderContext),
		scannedText: readonly(scannedText),
		syncActiveTarget: (target) => activeTarget.set(target),
		setCurrentLoader: (loader) => currentLoader.set(loader),
		clearCurrentLoader,
		setSelectedDepartment: (department) => selectedDepartment.set(department),
		clearSelectedDepartment,
		setCurrentDropArea: (dropArea) => currentDropArea.set(dropArea),
		clearCurrentDropArea,
		setCurrentLoadingHeaderContext: (context) => currentLoadingHeaderContext.set(context),
		clearCurrentLoadingHeaderContext,
		setScannedText: (text) => scannedText.set(text),
		clearScannedText,
		resetOperationalState,
		// Staging starts fresh on entry and does not carry loader or department context forward.
		prepareForStagingEntry: () => resetOperationalState(),
		// Loading entry preserves the loader and department selected before navigation.
		prepareForLoadingEntry: () => resetTransientScanState()
	};
}

// NOTE: this singleton is intentionally browser-driven; never mutate it from server-side code.
export const workflowStores = createWorkflowStores();
