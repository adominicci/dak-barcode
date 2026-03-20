import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import {
	type AuthContextSupabaseClient,
	getAccessRedirect,
	resolveAuthContext,
	TARGET_COOKIE_NAME
} from './auth-context';
import type {
	AccessState,
	ProfileRecord,
	ProfileWithWarehouse,
	Target
} from '$lib/auth/types';

type MockSupabaseProfileResult = ProfileWithWarehouse | null;

function createUser(overrides: Partial<User> = {}): User {
	return {
		id: 'user-1',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		created_at: '2026-03-20T00:00:00.000Z',
		email: 'loader@dakotasteelandtrim.com',
		...overrides
	} as User;
}

function createProfile(overrides: Partial<ProfileWithWarehouse> = {}): ProfileWithWarehouse {
	return {
		id: 'user-1',
		email: 'loader@dakotasteelandtrim.com',
		displayName: 'Loader One',
		userRole: 'loading',
		isActive: true,
		warehouseId: 1,
		warehouse: { alias: 'Canton' },
		...overrides
	};
}

function createMockSupabase({
	user,
	profile
}: {
	user: User | null;
	profile: MockSupabaseProfileResult;
}) {
	const profileRow = profile
		? {
				id: profile.id,
				email: profile.email,
				display_name: profile.displayName,
				user_role: profile.userRole,
				is_active: profile.isActive,
				warehouse_id: profile.warehouseId
			}
		: null;
	const warehouseRow =
		profile?.warehouseId !== null && profile?.warehouse
			? {
					id: profile.warehouseId,
					alias: profile.warehouse.alias
				}
			: null;

	return {
		auth: {
			async getUser() {
				return { data: { user }, error: null };
			}
		},
		from(table: string) {
			if (table === 'profiles') {
				return {
					select(selection: string) {
						expect(selection).toBe('id,email,display_name,user_role,is_active,warehouse_id');

						return {
							eq(column: string, value: string) {
								expect(column).toBe('id');
								expect(value).toBe(user?.id ?? 'missing-user');

								return {
									async maybeSingle() {
										return { data: profileRow, error: null };
									}
								};
							}
						};
					}
				};
			}

			expect(table).toBe('warehouses');

			return {
				select(selection: string) {
					expect(selection).toBe('id,alias');

					return {
						eq(column: string, value: number) {
							expect(column).toBe('id');
							expect(value).toBe(profile?.warehouseId ?? -1);

							return {
								async maybeSingle() {
									return { data: warehouseRow, error: null };
								}
							};
						}
					};
				}
			};
		}
	} as AuthContextSupabaseClient;
}

describe('resolveAuthContext', () => {
	it('returns anonymous when there is no verified user', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({ user: null, profile: null }),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('anonymous');
		expect(authContext.profile).toBeNull();
		expect(authContext.target).toBeNull();
	});

	it('resolves an active non-admin user to Canton', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({ user: createUser(), profile: createProfile() }),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('operator-ready');
		expect(authContext.target).toBe<Target>('Canton');
		expect(authContext.profile?.userRole).toBe('loading');
	});

	it('resolves an active non-admin user to Freeport', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: createProfile({
					warehouseId: 2,
					warehouse: { alias: 'Freeport' }
				})
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('operator-ready');
		expect(authContext.target).toBe<Target>('Freeport');
	});

	it('falls back to Canton when the warehouse is missing', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: createProfile({ warehouseId: null, warehouse: null })
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('operator-ready');
		expect(authContext.target).toBe<Target>('Canton');
	});

	it('falls back to Canton when the warehouse alias is unknown', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: createProfile({
					warehouse: { alias: 'Somewhere Else' }
				})
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('operator-ready');
		expect(authContext.target).toBe<Target>('Canton');
	});

	it('treats an inactive profile as blocked', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: createProfile({ isActive: false })
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('inactive');
		expect(authContext.target).toBeNull();
	});

	it('treats a missing profile as blocked', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: null
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('inactive');
		expect(authContext.profile).toBeNull();
		expect(authContext.target).toBeNull();
	});

	it('requires a target selection for admins without the target cookie', async () => {
		const authContext = await resolveAuthContext({
			supabase: createMockSupabase({
				user: createUser(),
				profile: createProfile({
					userRole: 'admin',
					warehouseId: null,
					warehouse: null
				})
			}),
			selectedTarget: null
		});

		expect(authContext.accessState).toBe<AccessState>('admin-needs-target');
		expect(authContext.target).toBeNull();
	});

	it.each(['Canton', 'Freeport', 'Sandbox'] as const)(
		'accepts %s as the admin selected target',
		async (selectedTarget) => {
			const authContext = await resolveAuthContext({
				supabase: createMockSupabase({
					user: createUser(),
					profile: createProfile({
						userRole: 'admin',
						warehouseId: null,
						warehouse: null
					})
				}),
				selectedTarget
			});

			expect(authContext.accessState).toBe<AccessState>('admin-ready');
			expect(authContext.target).toBe<Target>(selectedTarget);
		}
	);
});

describe('getAccessRedirect', () => {
	it.each([
		{
			pathname: '/home',
			accessState: 'anonymous',
			expected: '/login'
		},
		{
			pathname: '/login',
			accessState: 'anonymous',
			expected: null
		},
		{
			pathname: '/logout',
			accessState: 'anonymous',
			expected: null
		},
		{
			pathname: '/login',
			accessState: 'operator-ready',
			expected: '/home'
		},
		{
			pathname: '/logout',
			accessState: 'operator-ready',
			expected: null
		},
		{
			pathname: '/location',
			accessState: 'operator-ready',
			expected: '/home'
		},
		{
			pathname: '/home',
			accessState: 'inactive',
			expected: '/inactive'
		},
		{
			pathname: '/login',
			accessState: 'inactive',
			expected: '/inactive'
		},
		{
			pathname: '/logout',
			accessState: 'inactive',
			expected: null
		},
		{
			pathname: '/home',
			accessState: 'admin-needs-target',
			expected: '/location'
		},
		{
			pathname: '/location',
			accessState: 'admin-needs-target',
			expected: null
		},
		{
			pathname: '/login',
			accessState: 'admin-needs-target',
			expected: '/location'
		},
		{
			pathname: '/login',
			accessState: 'admin-ready',
			expected: '/home'
		},
		{
			pathname: '/logout',
			accessState: 'admin-ready',
			expected: null
		},
		{
			pathname: '/location',
			accessState: 'admin-ready',
			expected: null
		}
	] satisfies Array<{ pathname: string; accessState: AccessState; expected: string | null }>)(
		'returns $expected for $accessState at $pathname',
		({ pathname, accessState, expected }) => {
			expect(getAccessRedirect({ pathname, accessState })).toBe(expected);
		}
	);
});

describe('target cookie constant', () => {
	it('uses the expected cookie name', () => {
		expect(TARGET_COOKIE_NAME).toBe('dak_active_target');
	});
});
