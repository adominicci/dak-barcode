import type { Actions, PageServerLoad } from './$types';
import { handleResetPassword } from '$lib/server/auth-actions';

export const load: PageServerLoad = async ({ url }) => ({
	email: url.searchParams.get('email') ?? '',
	sent: url.searchParams.get('sent') === '1'
});

export const actions: Actions = {
	default: handleResetPassword
};
