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

export const load: PageServerLoad = async ({ params }) => {
	const dropSheetId = parseDropSheetId(params.dropsheetId);
	const loaders = (await getDstLoaders()).filter((loader) => loader.isActive);

	return {
		dropSheetId,
		loaders
	};
};
