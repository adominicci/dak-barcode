import { env as publicEnv } from '$env/dynamic/public';

type PublicEnvName = 'PUBLIC_SUPABASE_ANON_KEY' | 'PUBLIC_SUPABASE_URL';

export function requirePublicEnv(name: PublicEnvName) {
	const value = publicEnv[name];

	if (!value) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

export function getSupabasePublicEnv() {
	return {
		PUBLIC_SUPABASE_ANON_KEY: requirePublicEnv('PUBLIC_SUPABASE_ANON_KEY'),
		PUBLIC_SUPABASE_URL: requirePublicEnv('PUBLIC_SUPABASE_URL')
	};
}
