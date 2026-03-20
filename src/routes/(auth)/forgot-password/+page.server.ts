import type { Actions } from './$types';
import { handleForgotPassword } from '$lib/server/auth-actions';

export const actions: Actions = {
	default: handleForgotPassword
};
