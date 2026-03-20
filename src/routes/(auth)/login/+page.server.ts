import type { Actions, PageServerLoad } from './$types';
import { handleLogin } from '$lib/server/auth-actions';

export const load: PageServerLoad = async ({ url }) => ({
	notice:
		url.searchParams.get('reset') === 'success'
			? 'Password updated. Sign in with your new password.'
			: url.searchParams.get('logout') === 'success'
				? 'You have been signed out.'
				: null
});

export const actions: Actions = {
	default: handleLogin
};
