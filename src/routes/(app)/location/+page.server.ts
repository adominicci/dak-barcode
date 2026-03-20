import { error, fail, redirect } from '@sveltejs/kit';
import {
	getTargetCookieOptions,
	isTarget,
	TARGET_COOKIE_NAME
} from '$lib/server/auth-context';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	currentTarget: locals.authContext.target
});

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		if (!locals.authContext.isAdmin) {
			error(403, 'Only admins can select a target.');
		}

		const formData = await request.formData();
		const selectedTarget = formData.get('target');

		if (typeof selectedTarget !== 'string' || !isTarget(selectedTarget)) {
			return fail(400, {
				message: 'Select a valid target.'
			});
		}

		cookies.set(TARGET_COOKIE_NAME, selectedTarget, getTargetCookieOptions());
		redirect(303, '/home');
	}
};
