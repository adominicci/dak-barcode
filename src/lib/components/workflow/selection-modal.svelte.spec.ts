import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectionModal from './selection-modal.svelte';

function baseProps() {
	return {
		title: 'Select loader for Wrap',
		description: 'Choose a loader to continue.',
		options: [
			{ id: 1, label: 'Alick' },
			{ id: 2, label: 'Brandon' }
		],
		loading: false,
		error: null,
		saving: false,
		refreshing: false,
		emptyMessage: 'No options available.',
		onClose: vi.fn(),
		onPick: vi.fn(),
		onRefresh: vi.fn()
	};
}

describe('selection modal', () => {
	it('renders picker options as blue cards in a four-column grid on wide layouts', async () => {
		const props = baseProps();
		render(SelectionModal, {
			props
		});

		await expect.element(page.getByRole('dialog', { name: 'Select loader for Wrap' })).toBeInTheDocument();
		await expect.element(page.getByTestId('selection-modal-backdrop')).toHaveClass(/items-center/);
		await expect.element(page.getByTestId('selection-modal')).toHaveClass(/ds-modal/);
		await expect.element(page.getByText('Alick')).toBeInTheDocument();
		await expect.element(page.getByTestId('selection-modal')).toHaveTextContent('Alick');
		await expect.element(page.getByTestId('selection-modal')).toHaveTextContent('Brandon');
		await expect.element(page.getByTestId('selection-modal-scroll-area')).toHaveClass(
			/overflow-y-auto/
		);
		await expect.element(page.getByTestId('selection-modal-options-grid')).toHaveClass(
			/lg:grid-cols-4/
		);
		await expect.element(page.getByRole('button', { name: 'Alick' })).toHaveClass(
			/bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/
		);
		await expect.element(page.getByRole('button', { name: 'Alick' })).toHaveClass(/text-white/);
		await expect.element(page.getByRole('button', { name: 'Refresh list' })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Refresh list' }).click();
		expect(props.onRefresh).toHaveBeenCalledOnce();
	});

	it('can render a browse-only three-column picker for unavailable selections', async () => {
		const props = {
			...baseProps(),
			title: 'Select trailer',
			description: 'Choose a trailer for L-042.',
			options: [
				{ id: 'trailer-16208', label: '16208-Transfer Trailer' },
				{ id: 'trailer-2023', label: 'Conestoga Trailer (2023D)' }
			],
			columns: 3 as const,
			selectionDisabled: true,
			selectionDisabledMessage: 'Trailer updates are coming soon.'
		};
		render(SelectionModal, {
			props
		});

		await expect.element(page.getByRole('dialog', { name: 'Select trailer' })).toBeInTheDocument();
		await expect.element(page.getByText('Trailer updates are coming soon.')).toBeInTheDocument();
		await expect.element(page.getByTestId('selection-modal-options-grid')).toHaveClass(
			/lg:grid-cols-3/
		);
		await expect.element(page.getByTestId('selection-modal-options-grid')).not.toHaveClass(
			/lg:grid-cols-4/
		);
		await expect.element(page.getByRole('button', { name: '16208-Transfer Trailer' })).toBeDisabled();

		expect(props.onPick).not.toHaveBeenCalled();
	});
});
