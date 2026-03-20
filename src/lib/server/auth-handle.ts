import { redirect, type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import type { AuthContext } from '$lib/auth/types';
import {
	type AuthContextSupabaseClient,
	createAnonymousAuthContext,
	getAccessRedirect,
	resolveAuthContext,
	TARGET_COOKIE_NAME
} from '$lib/server/auth-context';

type ResolveRequestAuthContext = (args: {
	supabase: AuthContextSupabaseClient;
	selectedTarget: string | null;
	getVerifiedUser: () => Promise<User | null>;
}) => Promise<AuthContext>;

type SupabaseLikeEvent = {
	cookies: unknown;
	fetch: typeof fetch;
};

type SupabaseClientFactory = (event: SupabaseLikeEvent) => AuthContextSupabaseClient;

function createAnonymousSupabaseClient(): AuthContextSupabaseClient {
	return {
		auth: {
			async getUser() {
				return {
					data: { user: null },
					error: null
				};
			}
		},
		from() {
			throw new Error('Anonymous fallback client does not support database queries.');
		}
	};
}

function createHandleSupabaseClient(event: SupabaseLikeEvent): AuthContextSupabaseClient {
	const { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } = env;

	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error('Missing Supabase public environment variables.');
	}

	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch: event.fetch
		},
		cookies: {
			getAll: () => (event.cookies as { getAll: () => Array<{ name: string; value: string }> }).getAll(),
			setAll: (cookiesToSet) => {
				const cookies = event.cookies as {
					set: (name: string, value: string, options: { path?: string }) => void;
				};

				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, {
						...options,
						path: options.path ?? '/'
					});
				});
			}
		}
	}) as unknown as AuthContextSupabaseClient;
}

export function createAuthHandle(
	options: {
		createSupabaseServerClient?: SupabaseClientFactory;
		resolveRequestAuthContext?: ResolveRequestAuthContext;
	} = {}
) {
	const defaultCreateClient: SupabaseClientFactory = (event) => createHandleSupabaseClient(event);
	const createClient: SupabaseClientFactory =
		options.createSupabaseServerClient ?? defaultCreateClient;
	const resolveRequestAuthContext: ResolveRequestAuthContext =
		options.resolveRequestAuthContext ?? resolveAuthContext;

	const handle: Handle = async ({ event, resolve }) => {
		if (event.route.id === null) {
			return resolve(event);
		}

		let verifiedUserPromise: Promise<User | null> | null = null;
		let getVerifiedUser = async () => {
			if (!verifiedUserPromise) {
				verifiedUserPromise = supabase.auth
					.getUser()
					.then(({ data, error }) => (error ? null : data.user));
			}

			return verifiedUserPromise;
		};
		let supabase: AuthContextSupabaseClient = createAnonymousSupabaseClient();
		let authContext: AuthContext = createAnonymousAuthContext();

		try {
			supabase = createClient(event as SupabaseLikeEvent);
			authContext = await resolveRequestAuthContext({
				supabase,
				selectedTarget: event.cookies.get(TARGET_COOKIE_NAME) ?? null,
				getVerifiedUser
			});
		} catch (error) {
			const isMissingSupabaseEnv =
				error instanceof Error &&
				error.message === 'Missing Supabase public environment variables.';

			if (!isMissingSupabaseEnv) {
				throw error;
			}

			verifiedUserPromise = Promise.resolve(null);
			getVerifiedUser = async () => null;
			supabase = createAnonymousSupabaseClient();
			authContext = createAnonymousAuthContext();
		}

		event.locals.supabase = supabase as any;
		event.locals.getVerifiedUser = getVerifiedUser as any;
		event.locals.authContext = authContext;

		const redirectPath = getAccessRedirect({
			pathname: event.url.pathname,
			accessState: authContext.accessState
		});

		if (redirectPath && redirectPath !== event.url.pathname) {
			redirect(303, redirectPath);
		}

		return resolve(event);
	};

	return handle;
}

export const handle = createAuthHandle();
