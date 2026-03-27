import { error } from '@sveltejs/kit';
import { parsePositiveNumber } from '$lib/workflow/loading-lifecycle';
import type { PageServerLoad } from './$types';

function parseDropSheetId(value: string): number {
	if (!/^\d+$/.test(value)) {
		error(404, 'Dropsheet not found.');
	}

	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		error(404, 'Dropsheet not found.');
	}

	return parsed;
}

function parseLoadNumber(
	loadNumber: string | null | undefined,
	deliveryNumber: string | null | undefined,
	dropSheetId: number
): string {
	const trimmed = loadNumber?.trim() || deliveryNumber?.trim();
	return trimmed ? trimmed : String(dropSheetId);
}

function parseDriverName(driverName: string | null | undefined): string | null {
	const trimmed = driverName?.trim();
	return trimmed ? trimmed : null;
}

function parseReturnTo(returnTo: string | null | undefined): string | null {
	const trimmed = returnTo?.trim();
	return trimmed ? trimmed : null;
}

export const load: PageServerLoad = async ({ params, url }) => {
	const dropSheetId = parseDropSheetId(params.dropsheetId);

	return {
		dropSheetId,
		loadNumber: parseLoadNumber(
			url.searchParams.get('loadNumber'),
			url.searchParams.get('deliveryNumber'),
			dropSheetId
		),
		driverName: parseDriverName(url.searchParams.get('driverName')),
		dropWeight: parsePositiveNumber(url.searchParams.get('dropWeight')),
		returnTo: parseReturnTo(url.searchParams.get('returnTo'))
	};
};
