import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

const createSupabaseServerClient = vi.fn();

vi.mock('$lib/server/supabase', () => ({
	createSupabaseServerClient
}));

function createRequestEvent(body: URLSearchParams): RequestEvent {
	return {
		request: new Request('https://example.com/forgot-password', {
			method: 'POST',
			body
		}),
		url: new URL('https://example.com/forgot-password'),
		fetch: vi.fn(),
		cookies: {
			get: vi.fn(),
			getAll: vi.fn(() => []),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {},
		route: { id: '/forgot-password' },
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

describe('forgot-password actions', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('validates the email before requesting recovery', async () => {
		const event = createRequestEvent(new URLSearchParams({ email: '' }));
		const { actions } = await import('./+page.server');

		const result = await actions.default(event as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				email: '',
				message: 'Enter the email for your account.'
			}
		});
		expect(createSupabaseServerClient).not.toHaveBeenCalled();
	});

	it('sends the recovery email and redirects to reset-password', async () => {
		const resetPasswordForEmail = vi.fn(async () => ({ data: {}, error: null }));
		createSupabaseServerClient.mockReturnValue({
			auth: { resetPasswordForEmail }
		});

		const event = createRequestEvent(
			new URLSearchParams({ email: 'loader@dakotasteelandtrim.com' })
		);
		const { actions } = await import('./+page.server');

		await expect(actions.default(event as never)).rejects.toMatchObject({
			status: 303,
			location:
				'/reset-password?email=loader%40dakotasteelandtrim.com&sent=1'
		});

		expect(resetPasswordForEmail).toHaveBeenCalledWith(
			'loader@dakotasteelandtrim.com',
			{
				redirectTo: 'https://example.com/reset-password'
			}
		);
	});
});
