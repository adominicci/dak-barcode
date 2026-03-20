import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { TARGET_COOKIE_NAME } from '$lib/server/auth-context';

const createSupabaseServerClient = vi.fn();

vi.mock('$lib/server/supabase', () => ({
	createSupabaseServerClient
}));

function createRequestEvent(body: URLSearchParams): RequestEvent {
	return {
		request: new Request('https://example.com/reset-password', {
			method: 'POST',
			body
		}),
		url: new URL('https://example.com/reset-password'),
		fetch: vi.fn(),
		cookies: {
			get: vi.fn(),
			getAll: vi.fn(() => []),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {},
		route: { id: '/reset-password' },
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

describe('reset-password actions', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('returns validation errors when the passwords do not match', async () => {
		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				code: '123456',
				password: 'new-password',
				confirmPassword: 'different-password'
			})
		);
		const { actions } = await import('./+page.server');

		const result = await actions.default(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				email: 'loader@dakotasteelandtrim.com',
				code: '123456',
				message: 'Enter a matching new password.'
			}
		});
		expect(createSupabaseServerClient).not.toHaveBeenCalled();
	});

	it('verifies the recovery code, updates the password, and redirects to login', async () => {
		const verifyOtp = vi.fn(async () => ({ data: {}, error: null }));
		const updateUser = vi.fn(async () => ({ data: {}, error: null }));
		const signOut = vi.fn(async () => ({ error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: {
				verifyOtp,
				updateUser,
				signOut
			}
		});

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				code: '123456',
				password: 'new-password',
				confirmPassword: 'new-password'
			})
		);
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/login?reset=success'
		});

		expect(verifyOtp).toHaveBeenCalledWith({
			email: 'loader@dakotasteelandtrim.com',
			token: '123456',
			type: 'recovery'
		});
		expect(updateUser).toHaveBeenCalledWith({
			password: 'new-password'
		});
		expect(signOut).toHaveBeenCalledOnce();
		expect(event.cookies.delete).toHaveBeenCalledWith(
			TARGET_COOKIE_NAME,
			expect.objectContaining({ path: '/' })
		);
	});

	it('returns an error when Supabase rejects the recovery code', async () => {
		createSupabaseServerClient.mockReturnValue({
			auth: {
				verifyOtp: vi.fn(async () => ({
					data: {},
					error: { message: 'Token has expired or is invalid' }
				})),
				updateUser: vi.fn(),
				signOut: vi.fn()
			}
		});

		const event = createRequestEvent(
			new URLSearchParams({
				email: 'loader@dakotasteelandtrim.com',
				code: '123456',
				password: 'new-password',
				confirmPassword: 'new-password'
			})
		);
		const { actions } = await import('./+page.server');

		const result = await actions.default(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				email: 'loader@dakotasteelandtrim.com',
				code: '123456',
				message: 'We could not verify that recovery code.'
			}
		});
	});
});
