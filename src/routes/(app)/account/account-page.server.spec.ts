import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { AuthContext } from '$lib/auth/types';
import { TARGET_COOKIE_NAME } from '$lib/server/auth-context';

const createSupabaseServerClient = vi.fn();

vi.mock('$lib/server/supabase', () => ({
	createSupabaseServerClient
}));

function createAuthContext(): AuthContext {
	return {
		accessState: 'operator-ready',
		isActive: true,
		isAdmin: false,
		profile: {
			id: 'user-1',
			email: 'loader@dakotasteelandtrim.com',
			displayName: 'Loader One',
			userRole: 'loading',
			isActive: true,
			warehouseId: 1,
			warehouse: { alias: 'Canton' }
		},
		role: 'loading',
		target: 'Canton',
		user: {
			id: 'user-1',
			app_metadata: {},
			user_metadata: {},
			aud: 'authenticated',
			created_at: '2026-03-20T00:00:00.000Z',
			email: 'loader@dakotasteelandtrim.com'
		} as never
	};
}

function createRequestEvent(body: URLSearchParams): RequestEvent {
	return {
		request: new Request('https://example.com/account', {
			method: 'POST',
			body
		}),
		url: new URL('https://example.com/account'),
		fetch: vi.fn(),
		cookies: {
			get: vi.fn(() => 'Canton'),
			getAll: vi.fn(() => []),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {
			authContext: createAuthContext(),
			getVerifiedUser: vi.fn(),
			supabase: {} as never
		},
		route: { id: '/account' },
		params: {},
		getClientAddress: () => '127.0.0.1',
		isDataRequest: false,
		isSubRequest: false,
		platform: undefined,
		setHeaders: vi.fn(),
		depends: vi.fn(),
		parent: vi.fn(),
		untrack: vi.fn(),
		tracing: {
			root: {
				name: 'test',
				end: vi.fn(),
				setAttribute: vi.fn(),
				setAttributes: vi.fn(),
				startChild: vi.fn(() => ({
					end: vi.fn(),
					setAttribute: vi.fn(),
					setAttributes: vi.fn()
				})),
				startChildSpan: vi.fn(() => ({
					end: vi.fn(),
					setAttribute: vi.fn(),
					setAttributes: vi.fn()
				}))
			}
		}
	} as unknown as RequestEvent;
}

describe('account page', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('returns the signed-in email from load', async () => {
		const { load } = await import('./+page.server');

		const data = await load({
			locals: {
				authContext: createAuthContext()
			}
		} as never);

		expect(data).toEqual({
			userEmail: 'loader@dakotasteelandtrim.com'
		});
	});

	it('reauthenticates and changes the password', async () => {
		const signInWithPassword = vi.fn(async () => ({ data: {}, error: null }));
		const updateUser = vi.fn(async () => ({ data: {}, error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signInWithPassword,
				updateUser
			}
		});

		const event = createRequestEvent(
			new URLSearchParams({
				currentPassword: 'TempPass123',
				password: 'NewPass123',
				confirmPassword: 'NewPass123'
			})
		);
		const { actions } = await import('./+page.server');

		const result = await actions.changePassword(event as never);

		expect(signInWithPassword).toHaveBeenCalledWith({
			email: 'loader@dakotasteelandtrim.com',
			password: 'TempPass123'
		});
		expect(updateUser).toHaveBeenCalledWith({
			password: 'NewPass123'
		});
		expect(result).toMatchObject({
			success: true,
			message: 'Your password has been updated.'
		});
	});

	it('returns an error when the current password is incorrect', async () => {
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn(async () => ({
					data: {},
					error: { message: 'Invalid login credentials' }
				})),
				updateUser: vi.fn()
			}
		});

		const event = createRequestEvent(
			new URLSearchParams({
				currentPassword: 'wrong-pass',
				password: 'NewPass123',
				confirmPassword: 'NewPass123'
			})
		);
		const { actions } = await import('./+page.server');

		const result = await actions.changePassword(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				message: 'Your current password is incorrect.'
			}
		});
	});

	it('signs out and clears the active target cookie', async () => {
		const signOut = vi.fn(async () => ({ error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: { signOut }
		});

		const event = createRequestEvent(new URLSearchParams());
		const { actions } = await import('./+page.server');

		await expect(actions.logout(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/login?logout=success'
		});

		expect(signOut).toHaveBeenCalledOnce();
		expect(event.cookies.delete).toHaveBeenCalledWith(
			TARGET_COOKIE_NAME,
			expect.objectContaining({ path: '/' })
		);
	});
});
