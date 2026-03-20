import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
	activeTarget: locals.authContext.target,
	displayName:
		locals.authContext.profile?.displayName ??
		locals.authContext.profile?.email ??
		locals.authContext.user?.email ??
		'DST User',
	isAdmin: locals.authContext.isAdmin,
	userRole: locals.authContext.role
});
