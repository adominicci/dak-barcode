import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';
import {
	toDakTarget,
	toDstTarget,
	type FrontendTarget,
	type ProfileWithWarehouse
} from '$lib/types';

export type ProxyAuthContext = {
	accessToken: string;
	profile: ProfileWithWarehouse;
	target: FrontendTarget;
	user: User;
};

type ProxyRequestEvent = Pick<RequestEvent, 'fetch' | 'locals'>;

function requireConfiguredBaseUrl(name: 'DST_PORTAL_URL' | 'DAK_WEB_URL') {
	const value = env[name];

	if (!value) {
		error(500, `${name} is not configured.`);
	}

	return value;
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

export async function fetchDst(path: string, init?: RequestInit) {
	const relativePath = requireRelativeProxyPath(path);
	const baseUrl = requireConfiguredBaseUrl('DST_PORTAL_URL');
	const event = getRequestEvent();
	const { accessToken, target } = await resolveAuthContext(event);
	const url = new URL(relativePath, baseUrl);
	const headers = new Headers(init?.headers);

	url.searchParams.set('db', toDstTarget(target));
	headers.set('Authorization', `Bearer ${accessToken}`);

	return event.fetch(url, {
		...init,
		headers
	});
}

export async function fetchDak(path: string, init?: RequestInit) {
	const relativePath = requireRelativeProxyPath(path);
	const baseUrl = requireConfiguredBaseUrl('DAK_WEB_URL');
	const event = getRequestEvent();
	const { accessToken, target } = await resolveAuthContext(event);
	const url = new URL(relativePath, baseUrl);
	const headers = new Headers(init?.headers);

	headers.set('Authorization', `Bearer ${accessToken}`);
	headers.set('X-Db', toDakTarget(target));

	return event.fetch(url, {
		...init,
		headers
	});
}
