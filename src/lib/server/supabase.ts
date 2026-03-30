import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { getSupabasePublicEnv } from '$lib/server/environment';

export function createSupabaseBrowserClient() {
	const { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } = getSupabasePublicEnv();

	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}

export function createSupabaseServerClient(event: Pick<RequestEvent, 'cookies' | 'fetch'>) {
	const { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } = getSupabasePublicEnv();

	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch: event.fetch
		},
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						...options,
						path: options.path ?? '/'
					});
				});
			}
		}
	});
}
