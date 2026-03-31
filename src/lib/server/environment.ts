import { error } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
export { getSupabasePublicEnv, requirePublicEnv } from '$lib/environment/public';

type PrivateEnvName = 'DAK_WEB_URL' | 'DST_PORTAL_URL';

export function requirePrivateEnv(name: PrivateEnvName) {
	const value = privateEnv[name];

	if (!value) {
		error(500, `${name} is not configured.`);
	}

	return value;
}
