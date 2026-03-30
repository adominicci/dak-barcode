import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session, User } from '@supabase/supabase-js';
import type { AuthContext, ProfileWithWarehouse, Target } from '$lib/auth/types';

const getRequestEvent = vi.fn();
const privateEnv = {
	DST_PORTAL_URL: 'https://dst.example.com',
	DAK_WEB_URL: 'https://dak.example.com'
};

vi.mock('$app/server', () => ({
	getRequestEvent
}));

vi.mock('$env/dynamic/private', () => ({
	env: privateEnv
}));

function createUser(overrides: Partial<User> = {}): User {
	return {
		id: 'user-1',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		created_at: '2026-03-23T00:00:00.000Z',
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

function createAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
	const user = overrides.user ?? createUser();
	const profile = overrides.profile === undefined ? createProfile() : overrides.profile;

	return {
		accessState: 'operator-ready',
		isActive: true,
		isAdmin: false,
		profile,
		role: profile?.userRole ?? null,
		target: 'Canton',
		user,
		...overrides
	};
}

function createSession(accessToken: string): Session {
	const user = createUser();

	return {
		access_token: accessToken,
		token_type: 'bearer',
		expires_in: 3600,
		expires_at: 1_772_000_000,
		refresh_token: 'refresh-token',
		user
	};
}

function createRequestEventMock({
	authContext = createAuthContext(),
	verifiedUser = authContext.user,
	accessToken = 'jwt-token',
	sessionError = null
}: {
	authContext?: AuthContext;
	verifiedUser?: User | null;
	accessToken?: string | null;
	sessionError?: unknown;
} = {}) {
	const requestFetch = vi.fn(async () => new Response(JSON.stringify({ ok: true })));
	const getVerifiedUser = vi.fn(async () => verifiedUser ?? null);
	const getSession = vi.fn(async () => ({
		data: {
			session: accessToken ? createSession(accessToken) : null
		},
		error: sessionError
	}));

	const event = {
		locals: {
			authContext,
			getVerifiedUser,
			supabase: {
				auth: {
					getSession
				}
			}
		},
		fetch: requestFetch
	} as unknown as RequestEvent;

	return {
		event,
		requestFetch,
		getSession,
		getVerifiedUser
	};
}

function getFetchCall(requestFetch: ReturnType<typeof vi.fn>) {
	return requestFetch.mock.calls[0]! as [RequestInfo | URL, RequestInit | undefined];
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	privateEnv.DST_PORTAL_URL = 'https://dst.example.com';
	privateEnv.DAK_WEB_URL = 'https://dak.example.com';
});

describe('getAuthContext', () => {
	it('returns the verified user, profile, target, and access token from the current request', async () => {
		const user = createUser();
		const profile = createProfile();
		const { event, getSession, getVerifiedUser } = createRequestEventMock({
			authContext: createAuthContext({
				profile,
				target: 'Freeport',
				user
			}),
			verifiedUser: user,
			accessToken: 'jwt-freeport'
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).resolves.toMatchObject({
			accessToken: 'jwt-freeport',
			profile,
			target: 'Freeport' satisfies Target,
			user
		});
		expect(getVerifiedUser).toHaveBeenCalledOnce();
		expect(getSession).toHaveBeenCalledOnce();
	});

	it('fails when the current request has no verified user', async () => {
		const { event } = createRequestEventMock({
			verifiedUser: null
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Authenticated user is required to proxy backend requests.'
			}
		});
	});

	it('fails when the current request has no resolved target', async () => {
		const { event } = createRequestEventMock({
			authContext: createAuthContext({
				accessState: 'admin-needs-target',
				isAdmin: true,
				target: null
			})
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 403,
			body: {
				message: 'Resolved target is required to proxy backend requests.'
			}
		});
	});

	it('fails when the current request has an inactive profile', async () => {
		const { event } = createRequestEventMock({
			authContext: createAuthContext({
				isActive: false,
				profile: createProfile({ isActive: false })
			})
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Active profile is required to proxy backend requests.'
			}
		});
	});

	it('fails when the current request has no active profile row', async () => {
		const { event } = createRequestEventMock({
			authContext: createAuthContext({
				profile: null,
				role: null
			})
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Active profile is required to proxy backend requests.'
			}
		});
	});

	it('fails when the current request has no access token', async () => {
		const { event } = createRequestEventMock({
			accessToken: null
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Access token is required to proxy backend requests.'
			}
		});
	});

	it('fails when the current request session lookup returns an error', async () => {
		const { event } = createRequestEventMock({
			accessToken: 'jwt-token',
			sessionError: new Error('network error')
		});

		getRequestEvent.mockReturnValue(event);

		const { getAuthContext } = await import('./proxy');

		await expect(getAuthContext()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Access token is required to proxy backend requests.'
			}
		});
	});
});

