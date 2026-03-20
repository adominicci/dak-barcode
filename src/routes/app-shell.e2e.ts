import { expect, test } from '@playwright/test';

const routeExpectations = [
	{ path: '/login', heading: 'Sign in' },
	{ path: '/forgot-password', heading: 'Forgot password' },
	{ path: '/reset-password', heading: 'Reset password' },
	{ path: '/home', heading: 'Stage & Load' },
	{ path: '/location', heading: 'Select environment' },
	{ path: '/inactive', heading: 'Account inactive' }
];

test('redirects the root route to login', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

for (const route of routeExpectations) {
	test(`renders the ${route.path} shell`, async ({ page }) => {
		await page.goto(route.path);

		await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
	});
}
