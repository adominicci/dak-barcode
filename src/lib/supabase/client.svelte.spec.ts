import { createBrowserClient } from '@supabase/ssr';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = vi.hoisted(() => ({
	SUPABASE_URL: 'https://hotfixproject.supabase.co',
	SUPABASE_ANON_KEY: 'test-anon-key'
}));

vi.mock('$lib/environment/public', () => ({
	getSupabasePublicEnv: () => ({
		PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
		PUBLIC_SUPABASE_URL: SUPABASE_URL
	})
}));

import { createSupabaseBrowserClient } from './client';

// Captured before fake timers are installed so tests can yield to the real event loop.
const realSetTimeout = globalThis.setTimeout.bind(globalThis);

const AUTH_COOKIE = 'sb-hotfixproject-auth-token';
const CONTROL_AUTH_COOKIE = 'sb-control-auth-token';
const ACCESS_TOKEN_TTL_SECONDS = 3600;
const AUTO_REFRESH_TICK_MS = 30_000;
// The shared loading iPad's clock appears to run about an hour fast, so every freshly issued
// one-hour token already looks expired to auth-js.
const LOADING_IPAD_CLOCK_SKEW_MS = 60 * 60 * 1000;
const SIGNATURE_BUCKET = 'files';
const TEST_USER = {
	id: '00000000-0000-4000-8000-000000000001',
	aud: 'authenticated',
	role: 'authenticated',
	email: 'loading@example.com',
	app_metadata: {},
	user_metadata: {},
	created_at: '2026-01-01T00:00:00Z'
};

type FakeSession = ReturnType<FakeSupabase['issueSession']>;
type FakeSupabase = ReturnType<typeof createFakeSupabase>;

/**
 * Minimal Supabase Auth + Storage server behind the global fetch. Its clock is the real time;
 * the browser clock (Date.now) runs `deviceClockSkewMs` ahead of it.
 */
function createFakeSupabase(deviceClockSkewMs: number) {
	const activeRefreshTokens = new Set<string>();
	const accessTokenExpiry = new Map<string, number>();
	const refreshTokenCalls: number[] = [];
	const storageRequests: Array<{ path: string; accessToken: string | null; status: number }> = [];
	let latestAccessToken: string | null = null;
	let serial = 0;

	const serverNowSeconds = () => Math.floor((Date.now() - deviceClockSkewMs) / 1000);

	function issueSession(issuedAt = serverNowSeconds()) {
		serial += 1;
		const expiresAt = issuedAt + ACCESS_TOKEN_TTL_SECONDS;
		const accessToken = createUnsignedJwt({
			sub: TEST_USER.id,
			aud: 'authenticated',
			role: 'authenticated',
			session_id: 'loading-ipad-session',
			iat: issuedAt,
			exp: expiresAt,
			jti: `access-${serial}`
		});
		const refreshToken = `refresh-${serial}`;

		activeRefreshTokens.add(refreshToken);
		accessTokenExpiry.set(accessToken, expiresAt);
		latestAccessToken = accessToken;

		return {
			access_token: accessToken,
			token_type: 'bearer',
			expires_in: ACCESS_TOKEN_TTL_SECONDS,
			expires_at: expiresAt,
			refresh_token: refreshToken,
			user: TEST_USER
		};
	}

	async function fetch(input: RequestInfo | URL, init?: RequestInit) {
		const request = new Request(input, init);
		const url = new URL(request.url);

		if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') {
			const { refresh_token: refreshToken } = (await request.json()) as { refresh_token: string };

			// Refresh tokens rotate: each one is accepted once.
			if (!activeRefreshTokens.delete(refreshToken)) {
				return jsonResponse({ code: 400, error_code: 'refresh_token_already_used' }, 400);
			}

			refreshTokenCalls.push(Date.now());
			return jsonResponse(issueSession());
		}

		if (url.pathname.startsWith('/storage/v1/object/')) {
			const accessToken = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? null;
			const expiresAt = accessToken ? accessTokenExpiry.get(accessToken) : undefined;
			const status = expiresAt !== undefined && expiresAt > serverNowSeconds() ? 200 : 400;

			storageRequests.push({ path: url.pathname, accessToken, status });

			if (status !== 200) {
				return jsonResponse(
					{ statusCode: '403', error: 'Unauthorized', message: '"exp" claim timestamp check failed' },
					status
				);
			}

			const objectPath = url.pathname.replace('/storage/v1/object/', '');

			if (objectPath.startsWith('sign/')) {
				return jsonResponse({ signedURL: `/object/${objectPath}?token=signed-url-token` });
			}

			return jsonResponse({ Id: 'signature-object-id', Key: objectPath });
		}

		return jsonResponse({ message: `Unexpected request ${request.method} ${url.pathname}` }, 404);
	}

	return {
		fetch,
		issueSession,
		serverNowSeconds,
		refreshTokenCalls,
		storageRequests,
		latestAccessToken: () => latestAccessToken
	};
}

