import { fail, redirect, error, type Cookies, type RequestEvent } from '@sveltejs/kit';
import { type AuthContext, type AccessState } from '$lib/auth/types';
import {
	type AuthContextSupabaseClient,
	type ProfileRow,
	type WarehouseRow,
	getTargetCookieOptions,
	resolveAuthContext,
	TARGET_COOKIE_NAME
} from '$lib/server/auth-context';
import { createSupabaseServerClient } from '$lib/server/supabase';

type LoginFailure = {
	email: string;
	message: string;
};

type ResetFailure = {
	email: string;
	code: string;
	message: string;
};

type ChangePasswordFailure = {
	message: string;
};

const FIXED_EMAIL_DOMAIN = '@dakotasteelandtrim.com';

type ProfilesQuery = {
	select: (selection: string) => {
		eq: (column: 'id', value: string) => {
			maybeSingle: () => PromiseLike<{ data: ProfileRow | null; error: unknown }>;
		};
	};
};

type WarehousesQuery = {
	select: (selection: string) => {
		eq: (column: 'id', value: number) => {
			maybeSingle: () => PromiseLike<{ data: WarehouseRow | null; error: unknown }>;
		};
	};
};

function getString(formData: FormData, name: string) {
	const value = formData.get(name);
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeFixedDomainEmail(value: string) {
	const normalizedValue = value.trim().toLowerCase();

	if (!normalizedValue) {
		return '';
	}

	return normalizedValue.endsWith(FIXED_EMAIL_DOMAIN)
		? normalizedValue
		: `${normalizedValue.replace(/@.*$/, '')}${FIXED_EMAIL_DOMAIN}`;
}

function getFixedDomainEmail(formData: FormData) {
	const username = normalizeFixedDomainEmail(getString(formData, 'username'));

	if (username) {
		return username;
	}

	return normalizeFixedDomainEmail(getString(formData, 'email'));
}

function clearTargetCookie(cookies: Cookies) {
	cookies.delete(TARGET_COOKIE_NAME, getTargetCookieOptions());
}

function toAuthContextSupabaseClient(
	supabase: ReturnType<typeof createSupabaseServerClient>
): AuthContextSupabaseClient {
	function from(table: 'profiles'): ProfilesQuery;
	function from(table: 'warehouses'): WarehousesQuery;
	function from(table: 'profiles' | 'warehouses'): ProfilesQuery | WarehousesQuery {
		if (table === 'profiles') {
			return {
				select: (selection: string) => ({
					eq: (column: 'id', value: string) => ({
						maybeSingle: async () => {
							const { data, error } = await supabase
								.from('profiles')
								.select(selection)
								.eq(column, value)
								.maybeSingle();

							return {
								data: data as ProfileRow | null,
								error
							};
						}
					})
				})
			};
		}

		return {
			select: (selection: string) => ({
				eq: (column: 'id', value: number) => ({
					maybeSingle: async () => {
						const { data, error } = await supabase
							.from('warehouses')
							.select(selection)
							.eq(column, value)
							.maybeSingle();

						return {
							data: data as WarehouseRow | null,
							error
						};
					}
				})
			})
		};
	}

	return {
		auth: {
			getUser: () => supabase.auth.getUser()
		},
		from
	};
}

function getAuthRedirect(accessState: AccessState) {
	switch (accessState) {
		case 'inactive':
			return '/inactive';
		case 'admin-needs-target':
			return '/location';
		case 'admin-ready':
		case 'operator-ready':
			return '/home';
		default:
			error(500, 'Unable to resolve a valid post-login destination.');
	}
}

export async function handleLogin(event: Pick<RequestEvent, 'request' | 'cookies' | 'fetch'>) {
	const formData = await event.request.formData();
	const email = getFixedDomainEmail(formData);
	const password = getString(formData, 'password');

	if (!email || !password) {
		return fail(400, {
			email,
			message: 'Enter your email and password.'
		} satisfies LoginFailure);
	}

	const supabase = createSupabaseServerClient(event);
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (signInError) {
		return fail(400, {
			email,
			message: 'We could not sign you in with those credentials.'
		} satisfies LoginFailure);
	}

	clearTargetCookie(event.cookies);

	const authContext = await resolveAuthContext({
		supabase: toAuthContextSupabaseClient(supabase),
		selectedTarget: null
	});

	redirect(303, getAuthRedirect(authContext.accessState));
}

export async function handleForgotPassword(
	event: Pick<RequestEvent, 'request' | 'cookies' | 'fetch' | 'url'>
) {
	const formData = await event.request.formData();
	const email = getFixedDomainEmail(formData);

	if (!email) {
		return fail(400, {
			email,
			message: 'Enter the email for your account.'
		});
	}

	const supabase = createSupabaseServerClient(event);
	// This code-based reset flow depends on the Supabase recovery email template
	// being configured to expose the recovery token instead of the default link URL.
	await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: new URL('/reset-password', event.url).toString()
	});

	redirect(303, `/reset-password?email=${encodeURIComponent(email)}&sent=1`);
}

