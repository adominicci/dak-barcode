import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { DropArea } from '$lib/types';

const { getDropAreasByDepartment, getDropArea } = vi.hoisted(() => ({
	getDropAreasByDepartment: vi.fn(),
	getDropArea: vi.fn()
}));

vi.mock('$lib/drop-areas.cached', () => ({
	getDropAreasByDepartment,
}));

vi.mock('$lib/drop-areas.remote', () => ({
	getDropArea
}));

import StagingLocationModal from './staging-location-modal.svelte';

function createQueryState(current: DropArea[]) {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn()
	};
}

describe('staging location modal', () => {
	it('renders target-style location cards with a scrollable five-column list and refreshes the query when clicked', async () => {
		const refresh = vi.fn();
		getDropAreasByDepartment.mockReturnValue(
			{
				...createQueryState([
					{
						id: 41,
						name: 'W12',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: 'W'
					}
				]),
				refresh
			}
		);

		render(StagingLocationModal, {
			props: {
				department: 'Wrap',
				mode: 'staging',
				target: 'Canton',
				onClose: vi.fn(),
				onSelect: vi.fn()
			}
		});

		await vi.waitFor(() => expect(getDropAreasByDepartment).toHaveBeenCalledWith('Wrap', 'Canton'));
		await expect.element(page.getByTestId('staging-location-modal-grid')).toHaveClass(
			/xl:grid-cols-5/
		);
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(
			/h-\[calc\(100dvh-2rem\)\]/
		);
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/overflow-hidden/);
		await expect.element(page.getByTestId('staging-location-list-scroll-region')).toHaveClass(
			/overscroll-contain/
		);
		await expect.element(page.getByTestId('staging-location-list-scroll-region')).toHaveClass(
			/overflow-y-auto/
		);
		await expect.element(page.getByRole('button', { name: 'W12' })).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByRole('button', { name: 'W12' })).toHaveClass(/text-white/);
		await expect.element(page.getByRole('button', { name: 'W12' })).toHaveTextContent('W12');
		await expect.element(page.getByRole('button', { name: 'W12' })).not.toHaveTextContent('Select');
		const firstCard = document.querySelector('[data-testid="staging-location-modal-grid"] button');
		if (!(firstCard instanceof HTMLElement)) {
			throw new Error('Expected the first location card.');
		}
		expect(firstCard.querySelector('svg')).toBeNull();

		await expect.element(page.getByRole('button', { name: 'Refresh list' })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Refresh list' }).click();

		expect(refresh).toHaveBeenCalledOnce();
	});
});
