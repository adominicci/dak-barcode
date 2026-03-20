import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
	activeTarget: locals.authContext.target,
	displayName:
		locals.authContext.profile?.displayName ??
		locals.authContext.profile?.email ??
		locals.authContext.user?.email ??
		'DST User',
	isAdmin: locals.authContext.isAdmin,
	userEmail: locals.authContext.user?.email ?? locals.authContext.profile?.email ?? null,
	userRole: locals.authContext.role
});
