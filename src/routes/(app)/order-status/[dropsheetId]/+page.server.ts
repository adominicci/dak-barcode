import { error } from '@sveltejs/kit';
import { parseLegacyPageParams } from '$lib/workflow/legacy-page-params';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const pageParams = parseLegacyPageParams(params, url.searchParams);

	if (!pageParams) {
		error(404, 'Dropsheet not found.');
	}

	return {
		...pageParams
	};
};
