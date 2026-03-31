import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ConfirmationModal from './confirmation-modal.svelte';

describe('confirmation modal', () => {
	it('derives the pending spinner label from the confirm label by default', async () => {
		render(ConfirmationModal, {
			props: {
				title: 'Approve shipment',
				description: 'Confirm the approval.',
				confirmLabel: 'Approve',
				pending: true,
				error: null,
				onCancel: vi.fn(),
				onConfirm: vi.fn()
			}
		});

		await expect.element(page.getByLabelText('Approve...')).toBeInTheDocument();
	});
});
