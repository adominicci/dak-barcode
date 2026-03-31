import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const {
	createSignedUrl,
	upload,
	createSupabaseBrowserClient,
	uploadWillCallSignature
} = vi.hoisted(() => ({
	createSignedUrl: vi.fn(),
	upload: vi.fn(),
	createSupabaseBrowserClient: vi.fn(),
	uploadWillCallSignature: vi.fn()
}));

vi.mock('$lib/supabase/client', () => ({
	createSupabaseBrowserClient
}));

vi.mock('$lib/will-call.remote', () => ({
	uploadWillCallSignature
}));

import WillCallSignatureModal from './will-call-signature-modal.svelte';

describe('will-call signature modal', () => {
	const originalGetContext = HTMLCanvasElement.prototype.getContext;
	const originalToBlob = HTMLCanvasElement.prototype.toBlob;

	beforeEach(() => {
		const canvasRenderingContext = {
			beginPath: vi.fn(),
			lineCap: 'round',
			lineJoin: 'round',
			lineTo: vi.fn(),
			moveTo: vi.fn(),
			stroke: vi.fn(),
			clearRect: vi.fn()
		} as unknown as CanvasRenderingContext2D;

		createSignedUrl.mockReset();
		upload.mockReset();
		createSupabaseBrowserClient.mockReset();
		uploadWillCallSignature.mockReset();

		createSignedUrl.mockResolvedValue({
			data: { signedUrl: 'https://signed.example.com/signature.png' },
			error: null
		});
		upload.mockResolvedValue({
			data: { path: 'will-call/42/signature_123.png' },
			error: null
		});
		createSupabaseBrowserClient.mockReturnValue({
			storage: {
				from: () => ({
					createSignedUrl,
					upload
				})
			}
		});
		uploadWillCallSignature.mockResolvedValue(undefined);

		HTMLCanvasElement.prototype.getContext = ((
			contextId: string
		) => (contextId === '2d' ? canvasRenderingContext : null)) as typeof HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
			callback?.(new Blob(['signature'], { type: 'image/png' }));
		});
	});

	it('renders an existing signature in view-only mode and resolves a signed URL for stored object paths', async () => {
		render(WillCallSignatureModal, {
			dropSheetId: 42,
			signatureRecord: {
				dropSheetCustomerId: 84,
				dropSheetId: 42,
				signature: null,
				signatureTimestamp: null,
				receivedBy: 'Jordan',
				signaturePath: 'will-call/42/signature_123.png'
			},
			onClose: vi.fn(),
			onUploaded: vi.fn()
		});

		await expect
			.element(page.getByLabelText('Received By'))
			.toHaveAttribute('readonly');
		await expect.element(page.getByLabelText('Received By')).toHaveValue('Jordan');
		expect(createSignedUrl).toHaveBeenCalledWith('will-call/42/signature_123.png', 3600);
		await expect.element(page.getByRole('img', { name: 'Will call signature preview' })).toHaveAttribute(
			'src',
			'https://signed.example.com/signature.png'
		);
		await expect
			.element(page.getByRole('button', { name: 'Upload Signature' }))
			.not.toBeInTheDocument();
	});

	it('uploads a drawn signature to Supabase storage and persists the stable path through the DST command', async () => {
		const onUploaded = vi.fn();

		render(WillCallSignatureModal, {
			dropSheetId: 42,
			signatureRecord: {
				dropSheetCustomerId: null,
				dropSheetId: 42,
				signature: null,
				signatureTimestamp: null,
				receivedBy: null,
				signaturePath: null
			},
			onClose: vi.fn(),
			onUploaded
		});

		await page.getByLabelText('Received By').fill('Jordan');
		const canvasElement = document.querySelector('[data-testid="will-call-signature-canvas"]');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Expected will call signature canvas element.');
		}

		canvasElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 24,
				clientY: 24,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointermove', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointerup', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true
			})
		);
		await page.getByRole('button', { name: 'Upload Signature' }).click();

		expect(upload).toHaveBeenCalledWith(
			expect.stringMatching(/^will-call\/42\/signature_\d+\.png$/),
			expect.any(Blob),
			{
				contentType: 'image/png',
				upsert: false
			}
		);
		expect(uploadWillCallSignature).toHaveBeenCalledWith({
			dropSheetId: 42,
			signaturePath: 'will-call/42/signature_123.png',
			receivedBy: 'Jordan'
		});
		expect(onUploaded).toHaveBeenCalled();
	});

	it('rejects upload when the canvas only receives a tap without a drawn stroke', async () => {
		render(WillCallSignatureModal, {
			dropSheetId: 42,
			signatureRecord: {
				dropSheetCustomerId: null,
				dropSheetId: 42,
				signature: null,
				signatureTimestamp: null,
				receivedBy: null,
				signaturePath: null
			},
			onClose: vi.fn(),
			onUploaded: vi.fn()
		});

		const canvasElement = document.querySelector('[data-testid="will-call-signature-canvas"]');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Expected will call signature canvas element.');
		}

		canvasElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 24,
				clientY: 24,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointerup', {
				clientX: 24,
				clientY: 24,
				bubbles: true,
				cancelable: true
			})
		);

		await page.getByRole('button', { name: 'Upload Signature' }).click();

		await expect.element(page.getByText('Signature is empty.')).toBeInTheDocument();
		expect(upload).not.toHaveBeenCalled();
		expect(uploadWillCallSignature).not.toHaveBeenCalled();
	});

	it('closes the modal after a successful upload even when the refresh callback fails', async () => {
		const onClose = vi.fn();
		const onUploaded = vi.fn().mockRejectedValue(new Error('Refresh failed'));

		render(WillCallSignatureModal, {
			dropSheetId: 42,
			signatureRecord: {
				dropSheetCustomerId: null,
				dropSheetId: 42,
				signature: null,
				signatureTimestamp: null,
				receivedBy: null,
				signaturePath: null
			},
			onClose,
			onUploaded
		});

		await page.getByLabelText('Received By').fill('Jordan');
		const canvasElement = document.querySelector('[data-testid="will-call-signature-canvas"]');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Expected will call signature canvas element.');
		}

		canvasElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 24,
				clientY: 24,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointermove', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointerup', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true
			})
		);
		await page.getByRole('button', { name: 'Upload Signature' }).click();

		expect(upload).toHaveBeenCalled();
		expect(uploadWillCallSignature).toHaveBeenCalled();
		expect(onUploaded).toHaveBeenCalled();
		expect(onClose).toHaveBeenCalled();
		await expect
			.element(page.getByText('Unable to upload the signature right now.'))
			.not.toBeInTheDocument();
	});

	afterEach(() => {
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.toBlob = originalToBlob;
	});
});
