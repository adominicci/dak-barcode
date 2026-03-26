import type { LoaderInfo } from '$lib/types';
import type {
	WorkflowDepartment,
	WorkflowLoaderSelection
} from '$lib/workflow/stores';

export type LoadingEntryContext = {
	dropSheetId: number;
	locationId: number;
	loaderSessionId: number;
	startedAt: string | null;
	loadNumber: string | null;
	dropWeight: number | null;
};

function parsePositiveInteger(value: string | null): number | null {
	if (!value || !/^\d+$/.test(value)) {
		return null;
	}

	const parsed = Number.parseInt(value, 10);

	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveNumber(value: string | null): number | null {
	if (!value) {
		return null;
	}

	const parsed = Number.parseFloat(value);

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
		loaderSessionId,
		startedAt: url.searchParams.get('startedAt')?.trim() || null,
		loadNumber: url.searchParams.get('loadNumber')?.trim() || null,
		dropWeight: parsePositiveNumber(url.searchParams.get('dropWeight'))
	};
}

export function hasLoadingWorkflowContext(input: {
	selectedDepartment: WorkflowDepartment;
	currentLoader: WorkflowLoaderSelection;
}): boolean {
	return input.selectedDepartment !== null && input.currentLoader !== null;
}

export function buildEndLoaderSessionInput(input: {
	loaderInfo: LoaderInfo | null;
	loadingEntry: LoadingEntryContext;
	selectedDepartment: WorkflowDepartment;
	currentLoader: WorkflowLoaderSelection;
	endedAt: string;
}): (LoaderInfo & { id: number; endedAt: string }) | null {
	if (input.loaderInfo?.id != null) {
		return {
			...input.loaderInfo,
			id: input.loaderInfo.id,
			endedAt: input.endedAt
		};
	}

	if (
		input.selectedDepartment === null ||
		input.currentLoader === null ||
		input.loadingEntry.startedAt === null
	) {
		return null;
	}

	return {
		id: input.loadingEntry.loaderSessionId,
		dropSheetId: input.loadingEntry.dropSheetId,
		loaderId: input.currentLoader.loaderId,
		department: input.selectedDepartment,
		loaderName: input.currentLoader.loaderName,
		startedAt: input.loadingEntry.startedAt,
		endedAt: input.endedAt
	};
}

export function toNavigationHref(url: URL): string {
	return `${url.pathname}${url.search}${url.hash}`;
}