describe('fetchDst', () => {
	it.each(['Canton', 'Freeport', 'Sandbox'] as const)(
		'adds the correct title-case db target for %s GET requests',
		async (target) => {
			const { event, requestFetch } = createRequestEventMock({
				authContext: createAuthContext({ target })
			});

			getRequestEvent.mockReturnValue(event);

			const { fetchDst } = await import('./proxy');

			await fetchDst('/api/barcode-get/select-loading-dropsheet?dropsSheetDate=2026-03-23&db=Wrong');

			expect(requestFetch).toHaveBeenCalledOnce();
			expect(getRequestEvent).toHaveBeenCalledOnce();
			const [input, init] = getFetchCall(requestFetch);
			const url = new URL(String(input));
			const headers = new Headers(init?.headers);

			expect(`${url.origin}${url.pathname}`).toBe(
				'https://dst.example.com/api/barcode-get/select-loading-dropsheet'
			);
			expect(url.searchParams.get('dropsSheetDate')).toBe('2026-03-23');
			expect(url.searchParams.get('db')).toBe(target);
			expect(headers.get('Authorization')).toBe('Bearer jwt-token');
		}
	);

	it('preserves method, body, and caller headers for dst POST requests', async () => {
		const { event, requestFetch } = createRequestEventMock();

		getRequestEvent.mockReturnValue(event);

		const { fetchDst } = await import('./proxy');
		const body = JSON.stringify({ loader: 'Loader One' });

		await fetchDst('/api/barcode-update/insert-loader?existing=1', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Custom': 'dst'
			},
			body
		});

		expect(requestFetch).toHaveBeenCalledOnce();
		const [input, init] = getFetchCall(requestFetch);
		const url = new URL(String(input));
		const headers = new Headers(init?.headers);

		expect(url.searchParams.get('existing')).toBe('1');
		expect(url.searchParams.get('db')).toBe('Canton');
		expect(init?.method).toBe('POST');
		expect(init?.body).toBe(body);
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(headers.get('X-Custom')).toBe('dst');
		expect(headers.get('Authorization')).toBe('Bearer jwt-token');
	});

	it('rejects absolute dst proxy URLs before sending credentials', async () => {
		const { event, requestFetch, getSession, getVerifiedUser } = createRequestEventMock();

		getRequestEvent.mockReturnValue(event);

		const { fetchDst } = await import('./proxy');

		await expect(
			fetchDst('https://legacy.example.com/api/barcode-get/select-loading-dropsheet')
		).rejects.toMatchObject({
			status: 400,
			body: {
				message: 'Proxy path must be relative.'
			}
		});
		expect(requestFetch).not.toHaveBeenCalled();
		expect(getRequestEvent).not.toHaveBeenCalled();
		expect(getVerifiedUser).not.toHaveBeenCalled();
		expect(getSession).not.toHaveBeenCalled();
	});

	it('fails when DST_PORTAL_URL is missing before auth lookups', async () => {
		const { event, requestFetch, getSession, getVerifiedUser } = createRequestEventMock();

		privateEnv.DST_PORTAL_URL = '';
		getRequestEvent.mockReturnValue(event);

		const { fetchDst } = await import('./proxy');

		await expect(fetchDst('/api/barcode-get/select-loading-dropsheet')).rejects.toMatchObject({
			status: 500,
			body: {
				message: 'DST_PORTAL_URL is not configured.'
			}
		});
		expect(requestFetch).not.toHaveBeenCalled();
		expect(getRequestEvent).not.toHaveBeenCalled();
		expect(getVerifiedUser).not.toHaveBeenCalled();
		expect(getSession).not.toHaveBeenCalled();
	});

	it('aborts slow DST requests with a user-safe timeout error', async () => {
		vi.useFakeTimers();
		const abortableFetch = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener('abort', () => {
						reject(new DOMException('The operation was aborted.', 'AbortError'));
					});
				})
		);
		const { event } = createRequestEventMock();
		event.fetch = abortableFetch as typeof event.fetch;

		getRequestEvent.mockReturnValue(event);

		const { fetchDst } = await import('./proxy');
		const request = fetchDst('/api/barcode-get/select-loading-dropsheet');
		const expectation = expect(request).rejects.toMatchObject({
			status: 504,
			body: {
				message: 'DST backend request timed out.'
			}
		});

		await vi.advanceTimersByTimeAsync(8_000);

		await expectation;
		expect(abortableFetch).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it('preserves the caller abort signal for DST requests', async () => {
		const abortableFetch = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					if (init?.signal?.aborted) {
						reject(new DOMException('The operation was aborted.', 'AbortError'));
						return;
					}

					init?.signal?.addEventListener('abort', () => {
						reject(new DOMException('The operation was aborted.', 'AbortError'));
					});
				})
		);
		const { event } = createRequestEventMock();
		event.fetch = abortableFetch as typeof event.fetch;
		getRequestEvent.mockReturnValue(event);

		const { fetchDst } = await import('./proxy');
		const callerController = new AbortController();
		const request = fetchDst('/api/barcode-get/select-loading-dropsheet', {
			signal: callerController.signal
		});
		const expectation = expect(request).rejects.toThrowError(
			expect.objectContaining({
				name: 'AbortError'
			})
		);

		callerController.abort();

		await expectation;
		expect(abortableFetch).toHaveBeenCalledOnce();
	});
});

