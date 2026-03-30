import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { getLoaders, createLoader, invalidateLoadersCache } = vi.hoisted(() => ({
	getLoaders: vi.fn(),
	createLoader: vi.fn(),
	invalidateLoadersCache: vi.fn()
}));

vi.mock('$lib/loaders.cached', () => ({
	getLoaders,
	invalidateLoadersCache
}));

vi.mock('$lib/loaders.remote', () => ({
	createLoader,
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
		invalidateLoadersCache.mockReset();
		getLoaders.mockReturnValue(
			createLoadersQuery([
				{ id: 1, name: 'Alex', isActive: true },
				{ id: 2, name: 'Casey', isActive: false },
				{ id: 3, name: 'Taylor', isActive: true }
			])
		);
	});

	it('shows only active loaders and keeps the add-loader utility flow on the same page', async () => {
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

		await expect.element(page.getByRole('heading', { name: 'Add Loader' })).toBeInTheDocument();
		await expect.element(page.getByText('Alex')).toBeInTheDocument();
		await expect.element(page.getByText('Taylor')).toBeInTheDocument();
		await expect.element(page.getByText('Casey')).not.toBeInTheDocument();
		await expect.element(page.getByText('Alex', { exact: true })).toHaveClass(/text-white/);
		await expect.element(page.getByText('Alex', { exact: true })).toHaveClass(
			/text-2xl/
		);
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

		await page.getByLabelText('Loader name').fill(' Morgan ');
		await page.getByRole('button', { name: 'Insert loader' }).click();

		expect(createLoader).toHaveBeenCalledWith('Morgan');
		expect(invalidateLoadersCache).toHaveBeenCalledOnce();
		expect(refresh).toHaveBeenCalledOnce();
		await expect.element(page.getByLabelText('Loader name')).toHaveValue('');
		await expect.element(page.getByText('Morgan is now active and selectable.')).toBeInTheDocument();
	});
});
