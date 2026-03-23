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
	const profile = overrides.profile ?? createProfile();

	return {
		accessState: 'operator-ready',
		isActive: true,
		isAdmin: false,
		profile,
		role: profile.userRole,
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
			status: 500,
			body: {
				message: 'Resolved target is required to proxy backend requests.'
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
});
