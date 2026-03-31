import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { getLoaders, createLoader, updateLoader, invalidateLoadersCache } = vi.hoisted(() => ({
	getLoaders: vi.fn(),
	createLoader: vi.fn(),
	updateLoader: vi.fn(),
	invalidateLoadersCache: vi.fn()
}));

vi.mock('$lib/loaders.cached', () => ({
	getLoaders,
	invalidateLoadersCache
}));

vi.mock('$lib/loaders.remote', () => ({
	createLoader,
	updateLoader
}));

import LoadersPage from './+page.svelte';

function createLoadersQuery(
	current: Array<{
		id: number;
		name: string;
		isActive: boolean;
	}>,
	overrides: Record<string, unknown> = {}
) {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

describe('loaders utility page', () => {
	beforeEach(() => {
		getLoaders.mockReset();
		createLoader.mockReset();
		updateLoader.mockReset();
		invalidateLoadersCache.mockReset();
		getLoaders.mockReturnValue(
			createLoadersQuery([
				{ id: 1, name: 'Alex', isActive: true },
				{ id: 2, name: 'Casey', isActive: false },
				{ id: 3, name: 'Taylor', isActive: true }
			])
		);
	});

	it('shows active loaders by default and reveals inactive loaders when the toggle is enabled', async () => {
		const refresh = vi.fn();
		getLoaders.mockReturnValue(createLoadersQuery([
			{ id: 1, name: 'Alex', isActive: true },
			{ id: 2, name: 'Casey', isActive: false },
			{ id: 3, name: 'Taylor', isActive: true }
		], { refresh }));

		render(LoadersPage, {
			params: {},
			data: {
				activeTarget: 'Canton' as const,
				displayName: 'Loader One',
				isAdmin: false,
				userEmail: 'loader@dakotasteelandtrim.com',
				userRole: 'loading' as const
			}
		});

		await vi.waitFor(() => expect(getLoaders).toHaveBeenCalledWith('Canton'));
		await expect.element(page.getByRole('heading', { name: 'Add Loader' })).toBeInTheDocument();
		await expect.element(page.getByText('SELECTABLES')).not.toBeInTheDocument();
		await expect.element(page.getByText('Alex')).toBeInTheDocument();
		await expect.element(page.getByText('Taylor')).toBeInTheDocument();
		await expect.element(page.getByText('Casey')).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Alex' }).getByText('Loader')).not.toBeInTheDocument();

		await page.getByLabelText('Show inactive loaders').click();
		expect(refresh).toHaveBeenCalledTimes(2);
		await expect.element(page.getByText('Casey')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Casey' })).toHaveClass(/bg-white/);
	});

	it('opens the editor for a loader and saves the updated name and active state', async () => {
		const refresh = vi.fn();
		getLoaders.mockReturnValue(
			createLoadersQuery(
				[
					{ id: 1, name: 'Alex', isActive: true },
					{ id: 2, name: 'Casey', isActive: false },
					{ id: 3, name: 'Taylor', isActive: true }
				],
				{ refresh }
			)
		);
		updateLoader.mockResolvedValue(undefined);

		render(LoadersPage, {
			params: {},
			data: {
				activeTarget: 'Freeport' as const,
				displayName: 'Loader One',
				isAdmin: true,
				userEmail: 'loader@dakotasteelandtrim.com',
				userRole: 'admin' as const
			}
		});

		await vi.waitFor(() => expect(getLoaders).toHaveBeenCalledWith('Freeport'));
		await page.getByLabelText('Show inactive loaders').click();
		await page.getByRole('button', { name: 'Casey' }).click();

		const dialog = page.getByRole('dialog', { name: 'Edit loader' });
		await expect.element(dialog).toBeInTheDocument();
		await expect.element(dialog.getByLabelText('Loader name')).toHaveValue('Casey');
		await expect.element(dialog.getByLabelText('Active loader')).not.toBeChecked();

		await dialog.getByLabelText('Loader name').fill(' Casey Updated ');
		await dialog.getByLabelText('Active loader').click();
		await dialog.getByRole('button', { name: 'Save changes' }).click();

		expect(updateLoader).toHaveBeenCalledWith({
			loaderId: 2,
			loaderName: 'Casey Updated',
			isActive: true
		});
		expect(invalidateLoadersCache).toHaveBeenCalledWith('Freeport');
		expect(refresh).toHaveBeenCalledTimes(3);
		await expect.element(page.getByText('Loader updated.')).toBeInTheDocument();
	});

	it('creates a loader, refreshes the list, and clears the form after success', async () => {
		const refresh = vi.fn();
		getLoaders.mockReturnValue(
			createLoadersQuery([{ id: 1, name: 'Alex', isActive: true }], { refresh })
		);
		createLoader.mockResolvedValue(undefined);

		render(LoadersPage, {
			params: {},
			data: {
				activeTarget: 'Freeport' as const,
				displayName: 'Loader One',
				isAdmin: true,
				userEmail: 'loader@dakotasteelandtrim.com',
				userRole: 'admin' as const
			}
		});

		await vi.waitFor(() => expect(getLoaders).toHaveBeenCalledWith('Freeport'));
		await page.getByLabelText('Loader name').fill(' Morgan ');
		await page.getByRole('button', { name: 'Insert loader' }).click();

		expect(createLoader).toHaveBeenCalledWith('Morgan');
		expect(invalidateLoadersCache).toHaveBeenCalledWith('Freeport');
		expect(refresh).toHaveBeenCalledOnce();
		await expect.element(page.getByLabelText('Loader name')).toHaveValue('');
		await expect.element(page.getByText('Loader created and marked active.')).toBeInTheDocument();
	});
});
