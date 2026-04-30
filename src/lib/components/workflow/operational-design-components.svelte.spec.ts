import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ChevronRight, Grid2x2 } from '@lucide/svelte';
import { createRawSnippet } from 'svelte';

import DepartmentStatusPills from './department-status-pills.svelte';
import DropCounterBar from './drop-counter-bar.svelte';
import OperationalActionCard from './operational-action-card.svelte';
import ScannedIdGrid from './scanned-id-grid.svelte';
import WorkflowModalShell from './workflow-modal-shell.svelte';
import WorkflowScanField from './workflow-scan-field.svelte';

describe('operational design system primitives', () => {
	it('renders compact blue action cards with the iPad touch anatomy', async () => {
		render(OperationalActionCard, {
			name: 'Staging',
			detail: 'Organize outgoing inventory',
			icon: Grid2x2,
			trailingIcon: ChevronRight,
			href: '/staging',
			testId: 'action-card'
		});

		await expect.element(page.getByTestId('action-card')).toHaveClass(/ds-action-card/);
		await expect.element(page.getByTestId('action-card-icon')).toHaveClass(/ds-action-card-icon/);
		await expect.element(page.getByTestId('action-card')).toHaveTextContent('Staging');
		await expect.element(page.getByTestId('action-card')).toHaveAttribute('href', '/staging');
	});

	it('uses already-resolved hrefs directly so SSR does not resolve relative paths twice', async () => {
		render(OperationalActionCard, {
			name: 'Staging',
			detail: 'Organize outgoing inventory',
			icon: Grid2x2,
			trailingIcon: ChevronRight,
			href: './staging?returnTo=%2Fhome',
			testId: 'resolved-action-card'
		});

		await expect
			.element(page.getByTestId('resolved-action-card'))
			.toHaveAttribute('href', './staging?returnTo=%2Fhome');
	});

	it('keeps scan inputs full-width, blue-tinted, and scanner ready', async () => {
		const handleKeydown = vi.fn();

		render(WorkflowScanField, {
			id: 'scan-field',
			label: 'Scan Barcode',
			value: '',
			placeholder: 'Scan or type item barcode...',
			testId: 'scan-field',
			onKeydown: handleKeydown
		});

		await expect.element(page.getByTestId('scan-field-input')).toHaveClass(/ds-scan-input/);
		await expect.element(page.getByTestId('scan-field-input')).toHaveAttribute(
			'autocomplete',
			'off'
		);
		await expect.element(page.getByTestId('scan-field-input')).toHaveAttribute('inputmode', 'text');
	});

	it('renders department status pills as labeled six-up status controls', async () => {
		render(DepartmentStatusPills, {
			entries: [
				{ label: 'Slit', value: 'NA', testId: 'status-slit' },
				{ label: 'Trim', value: 'DONE', testId: 'status-trim' },
				{ label: 'Wrap', value: 'DUE', testId: 'status-wrap' },
				{ label: 'Roll', value: 'BOT', testId: 'status-roll' },
				{ label: 'Parts', value: null, testId: 'status-parts' },
				{ label: 'Soffit', value: 'NA', testId: 'status-soffit' }
			],
			testId: 'department-status'
		});

		await expect.element(page.getByTestId('department-status')).toHaveClass(/ds-department-status/);
		await expect.element(page.getByTestId('status-slit-pill')).toHaveTextContent('NA');
		await expect.element(page.getByTestId('status-wrap-pill')).toHaveClass(/ds-status-due/);
		await expect.element(page.getByTestId('status-roll-pill')).toHaveClass(/ds-status-pending/);
	});

	it('renders drop counters with 64px navigation arrows and three colored cards', async () => {
		render(DropCounterBar, {
			activeDropNumber: 1,
			totalDrops: 3,
			labels: 12,
			scanned: 4,
			needPick: 8,
			canGoPrevious: false,
			canGoNext: true,
			onPrevious: vi.fn(),
			onNext: vi.fn(),
			testId: 'drop-counter'
		});

		await expect.element(page.getByTestId('drop-counter')).toHaveClass(/ds-drop-counter/);
		await expect.element(page.getByTestId('drop-counter-previous')).toHaveClass(/ds-nav-arrow/);
		await expect.element(page.getByTestId('drop-counter-next')).toHaveClass(/ds-nav-arrow/);
		await expect.element(page.getByTestId('drop-counter-labels')).toHaveTextContent('12');
	});

	it('renders scanned item cards as barcode-only monospace blocks', async () => {
		render(ScannedIdGrid, {
			items: ['S4-D3301D1-1-86B52', 'R7-K4402A2-2-91C63'],
			testId: 'scanned-grid'
		});

		await expect.element(page.getByTestId('scanned-grid')).toHaveClass(/ds-scanned-grid/);
		await expect.element(page.getByTestId('scanned-grid-card-0')).toHaveClass(/font-mono/);
		await expect.element(page.getByTestId('scanned-grid-card-0')).toHaveTextContent(
			'S4-D3301D1-1-86B52'
		);
	});

	it('renders modal shells as centered dialogs by default', async () => {
		render(WorkflowModalShell, {
			title: 'Select department',
			testId: 'modal-shell',
			onClose: vi.fn()
		});

		await expect.element(page.getByTestId('modal-shell-backdrop')).toHaveClass(/items-center/);
		await expect.element(page.getByTestId('modal-shell')).toHaveClass(/ds-modal/);
		await expect.element(page.getByTestId('modal-shell-handle')).not.toBeInTheDocument();
	});

	it('closes modal shells on Escape and traps Tab focus inside the dialog', async () => {
		const onClose = vi.fn();
		const children = createRawSnippet(() => ({
			render: () =>
				'<div><button type="button" data-testid="first-modal-action">First</button><button type="button" data-testid="last-modal-action">Last</button></div>'
		}));

		render(WorkflowModalShell, {
			title: 'Select department',
			testId: 'modal-shell',
			onClose,
			children
		});

		const dialog = document.querySelector('[data-testid="modal-shell"]');
		const closeButton = page.getByRole('button', { name: 'Close' }).element();
		const firstAction = document.querySelector('[data-testid="first-modal-action"]');
		const lastAction = document.querySelector('[data-testid="last-modal-action"]');

		if (
			!(dialog instanceof HTMLElement) ||
			!(closeButton instanceof HTMLElement) ||
			!(firstAction instanceof HTMLElement) ||
			!(lastAction instanceof HTMLElement)
		) {
			throw new Error('Expected modal focus targets.');
		}

		dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onClose).toHaveBeenCalledOnce();

		lastAction.focus();
		lastAction.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(document.activeElement).toBe(closeButton);

		closeButton.focus();
		closeButton.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
		);
		expect(document.activeElement).toBe(lastAction);
	});
});
