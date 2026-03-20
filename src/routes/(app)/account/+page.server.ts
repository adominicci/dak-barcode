import type { Actions, PageServerLoad } from './$types';
import { handleChangePassword, handleLogout } from '$lib/server/auth-actions';

export const load: PageServerLoad = async ({ locals }) => ({
	userEmail: locals.authContext.user?.email ?? locals.authContext.profile?.email ?? null
});

export const actions: Actions = {
	changePassword: handleChangePassword,
	logout: handleLogout
};
