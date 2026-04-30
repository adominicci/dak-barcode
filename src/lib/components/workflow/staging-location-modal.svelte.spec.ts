import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
	beforeEach(() => {
		getDropAreasByDepartment.mockReset();
		getDropArea.mockReset();
	});

	it('resolves numeric lookup from a promise-like getDropArea query', async () => {
		const onSelect = vi.fn();
		getDropArea.mockReturnValue(Promise.resolve({
			id: 31,
			name: 'C3',
			supportsWrap: true,
			supportsParts: false,
			supportsRoll: false,
			supportsLoading: false,
			supportsDriverLocation: false,
			firstCharacter: 'C'
		} satisfies DropArea));
		getDropAreasByDepartment.mockReturnValue(createQueryState([]));

		render(StagingLocationModal, {
			props: {
				department: 'Wrap',
				mode: 'staging',
				target: 'Canton',
				onClose: vi.fn(),
				onSelect
			}
		});

		await page.getByLabelText('Scan new location').fill('31');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(31);
		await vi.waitFor(() => {
			expect(onSelect).toHaveBeenCalledWith({
				dropAreaId: 31,
				dropAreaLabel: 'C3'
			});
		});
	});

	it('accepts any driver location in loading mode without department or load-location support', async () => {
		const onSelect = vi.fn();
		getDropArea.mockReturnValue(Promise.resolve({
			id: 25,
			name: 'DM',
			supportsWrap: false,
			supportsParts: false,
			supportsRoll: false,
			supportsLoading: false,
			supportsDriverLocation: true,
			firstCharacter: 'D'
		} satisfies DropArea));
		getDropAreasByDepartment.mockReturnValue(createQueryState([]));

		render(StagingLocationModal, {
			props: {
				department: 'Parts',
				driverLocationOnly: true,
				mode: 'loading',
				target: 'Canton',
				onClose: vi.fn(),
				onSelect
			}
		});

		await expect
			.element(page.getByTestId('staging-location-modal'))
			.not.toHaveClass('h-[calc(100dvh-2rem)]');
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/max-w-5xl/);
		await expect
			.element(page.getByTestId('staging-location-modal'))
			.not.toHaveClass(/h-\[calc\(100dvh-3rem\)\]/);
		await expect
			.element(page.getByTestId('staging-location-list-scroll-region'))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByText('Scan a driver location to continue.'))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByText('No locations are available for this department yet.'))
			.not.toBeInTheDocument();

		await page.getByLabelText('Scan new location').fill('25');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(25);
		await vi.waitFor(() => {
			expect(onSelect).toHaveBeenCalledWith({
				dropAreaId: 25,
				dropAreaLabel: 'DM'
			});
		});
	});

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
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/ds-modal/);
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/h-\[calc\(100dvh-3rem\)\]/);
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/max-w-7xl/);
		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/overflow-hidden/);
		await expect.element(page.getByTestId('staging-location-list-scroll-region')).toHaveClass(
			/overscroll-contain/
		);
		await expect.element(page.getByTestId('staging-location-list-scroll-region')).toHaveClass(
			/overflow-y-auto/
		);
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveClass(
			/ds-action-card/
		);
		await expect.element(page.getByRole('tab', { name: 'B' })).toHaveClass(/h-10/);
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveClass(/min-h-16/);
		await expect.element(page.getByRole('button', { name: 'Bay 2' })).toHaveClass(/py-3/);
		await expect.element(page.getByRole('button', { name: 'Bay 2' }).getByText('Bay 2')).toHaveClass(/text-2xl/);
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

	it('adds a second letter filter only for Freeport Roll staging groups', async () => {
		getDropAreasByDepartment.mockReturnValue(
			createQueryState([
				{
					id: 101,
					name: 'A-R-1',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 102,
					name: 'A-R-2',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 103,
					name: 'A-D-1',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 104,
					name: 'A-M-1',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 105,
					name: 'A-12',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 106,
					name: 'B-R-1',
					supportsWrap: false,
					supportsParts: false,
					supportsRoll: true,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'B'
				}
			])
		);

		render(StagingLocationModal, {
			props: {
				department: 'Roll',
				mode: 'staging',
				target: 'Freeport',
				onClose: vi.fn(),
				onSelect: vi.fn()
			}
		});

		await vi.waitFor(() => expect(getDropAreasByDepartment).toHaveBeenCalledWith('Roll', 'Freeport'));
		await expect
			.element(page.getByTestId('staging-location-letter-tabs').getByRole('tab', { name: 'A' }))
			.toHaveAttribute('aria-selected', 'true');
		await expect
			.element(page.getByTestId('staging-location-letter-tabs').getByRole('tab', { name: 'B' }))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-location-second-letter-tabs')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'All' }))
			.toHaveAttribute('aria-selected', 'true');
		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'D' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'M' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'R' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-12' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-D-1' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-M-1' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-R-1' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-R-2' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'B-R-1' })).not.toBeInTheDocument();

		await page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'R' }).click();

		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs').getByRole('tab', { name: 'R' }))
			.toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByRole('button', { name: 'A-R-1' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-R-2' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-D-1' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-M-1' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'A-12' })).not.toBeInTheDocument();
	});

	it('keeps the single letter tabs outside Freeport Roll staging', async () => {
		getDropAreasByDepartment.mockReturnValue(
			createQueryState([
				{
					id: 201,
					name: 'A-R-1',
					supportsWrap: true,
					supportsParts: false,
					supportsRoll: false,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				},
				{
					id: 202,
					name: 'A-D-1',
					supportsWrap: true,
					supportsParts: false,
					supportsRoll: false,
					supportsLoading: false,
					supportsDriverLocation: false,
					firstCharacter: 'A'
				}
			])
		);

		render(StagingLocationModal, {
			props: {
				department: 'Wrap',
				mode: 'staging',
				target: 'Freeport',
				onClose: vi.fn(),
				onSelect: vi.fn()
			}
		});

		await vi.waitFor(() => expect(getDropAreasByDepartment).toHaveBeenCalledWith('Wrap', 'Freeport'));
		await expect.element(page.getByTestId('staging-location-letter-tabs')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('staging-location-second-letter-tabs'))
			.not.toBeInTheDocument();
	});
});
