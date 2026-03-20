import { expect, test } from '@playwright/test';

const routeExpectations = [
	{ path: '/login', heading: 'Sign in' },
	{ path: '/forgot-password', heading: 'Forgot password' },
	{ path: '/reset-password', heading: 'Reset password' }
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

for (const path of ['/home', '/location', '/inactive']) {
	test(`redirects anonymous traffic from ${path} to /login`, async ({ page }) => {
		await page.goto(path);

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
	});
}
