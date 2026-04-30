import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LoaderEditorModal from './loader-editor-modal.svelte';

describe('loader editor modal', () => {
	it('renders as a centered modal on every viewport', async () => {
		render(LoaderEditorModal, {
			loader: {
				id: 7,
				name: 'Alick',
				isActive: true
			},
			onClose: vi.fn(),
			onSave: vi.fn()
		});

		await expect.element(page.getByTestId('loader-editor-modal-backdrop')).toHaveClass(/items-center/);
		await expect.element(page.getByTestId('loader-editor-modal-backdrop')).not.toHaveClass(/items-end/);
		await expect.element(page.getByTestId('loader-editor-modal')).toBeInTheDocument();
	});
});
