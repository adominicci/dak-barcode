import { dev } from '$app/environment';
import type { User } from '@supabase/supabase-js';
import {
	OPERATOR_TARGETS,
	TARGETS,
	type AccessState,
	type AuthContext,
	type OperatorTarget,
	type ProfileWithWarehouse,
	type Target,
	type UserRole
} from '$lib/auth/types';

export const TARGET_COOKIE_NAME = 'dak_active_target';

type ProfileRow = {
	id: string;
	email: string | null;
	display_name: string | null;
	user_role: UserRole;
	is_active: boolean;
	warehouse_id: number | null;
};

type WarehouseRow = {
	id: number;
	alias: string | null;
};

export type AuthContextSupabaseClient = {
	auth: {
		getUser: () => Promise<{
			data: { user: User | null };
			error: unknown;
		}>;
	};
	from: {
		(table: 'profiles'): {
			select: (selection: string) => {
				eq: (column: 'id', value: string) => {
					maybeSingle: () => PromiseLike<{ data: ProfileRow | null; error: unknown }>;
				};
			};
		};
		(table: 'warehouses'): {
			select: (selection: string) => {
				eq: (column: 'id', value: number) => {
					maybeSingle: () => PromiseLike<{ data: WarehouseRow | null; error: unknown }>;
				};
			};
		};
	};
};

type ResolveAuthContextArgs = {
	supabase: AuthContextSupabaseClient;
	selectedTarget: string | null;
	getVerifiedUser?: () => Promise<User | null>;
};

const AUTH_ROUTES = new Set(['/login', '/forgot-password', '/reset-password']);

export function createAnonymousAuthContext(): AuthContext {
	return {
		accessState: 'anonymous',
		isActive: false,
		isAdmin: false,
		profile: null,
		role: null,
		target: null,
		user: null
	};
}

export function isTarget(value: string | null | undefined): value is Target {
	return TARGETS.includes(value as Target);
}

export function resolveOperatorTarget(alias: string | null | undefined): OperatorTarget {
	if (OPERATOR_TARGETS.includes(alias as OperatorTarget)) {
		return alias as OperatorTarget;
	}

	return 'Canton';
}

export function getTargetCookieOptions() {
	return {
		httpOnly: true,
		path: '/',
		sameSite: 'lax' as const,
		secure: !dev
	};
}

export function getAccessRedirect({
	pathname,
	accessState
}: {
	pathname: string;
	accessState: AccessState;
}): string | null {
	const isAuthRoute = AUTH_ROUTES.has(pathname);
	const isLocationRoute = pathname === '/location';
	const isInactiveRoute = pathname === '/inactive';
	const isLogoutRoute = pathname === '/logout';

	switch (accessState) {
		case 'anonymous':
			return isAuthRoute || isLogoutRoute ? null : '/login';
		case 'inactive':
			return isInactiveRoute || isLogoutRoute ? null : '/inactive';
		case 'operator-ready':
			if (isAuthRoute || isLocationRoute || isInactiveRoute) {
				return '/home';
			}

			return null;
		case 'admin-needs-target':
			return isLocationRoute || isLogoutRoute ? null : '/location';
		case 'admin-ready':
			if (isAuthRoute || isInactiveRoute) {
				return '/home';
			}

			return null;
	}
}

export async function resolveAuthContext({
	supabase,
	selectedTarget,
	getVerifiedUser
}: ResolveAuthContextArgs): Promise<AuthContext> {
	const user =
		typeof getVerifiedUser === 'function'
			? await getVerifiedUser()
			: await supabase.auth.getUser().then(({ data, error }) => (error ? null : data.user));

	if (!user) {
		return createAnonymousAuthContext();
	}

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id,email,display_name,user_role,is_active,warehouse_id')
		.eq('id', user.id)
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (!profile) {
		return {
			accessState: 'inactive',
			isActive: false,
			isAdmin: false,
			profile: null,
			role: null,
			target: null,
			user
		};
	}

	let warehouse: WarehouseRow | null = null;

	if (profile?.warehouse_id !== null) {
		const { data: warehouseRow, error: warehouseError } = await supabase
			.from('warehouses')
			.select('id,alias')
			.eq('id', profile.warehouse_id)
			.maybeSingle();

		if (warehouseError) {
			throw warehouseError;
		}

		warehouse = warehouseRow;
	}

	const mappedProfile: ProfileWithWarehouse = {
		id: profile.id,
		email: profile.email,
		displayName: profile.display_name,
		userRole: profile.user_role,
		isActive: profile.is_active,
		warehouseId: profile.warehouse_id,
		warehouse
	};

	if (!mappedProfile.isActive) {
		return {
			accessState: 'inactive',
			isActive: false,
			isAdmin: false,
			profile: mappedProfile,
			role: mappedProfile.userRole,
			target: null,
			user
		};
	}

	if (mappedProfile.userRole === 'admin') {
		const target = isTarget(selectedTarget) ? selectedTarget : null;

		return {
			accessState: target ? 'admin-ready' : 'admin-needs-target',
			isActive: true,
			isAdmin: true,
			profile: mappedProfile,
			role: mappedProfile.userRole,
			target,
			user
		};
	}

	return {
		accessState: 'operator-ready',
		isActive: true,
		isAdmin: false,
		profile: mappedProfile,
		role: mappedProfile.userRole,
		target: resolveOperatorTarget(mappedProfile.warehouse?.alias),
		user
	};
}
