import { error } from '@sveltejs/kit';
import { getDstLoaders } from '$lib/server/dst-queries';
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

	if (trimmed) {
		return trimmed;
	}

	return String(dropSheetId);
}

export const load: PageServerLoad = async ({ params, url }) => {
	const dropSheetId = parseDropSheetId(params.dropsheetId);
	const loaders = (await getDstLoaders()).filter((loader) => loader.isActive);
	const loadNumber = parseLoadNumber(
		url.searchParams.get('loadNumber'),
		url.searchParams.get('deliveryNumber'),
		dropSheetId
	);

	return {
		dropSheetId,
		loadNumber,
		loaders
	};
};