function createUnsignedJwt(payload: Record<string, unknown>) {
	const encode = (value: unknown) => toBase64Url(JSON.stringify(value));
	return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.test-signature`;
}

function toBase64Url(value: string) {
	return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

/** Writes the session cookie the same way the server-side @supabase/ssr client does after login. */
function seedAuthCookie(session: FakeSession, cookieName = AUTH_COOKIE) {
	document.cookie = `${cookieName}=base64-${toBase64Url(JSON.stringify(session))}; path=/`;
}

function clearAuthCookies() {
	for (const cookie of document.cookie.split('; ')) {
		const name = cookie.split('=')[0];

		if (name.startsWith('sb-')) {
			document.cookie = `${name}=; path=/; max-age=0`;
		}
	}
}

function useDeviceClock(skewMs: number) {
	vi.useFakeTimers({
		toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
	});
	vi.setSystemTime(Date.now() + skewMs);

	const server = createFakeSupabase(skewMs);
	vi.stubGlobal('fetch', server.fetch);

	return server;
}

/** Advances the fake clock, then lets auth locks and fake network round-trips finish. */
async function advanceAndSettle(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);

	for (let turn = 0; turn < 10; turn += 1) {
		await new Promise((resolve) => realSetTimeout(resolve, 0));
	}
}

describe('createSupabaseBrowserClient', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		clearAuthCookies();
	});

	it('reproduces the clock-skew loop on a bare @supabase/ssr browser client', async () => {
		const server = useDeviceClock(LOADING_IPAD_CLOCK_SKEW_MS);
		seedAuthCookie(server.issueSession(), CONTROL_AUTH_COOKIE);
		// A separate, non-cached client proves the harness can observe the background ticker.
		const control = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			isSingleton: false,
			cookieOptions: { name: CONTROL_AUTH_COOKIE }
		});

		try {
			await control.auth.initialize();
			await advanceAndSettle(0);
			const refreshesBeforeTicks = server.refreshTokenCalls.length;

			for (let tick = 1; tick <= 3; tick += 1) {
				await advanceAndSettle(AUTO_REFRESH_TICK_MS);
				expect(server.refreshTokenCalls.length - refreshesBeforeTicks).toBe(tick * 2);
			}
		} finally {
			await control.auth.stopAutoRefresh();
		}
	});

	it('does not refresh the session in the background or when the tab returns to the foreground', async () => {
		const server = useDeviceClock(LOADING_IPAD_CLOCK_SKEW_MS);
		seedAuthCookie(server.issueSession());

		const supabase = await createSupabaseBrowserClient();
		await supabase.auth.initialize();
		await advanceAndSettle(0);
		const refreshesAtStartup = server.refreshTokenCalls.length;

		// @supabase/ssr caches one browser client per page and vi.resetModules() does not reset it in
		// browser mode. The skewed clock makes initialization refresh, so zero here means another test
		// built the cached client and its ticker never ran on this test's clock.
		expect(refreshesAtStartup, 'this test must build the cached browser client').toBeGreaterThan(0);

		for (let tick = 1; tick <= 3; tick += 1) {
			await advanceAndSettle(AUTO_REFRESH_TICK_MS);
		}

		document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
		await advanceAndSettle(AUTO_REFRESH_TICK_MS);

		expect(server.refreshTokenCalls.length).toBe(refreshesAtStartup);
	});

	it('refreshes a cookie session that expired after startup before signing a signature preview URL', async () => {
		const server = useDeviceClock(0);
		seedAuthCookie(server.issueSession());

		const supabase = await createSupabaseBrowserClient();
		expect(server.refreshTokenCalls).toHaveLength(0);

		// Without the background ticker, the cookie token can expire while the cached client stays alive.
		seedAuthCookie(server.issueSession(server.serverNowSeconds() - 2 * ACCESS_TOKEN_TTL_SECONDS));
		const { data, error } = await supabase.storage
			.from(SIGNATURE_BUCKET)
			.createSignedUrl('signatures/will-call/42/signature.png', 3600);

		expect(error).toBeNull();
		expect(data?.signedUrl).toContain('token=signed-url-token');
		expect(server.refreshTokenCalls).toHaveLength(1);
		expect(server.storageRequests).toEqual([
			{
				path: `/storage/v1/object/sign/${SIGNATURE_BUCKET}/signatures/will-call/42/signature.png`,
				accessToken: server.latestAccessToken(),
				status: 200
			}
		]);
	});

	it('uploads a signature with a token refreshed on demand when the device clock runs fast', async () => {
		const server = useDeviceClock(LOADING_IPAD_CLOCK_SKEW_MS);
		seedAuthCookie(server.issueSession());

		const supabase = await createSupabaseBrowserClient();
		await supabase.auth.initialize();
		const refreshesBeforeUpload = server.refreshTokenCalls.length;

		const { data, error } = await supabase.storage
			.from(SIGNATURE_BUCKET)
			.upload('signatures/will-call/42/signature.png', new Blob(['signature'], { type: 'image/png' }), {
				contentType: 'image/png',
				upsert: false
			});

		expect(error).toBeNull();
		expect(data?.path).toBe('signatures/will-call/42/signature.png');
		expect(server.refreshTokenCalls.length).toBe(refreshesBeforeUpload + 1);
		expect(server.storageRequests).toEqual([
			{
				path: `/storage/v1/object/${SIGNATURE_BUCKET}/signatures/will-call/42/signature.png`,
				accessToken: server.latestAccessToken(),
				status: 200
			}
		]);
	});
});
