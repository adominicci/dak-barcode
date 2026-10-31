import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicEnv } from '$lib/environment/public';

export async function createSupabaseBrowserClient() {
	const { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } = getSupabasePublicEnv();
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// @supabase/ssr forces autoRefreshToken on in the browser, so initialize() registers a 30s
	// refresh ticker and a visibilitychange listener. On a device whose clock runs ~1h fast, every
	// new token already looks expired and the ticker refreshes twice per tick while the page is
	// visible. This client only signs storage requests, and getSession() still refreshes an
	// expiring token before each request, so stop both once initialization has registered them.
	await supabase.auth.initialize();
	await supabase.auth.stopAutoRefresh();

	return supabase;
}
