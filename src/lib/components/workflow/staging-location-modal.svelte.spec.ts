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
	it('groups drop areas into letter tabs, defaults to the first tab, and refreshes the query when clicked', async () => {
		const refresh = vi.fn();
		getDropAreasByDepartment.mockReturnValue(
			{
				...createQueryState([
					{
						id: 31,
						name: 'C3',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: 'C'
					},
					{
						id: 32,
						name: 'C1',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: 'C'
					},
					{
						id: 33,
						name: 'Bay 2',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: null
					},
					{
						id: 34,
						name: 'C2',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: 'C'
					},
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
		await expect.element(page.getByTestId('staging-location-letter-tabs')).toBeInTheDocument();
		await expect.element(page.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'false');
		await expect.element(page.getByRole('tab', { name: 'W' })).toHaveAttribute('aria-selected', 'false');
		await expect.element(page.getByTestId('staging-location-modal-grid')).toHaveClass(/xl:grid-cols-5/);
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
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveClass(/text-white/);
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveTextContent('Bay 2');
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).not.toHaveTextContent('Select');
		await expect.element(page.getByRole('button', { name: 'C1' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('tab', { name: 'B' })).toHaveAttribute(
			'aria-controls',
			'staging-location-tabpanel'
		);
		await expect.element(page.getByTestId('staging-location-modal-grid')).toHaveAttribute(
			'id',
			'staging-location-tabpanel'
		);
		await page.getByRole('tab', { name: 'C' }).click();
		await expect.element(page.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'C1' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'C2' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'C3' })).toBeInTheDocument();

		const cardLabels = Array.from(
			document.querySelectorAll('[data-testid="staging-location-modal-grid"] button p')
		).map((element) => element.textContent?.trim());
		expect(cardLabels).toEqual(['C1', 'C2', 'C3']);

		const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
		if (!(activeTab instanceof HTMLElement)) {
			throw new Error('Expected an active tab.');
		}

		activeTab.focus();
		activeTab.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByRole('tab', { name: 'W' })).toHaveAttribute('aria-selected', 'true');
		expect(document.activeElement).toBe(document.querySelector('[role="tab"][aria-selected="true"]'));

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
