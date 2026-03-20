import type { Actions } from './$types';
import { handleLogout } from '$lib/server/auth-actions';

export const actions: Actions = {
	default: handleLogout
};
