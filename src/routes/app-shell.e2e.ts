import { expect, test } from '@playwright/test';

const routeExpectations = [
	{ path: '/login', heading: 'Welcome Back' },
	{ path: '/forgot-password', heading: 'Forgot password' },
	{ path: '/reset-password', heading: 'Reset password' }
];

test('redirects the root route to login', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('heading', { name: 'Welcome Back', exact: true })).toBeVisible();
});

for (const route of routeExpectations) {
	test(`renders the ${route.path} shell`, async ({ page }) => {
		await page.goto(route.path);

		await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible();
	});
}

for (const path of ['/login', '/forgot-password']) {
	test(`shows the locked email domain on ${path}`, async ({ page }) => {
		await page.goto(path);

		await expect(page.getByText('@dakotasteelandtrim.com', { exact: true })).toBeVisible();
		await expect(page.locator('input[type="text"]').first()).toBeVisible();
	});
}

for (const path of ['/home', '/location', '/inactive', '/account']) {
	test(`redirects anonymous traffic from ${path} to /login`, async ({ page }) => {
		await page.goto(path);

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Welcome Back', exact: true })).toBeVisible();
	});
}
