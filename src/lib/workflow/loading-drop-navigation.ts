export type LoadingDropDirection = 'previous' | 'next';

export type LoadingDropNavigationState = {
	selectedIndex: number;
	activeDropNumber: number;
	totalDrops: number;
	canGoPrevious: boolean;
	canGoNext: boolean;
};

export function clampLoadingDropIndex(selectedIndex: number, totalDrops: number): number {
	if (totalDrops <= 0) {
		return -1;
	}

	return Math.min(Math.max(selectedIndex, 0), totalDrops - 1);
}

export function createLoadingDropNavigationState(
	totalDrops: number,
	selectedIndex = totalDrops - 1
): LoadingDropNavigationState {
	const nextSelectedIndex = clampLoadingDropIndex(selectedIndex, totalDrops);

	return {
		selectedIndex: nextSelectedIndex,
		activeDropNumber: nextSelectedIndex >= 0 ? nextSelectedIndex + 1 : 0,
		totalDrops,
		canGoPrevious: nextSelectedIndex >= 0 && nextSelectedIndex < totalDrops - 1,
		canGoNext: nextSelectedIndex > 0
	};
}

export function moveLoadingDropSelection(input: {
	selectedIndex: number;
	totalDrops: number;
	direction: LoadingDropDirection;
}): number {
	if (input.totalDrops <= 0 || input.selectedIndex < 0) {
		return -1;
	}

	const delta = input.direction === 'next' ? -1 : 1;

	return clampLoadingDropIndex(input.selectedIndex + delta, input.totalDrops);
}
