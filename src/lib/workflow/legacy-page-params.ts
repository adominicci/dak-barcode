import { parsePositiveNumber } from '$lib/workflow/loading-lifecycle';

export type LegacyPageParams = {
	dropSheetId: number;
	loadNumber: string;
	driverName: string | null;
	dropWeight: number | null;
	returnTo: string | null;
};

export function parseLegacyDropsheetId(value: string): number | null {
	if (!/^\d+$/.test(value)) {
		return null;
	}

	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}

	return parsed;
}

export function parseLegacyLoadNumber(
	loadNumber: string | null | undefined,
	deliveryNumber: string | null | undefined,
	dropSheetId: number
): string {
	const trimmed = loadNumber?.trim() || deliveryNumber?.trim();
	return trimmed ? trimmed : String(dropSheetId);
}

export function parseLegacyDriverName(driverName: string | null | undefined): string | null {
	const trimmed = driverName?.trim();
	return trimmed ? trimmed : null;
}

export function parseLegacyReturnTo(returnTo: string | null | undefined): string | null {
	const trimmed = returnTo?.trim();

	if (!trimmed) {
		return null;
	}

	if (!trimmed.startsWith('/') || trimmed.startsWith('//') || /\s/.test(trimmed)) {
		return null;
	}

	return trimmed;
}

export function isLegacyInternalPath(href: string | null | undefined): href is string {
	return parseLegacyReturnTo(href) !== null;
}

export function parseLegacyPageParams(
	params: { dropsheetId: string },
	searchParams: URLSearchParams
): LegacyPageParams | null {
	const dropSheetId = parseLegacyDropsheetId(params.dropsheetId);

	if (dropSheetId === null) {
		return null;
	}

	return {
		dropSheetId,
		loadNumber: parseLegacyLoadNumber(
			searchParams.get('loadNumber'),
			searchParams.get('deliveryNumber'),
			dropSheetId
		),
		driverName: parseLegacyDriverName(searchParams.get('driverName')),
		dropWeight: parsePositiveNumber(searchParams.get('dropWeight')),
		returnTo: parseLegacyReturnTo(searchParams.get('returnTo'))
	};
}
