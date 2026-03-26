import type { LoaderInfo } from '$lib/types';
import type {
	WorkflowDepartment,
	WorkflowLoaderSelection
} from '$lib/workflow/stores';

export type LoadingEntryContext = {
	dropSheetId: number;
	locationId: number;
	loaderSessionId: number;
};

function parsePositiveInteger(value: string | null): number | null {
	if (!value || !/^\d+$/.test(value)) {
		return null;
	}

	const parsed = Number.parseInt(value, 10);

	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseLoadingEntryContext(url: URL): LoadingEntryContext | null {
	const dropSheetId = parsePositiveInteger(url.searchParams.get('dropsheetId'));
	const locationId = parsePositiveInteger(url.searchParams.get('locationId'));
	const loaderSessionId = parsePositiveInteger(url.searchParams.get('loaderSessionId'));

	if (dropSheetId === null || locationId === null || loaderSessionId === null) {
		return null;
	}

	return {
		dropSheetId,
		locationId,
		loaderSessionId
	};
}

export function hasLoadingWorkflowContext(input: {
	selectedDepartment: WorkflowDepartment;
	currentLoader: WorkflowLoaderSelection;
}): boolean {
	return input.selectedDepartment !== null && input.currentLoader !== null;
}

export function buildEndLoaderSessionInput(
	loaderInfo: LoaderInfo,
	endedAt: string
): (LoaderInfo & { id: number; endedAt: string }) | null {
	if (loaderInfo.id === null) {
		return null;
	}

	return {
		...loaderInfo,
		id: loaderInfo.id,
		endedAt
	};
}

export function toNavigationHref(url: URL): string {
	return `${url.pathname}${url.search}${url.hash}`;
}
