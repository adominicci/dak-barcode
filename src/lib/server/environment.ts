import { error } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

type PublicEnvName = 'PUBLIC_SUPABASE_ANON_KEY' | 'PUBLIC_SUPABASE_URL';
type PrivateEnvName = 'DAK_WEB_URL' | 'DST_PORTAL_URL';

export function requirePublicEnv(name: PublicEnvName) {
	const value = publicEnv[name];

	if (!value) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

export function requirePrivateEnv(name: PrivateEnvName) {
	const value = privateEnv[name];

	if (!value) {
		error(500, `${name} is not configured.`);
	}

	return value;
}

export function getSupabasePublicEnv() {
	return {
		PUBLIC_SUPABASE_ANON_KEY: requirePublicEnv('PUBLIC_SUPABASE_ANON_KEY'),
		PUBLIC_SUPABASE_URL: requirePublicEnv('PUBLIC_SUPABASE_URL')
	};
}