describe('fetchDak', () => {
	it.each([
		['Canton', 'CANTON'],
		['Freeport', 'FREEPORT'],
		['Sandbox', 'SANDBOX']
	] as const)('adds the correct X-Db header for %s GET requests', async (target, expectedHeader) => {
		const { event, requestFetch } = createRequestEventMock({
			authContext: createAuthContext({ target })
		});

		getRequestEvent.mockReturnValue(event);

		const { fetchDak } = await import('./proxy');

		await fetchDak('/v1/logistics/dropsheet-loader-select?fk_dropsheet_id=10');

		expect(requestFetch).toHaveBeenCalledOnce();
		expect(getRequestEvent).toHaveBeenCalledOnce();
		const [input, init] = getFetchCall(requestFetch);
		const url = new URL(String(input));
		const headers = new Headers(init?.headers);

		expect(`${url.origin}${url.pathname}`).toBe(
			'https://dak.example.com/v1/logistics/dropsheet-loader-select'
		);
		expect(url.searchParams.get('fk_dropsheet_id')).toBe('10');
		expect(url.searchParams.get('db')).toBeNull();
		expect(headers.get('Authorization')).toBe('Bearer jwt-token');
		expect(headers.get('X-Db')).toBe(expectedHeader);
	});

	it('preserves method, body, and caller headers for dak POST requests', async () => {
		const { event, requestFetch } = createRequestEventMock();

		getRequestEvent.mockReturnValue(event);

		const { fetchDak } = await import('./proxy');
		const body = JSON.stringify({ scan: 'ABC-123' });

		await fetchDak('/v1/scan/process-staging', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Custom': 'dak',
				'X-Db': 'WRONG'
			},
			body
		});

		expect(requestFetch).toHaveBeenCalledOnce();
		const [input, init] = getFetchCall(requestFetch);
		const url = new URL(String(input));
		const headers = new Headers(init?.headers);

		expect(`${url.origin}${url.pathname}`).toBe('https://dak.example.com/v1/scan/process-staging');
		expect(init?.method).toBe('POST');
		expect(init?.body).toBe(body);
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(headers.get('X-Custom')).toBe('dak');
		expect(headers.get('Authorization')).toBe('Bearer jwt-token');
		expect(headers.get('X-Db')).toBe('CANTON');
	});

	it('rejects absolute dak proxy URLs before sending credentials', async () => {
		const { event, requestFetch, getSession, getVerifiedUser } = createRequestEventMock();

		getRequestEvent.mockReturnValue(event);

		const { fetchDak } = await import('./proxy');

		await expect(fetchDak('https://legacy.example.com/v1/scan/process-staging')).rejects.toMatchObject(
			{
				status: 400,
				body: {
					message: 'Proxy path must be relative.'
				}
			}
		);
		expect(requestFetch).not.toHaveBeenCalled();
		expect(getRequestEvent).not.toHaveBeenCalled();
		expect(getVerifiedUser).not.toHaveBeenCalled();
		expect(getSession).not.toHaveBeenCalled();
	});

	it('fails when DAK_WEB_URL is missing before auth lookups', async () => {
		const { event, requestFetch, getSession, getVerifiedUser } = createRequestEventMock();

		privateEnv.DAK_WEB_URL = '';
		getRequestEvent.mockReturnValue(event);

		const { fetchDak } = await import('./proxy');

		await expect(fetchDak('/v1/scan/process-staging')).rejects.toMatchObject({
			status: 500,
			body: {
				message: 'DAK_WEB_URL is not configured.'
			}
		});
		expect(requestFetch).not.toHaveBeenCalled();
		expect(getRequestEvent).not.toHaveBeenCalled();
		expect(getVerifiedUser).not.toHaveBeenCalled();
		expect(getSession).not.toHaveBeenCalled();
	});

	it('aborts slow DAK requests with a user-safe timeout error', async () => {
		vi.useFakeTimers();
		const abortableFetch = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener('abort', () => {
						reject(new DOMException('The operation was aborted.', 'AbortError'));
					});
				})
		);
		const { event } = createRequestEventMock();
		event.fetch = abortableFetch as typeof event.fetch;

		getRequestEvent.mockReturnValue(event);

		const { fetchDak } = await import('./proxy');
		const request = fetchDak('/v1/scan/process-staging');
		const expectation = expect(request).rejects.toMatchObject({
			status: 504,
			body: {
				message: 'DAK backend request timed out.'
			}
		});

		await vi.advanceTimersByTimeAsync(8_000);

		await expectation;
		expect(abortableFetch).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});
