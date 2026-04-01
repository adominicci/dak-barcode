import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicEnv } from '$lib/environment/public';

export function createSupabaseBrowserClient() {
	const { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } = getSupabasePublicEnv();

	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