export async function handleResetPassword(
	event: Pick<RequestEvent, 'request' | 'cookies' | 'fetch'>
) {
	const formData = await event.request.formData();
	const email = getString(formData, 'email').toLowerCase();
	const code = getString(formData, 'code');
	const password = getString(formData, 'password');
	const confirmPassword = getString(formData, 'confirmPassword');

	if (!email || !code || !password || !confirmPassword || password !== confirmPassword) {
		return fail(400, {
			email,
			code,
			message: 'Enter a matching new password.'
		} satisfies ResetFailure);
	}

	const supabase = createSupabaseServerClient(event);
	const { error: verifyError } = await supabase.auth.verifyOtp({
		email,
		token: code,
		type: 'recovery'
	});

	if (verifyError) {
		return fail(400, {
			email,
			code,
			message: 'We could not verify that recovery code.'
		} satisfies ResetFailure);
	}

	const { error: updateError } = await supabase.auth.updateUser({
		password
	});

	if (updateError) {
		return fail(400, {
			email,
			code,
			message: 'We could not update the password for this account.'
		} satisfies ResetFailure);
	}

	await supabase.auth.signOut({ scope: 'local' });
	clearTargetCookie(event.cookies);

	redirect(303, '/login?reset=success');
}

function getSignedInEmail(authContext: AuthContext) {
	return (
		authContext.user?.email ??
		authContext.profile?.email ??
		error(500, 'No signed-in email is available for this account.')
	);
}

export async function handleChangePassword(
	event: Pick<RequestEvent, 'request' | 'cookies' | 'fetch' | 'locals'>
) {
	const formData = await event.request.formData();
	const currentPassword = getString(formData, 'currentPassword');
	const password = getString(formData, 'password');
	const confirmPassword = getString(formData, 'confirmPassword');

	if (!currentPassword || !password || !confirmPassword || password !== confirmPassword) {
		return fail(400, {
			message: 'Enter your current password and a matching new password.'
		} satisfies ChangePasswordFailure);
	}

	const email = getSignedInEmail(event.locals.authContext);
	const supabase = createSupabaseServerClient(event);
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email,
		password: currentPassword
	});

	if (signInError) {
		return fail(400, {
			message: 'Your current password is incorrect.'
		} satisfies ChangePasswordFailure);
	}

	const { error: updateError } = await supabase.auth.updateUser({
		password
	});

	if (updateError) {
		return fail(400, {
			message: 'We could not update your password.'
		} satisfies ChangePasswordFailure);
	}

	return {
		success: true,
		message: 'Your password has been updated.'
	};
}

export async function handleLogout(event: Pick<RequestEvent, 'cookies' | 'fetch'>) {
	const supabase = createSupabaseServerClient(event);
	await supabase.auth.signOut({ scope: 'local' });
	clearTargetCookie(event.cookies);
	redirect(303, '/login?logout=success');
}
