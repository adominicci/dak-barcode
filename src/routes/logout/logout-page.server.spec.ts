import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { TARGET_COOKIE_NAME } from '$lib/server/auth-context';

const createSupabaseServerClient = vi.fn();

vi.mock('$lib/server/supabase', () => ({
	createSupabaseServerClient
}));

function createRequestEvent(): RequestEvent {
	return {
		request: new Request('https://example.com/logout', {
			method: 'POST'
		}),
		url: new URL('https://example.com/logout'),
		fetch: vi.fn(),
		cookies: {
			get: vi.fn(() => 'Canton'),
			getAll: vi.fn(() => []),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {},
		route: { id: '/logout' },
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

describe('logout actions', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('signs out and clears the active target cookie', async () => {
		const signOut = vi.fn(async () => ({ error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: {
				signOut
			}
		});

		const event = createRequestEvent();
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location: '/login?logout=success'
		});

		expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
		expect(event.cookies.delete).toHaveBeenCalledWith(
			TARGET_COOKIE_NAME,
			expect.objectContaining({ path: '/' })
		);
	});
});
