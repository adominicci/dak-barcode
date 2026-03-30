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
		emptyMessage: 'No options available.',
		onClose: vi.fn(),
		onPick: vi.fn()
	};
}

describe('selection modal', () => {
	it('renders picker options as blue cards in a four-column grid on wide layouts', async () => {
		render(SelectionModal, {
			props: {
				...baseProps()
			}
		});

		await expect.element(page.getByRole('dialog', { name: 'Select loader for Wrap' })).toBeInTheDocument();
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
	});
});
