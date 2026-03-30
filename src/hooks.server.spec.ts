import { describe, expect, it, vi } from 'vitest';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAuthHandle } from '$lib/server/auth-handle';
import type { AuthContext } from '$lib/auth/types';

function createRequestEvent(pathname: string): RequestEvent {
	return {
		url: new URL(`https://example.com${pathname}`),
		request: new Request(`https://example.com${pathname}`),
		route: { id: pathname },
		params: {},
		locals: {},
		cookies: {
			getAll: () => [],
			get: () => undefined,
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		fetch: vi.fn(),
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

describe('createAuthHandle', () => {
	it('places the Supabase client and auth context on locals before resolve', async () => {
		const authContext: AuthContext = {
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
			user: null
		};
		const supabase = { auth: { getUser: vi.fn() } } as unknown as SupabaseClient;
		const resolve = vi.fn(async (event: RequestEvent) => {
			expect(event.locals.supabase).toBe(supabase);
			expect(event.locals.authContext).toEqual(authContext);
			expect(typeof event.locals.getVerifiedUser).toBe('function');
			return new Response('ok');
		});

		const handle = createAuthHandle({
			createSupabaseServerClient: vi.fn(() => supabase) as any,
			resolveRequestAuthContext: vi.fn(async () => authContext) as any
		});

		const response = await handle({
			event: createRequestEvent('/home'),
			resolve
		});

		expect(await response.text()).toBe('ok');
		expect(resolve).toHaveBeenCalledOnce();
	});

	it('fails fast when Supabase envs are missing on an auth route', async () => {
		const resolve = vi.fn(async () => new Response('login'));

		const handle = createAuthHandle({
			createSupabaseServerClient: vi.fn(() => {
				throw new Error('PUBLIC_SUPABASE_URL is not configured.');
			}) as any
		});

		await expect(
			handle({
				event: createRequestEvent('/login'),
				resolve
			})
		).rejects.toThrow('PUBLIC_SUPABASE_URL is not configured.');
		expect(resolve).not.toHaveBeenCalled();
	});
});
