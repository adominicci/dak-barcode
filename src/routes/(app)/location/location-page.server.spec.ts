import { describe, expect, it, vi } from 'vitest';
import { actions, load } from './+page.server';
import { TARGET_COOKIE_NAME } from '$lib/server/auth-context';
import type { AuthContext } from '$lib/auth/types';

function createAdminContext(accessState: AuthContext['accessState'] = 'admin-needs-target'): AuthContext {
	return {
		accessState,
		isActive: true,
		isAdmin: true,
		profile: {
			id: 'admin-1',
			email: 'admin@dakotasteelandtrim.com',
			displayName: 'Admin User',
			userRole: 'admin',
			isActive: true,
			warehouseId: null,
			warehouse: null
		},
		role: 'admin',
		target: accessState === 'admin-ready' ? 'Canton' : null,
		user: null
	};
}

function createOperatorContext(): AuthContext {
	return {
		accessState: 'operator-ready',
		isActive: true,
		isAdmin: false,
		profile: {
			id: 'user-1',
			email: 'loader@dakotasteelandtrim.com',
			displayName: 'Loader One',
			userRole: 'loading',
			isActive: true,
			warehouseId: 1,
			warehouse: { alias: 'Canton' }
		},
		role: 'loading',
		target: 'Canton',
		user: null
	};
}

describe('location load', () => {
	it('redirects non-admin users home before rendering the selector', async () => {
		await expect(
			load({
				locals: { authContext: createOperatorContext() }
			} as never)
		).rejects.toMatchObject({
			status: 303,
			location: '/home'
		});
	});

	it('returns the current target for admin sessions reopening the selector', async () => {
		await expect(
			load({
				locals: { authContext: createAdminContext('admin-ready') }
			} as never)
		).resolves.toEqual({
			currentTarget: 'Canton'
		});
	});
});

describe('location actions', () => {
	it.each(['Canton', 'Freeport', 'Sandbox'] as const)(
		'saves %s into the session cookie and redirects home',
		async (target) => {
			const cookies = { set: vi.fn() };
			const request = new Request('https://example.com/location', {
				method: 'POST',
				body: new URLSearchParams({ target })
			});

			await expect(
				actions.default({
					request,
					cookies,
					locals: { authContext: createAdminContext() }
				} as never)
			).rejects.toMatchObject({
				status: 303,
				location: '/home'
			});

			expect(cookies.set).toHaveBeenCalledWith(
				TARGET_COOKIE_NAME,
				target,
				expect.objectContaining({
					httpOnly: true,
					path: '/',
					sameSite: 'lax'
				})
			);
		}
	);

	it('rejects invalid target values without mutating cookies', async () => {
		const cookies = { set: vi.fn() };
		const request = new Request('https://example.com/location', {
			method: 'POST',
			body: new URLSearchParams({ target: 'Invalid' })
		});

		const result = await actions.default({
			request,
			cookies,
			locals: { authContext: createAdminContext() }
		} as never);

		expect(result).toMatchObject({
			status: 400,
			data: {
				message: 'Select a valid target.'
			}
		});
		expect(cookies.set).not.toHaveBeenCalled();
	});
});
