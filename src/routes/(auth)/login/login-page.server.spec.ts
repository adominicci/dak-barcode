import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { AuthContext } from '$lib/auth/types';

const TARGET_COOKIE_NAME = 'dak_active_target';

const createSupabaseServerClient = vi.fn();
const resolveAuthContext = vi.fn();

vi.mock('$lib/server/supabase', () => ({
	createSupabaseServerClient
}));

vi.mock('$lib/server/auth-context', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/auth-context')>(
		'$lib/server/auth-context'
	);

	return {
		...actual,
		resolveAuthContext
	};
});

function createAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
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
		} as never,
		...overrides
	};
}

function createRequestEvent(body: URLSearchParams): RequestEvent {
	return {
		request: new Request('https://example.com/login', {
			method: 'POST',
			body
		}),
		url: new URL('https://example.com/login'),
		fetch: vi.fn(),
		cookies: {
			get: vi.fn(() => 'Sandbox'),
			getAll: vi.fn(() => []),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {
			authContext: createAuthContext({ accessState: 'anonymous', target: null }),
			getVerifiedUser: vi.fn(),
			supabase: {} as never
		},
		route: { id: '/login' },
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

describe('login actions', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('returns validation errors when email or password are missing', async () => {
		const event = createRequestEvent(new URLSearchParams({ email: '', password: '' }));
		const { actions } = await import('./+page.server');

		const result = await actions.default(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				email: '',
				message: 'Enter your email and password.'
			}
		});
		expect(createSupabaseServerClient).not.toHaveBeenCalled();
	});

	it('redirects active operators to home after sign in', async () => {
		const signInWithPassword = vi.fn(async () => ({ data: {}, error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: { signInWithPassword }
		});
		resolveAuthContext.mockResolvedValue(createAuthContext());

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				password: 'TempPass123'
			})
		);
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/home'
		});

		expect(signInWithPassword).toHaveBeenCalledWith({
			email: 'loader@dakotasteelandtrim.com',
			password: 'TempPass123'
		});
		expect(resolveAuthContext).toHaveBeenCalledWith({
			supabase: expect.any(Object),
			selectedTarget: null
		});
		expect(event.cookies.delete).toHaveBeenCalledWith(
			TARGET_COOKIE_NAME,
			expect.objectContaining({ path: '/' })
		);
	});

	it('redirects admins to location after sign in and clears the target cookie', async () => {
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn(async () => ({ data: {}, error: null }))
			}
		});
		resolveAuthContext.mockResolvedValue(
			createAuthContext({
				accessState: 'admin-needs-target',
				isAdmin: true,
				role: 'admin',
				target: null,
				profile: {
					id: 'admin-1',
					email: 'admin@dakotasteelandtrim.com',
					displayName: 'Admin',
					userRole: 'admin',
					isActive: true,
					warehouseId: null,
					warehouse: null
				}
			})
		);

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'admin@dakotasteelandtrim.com',
				password: 'TempPass123'
			})
		);
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/location'
		});

		expect(event.cookies.delete).toHaveBeenCalledWith(
			TARGET_COOKIE_NAME,
			expect.objectContaining({ path: '/' })
		);
	});

	it('redirects inactive users to the inactive page after sign in', async () => {
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn(async () => ({ data: {}, error: null }))
			}
		});
		resolveAuthContext.mockResolvedValue(
			createAuthContext({
				accessState: 'inactive',
				isActive: false,
				target: null
			})
		);

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				password: 'TempPass123'
			})
		);
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/inactive'
		});
	});

	it('returns a credentials error when Supabase rejects the sign in', async () => {
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn(async () => ({
					data: {},
					error: { message: 'Invalid login credentials' }
				}))
			}
		});

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				password: 'wrong-password'
			})
		);
		const { actions } = await import('./+page.server');

		const result = await actions.default(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				email: 'loader@dakotasteelandtrim.com',
				message: 'We could not sign you in with those credentials.'
			}
		});
		expect(resolveAuthContext).not.toHaveBeenCalled();
	});
});
