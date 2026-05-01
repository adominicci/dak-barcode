import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';
import {
	toDakTarget,
	toDstTarget,
	type DakTarget,
	type FrontendTarget,
	type ProfileWithWarehouse
} from '$lib/types';
import { requirePrivateEnv } from '$lib/server/environment';

export type DakDatabaseTarget = DakTarget | 'EQUIPMENT';

export type ProxyAuthContext = {
	accessToken: string;
	profile: ProfileWithWarehouse;
	target: FrontendTarget;
	user: User;
};

export type FetchDakOptions = {
	dbTarget?: DakDatabaseTarget;
};

type ProxyRequestEvent = Pick<RequestEvent, 'fetch' | 'locals'>;
const UPSTREAM_TIMEOUT_MS = 8_000;

function requireConfiguredBaseUrl(name: 'DST_PORTAL_URL' | 'DAK_WEB_URL') {
	return requirePrivateEnv(name);
}

function requireActiveProfile(profile: ProfileWithWarehouse | null, isActive: boolean) {
	if (!profile || !isActive) {
		error(401, 'Active profile is required to proxy backend requests.');
	}

	return profile;
}

function requireRelativeProxyPath(path: string) {
	if (path.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
		error(400, 'Proxy path must be relative.');
	}

	return path;
}

async function resolveAuthContext(event: Pick<ProxyRequestEvent, 'locals'>): Promise<ProxyAuthContext> {
	const user = await event.locals.getVerifiedUser();

	if (!user) {
		error(401, 'Authenticated user is required to proxy backend requests.');
	}

	const profile = requireActiveProfile(
		event.locals.authContext.profile,
		event.locals.authContext.isActive
	);
	const target = event.locals.authContext.target;

	if (!target) {
		error(403, 'Resolved target is required to proxy backend requests.');
	}

	const {
		data: { session },
		error: sessionError
	} = await event.locals.supabase.auth.getSession();

	if (sessionError || !session?.access_token) {
		error(401, 'Access token is required to proxy backend requests.');
	}

	return {
		accessToken: session.access_token,
		profile,
		target,
		user
	};
}

export async function getAuthContext(): Promise<ProxyAuthContext> {
	return resolveAuthContext(getRequestEvent());
}

async function fetchWithTimeout(
	event: Pick<ProxyRequestEvent, 'fetch'>,
	input: URL,
	init: RequestInit | undefined,
	upstreamLabel: 'DAK backend' | 'DST backend'
) {
	const controller = new AbortController();
	const signal = init?.signal
		? AbortSignal.any([controller.signal, init.signal])
		: controller.signal;
	let timedOut = false;
	const timeoutId = setTimeout(() => {
		timedOut = true;
		controller.abort();
	}, UPSTREAM_TIMEOUT_MS);

	try {
		return await event.fetch(input, {
			...init,
			signal
		});
	} catch (cause) {
		if (timedOut) {
			error(504, `${upstreamLabel} request timed out.`);
		}

		throw cause;
	} finally {
		clearTimeout(timeoutId);
	}
}

export async function fetchDst(path: string, init?: RequestInit) {
	const relativePath = requireRelativeProxyPath(path);
	const baseUrl = requireConfiguredBaseUrl('DST_PORTAL_URL');
	const event = getRequestEvent();
	const { accessToken, target } = await resolveAuthContext(event);
	const url = new URL(relativePath, baseUrl);
	const headers = new Headers(init?.headers);

	url.searchParams.set('db', toDstTarget(target));
	headers.set('Authorization', `Bearer ${accessToken}`);

	return fetchWithTimeout(
		event,
		url,
		{
			...init,
			headers
		},
		'DST backend'
	);
}

export async function fetchDak(path: string, init?: RequestInit, options: FetchDakOptions = {}) {
	const relativePath = requireRelativeProxyPath(path);
	const baseUrl = requireConfiguredBaseUrl('DAK_WEB_URL');
	const event = getRequestEvent();
	const { accessToken, target } = await resolveAuthContext(event);
	const url = new URL(relativePath, baseUrl);
	const headers = new Headers(init?.headers);

	headers.set('Authorization', `Bearer ${accessToken}`);
	headers.set('X-Db', options.dbTarget ?? toDakTarget(target));

	return fetchWithTimeout(
		event,
		url,
		{
			...init,
			headers
		},
		'DAK backend'
	);
}
