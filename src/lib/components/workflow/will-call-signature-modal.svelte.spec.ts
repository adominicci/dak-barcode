import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const {
	createSignedUrl,
	upload,
	remove,
	createSupabaseBrowserClient,
	uploadWillCallSignature
} = vi.hoisted(() => ({
	createSignedUrl: vi.fn(),
	upload: vi.fn(),
	remove: vi.fn(),
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
	let canvasRenderingContext: ReturnType<typeof createCanvasRenderingContextMock>;

	beforeEach(() => {
		canvasRenderingContext = createCanvasRenderingContextMock();

		createSignedUrl.mockReset();
		upload.mockReset();
		remove.mockReset();
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
		remove.mockResolvedValue({
			data: [],
			error: null
		});
		createSupabaseBrowserClient.mockReturnValue({
			storage: {
				from: () => ({
					createSignedUrl,
					upload,
					remove
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

		await expect.element(page.getByLabelText('Received By')).toHaveAttribute('readonly');
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

	it('scales pointer coordinates to the canvas resolution before drawing', async () => {
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

		vi.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue({
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			right: 480,
			bottom: 180,
			width: 480,
			height: 180,
			toJSON: () => ({})
		});

		canvasElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 24,
				clientY: 18,
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

		expect(canvasRenderingContext.moveTo).toHaveBeenCalledWith(48, 36);
		expect(canvasRenderingContext.lineTo).toHaveBeenCalledWith(192, 144);
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

	it('blocks upload when Received By is blank after trimming', async () => {
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

		await page.getByLabelText('Received By').fill('   ');
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

		await expect.element(page.getByText('Received By is required.')).toBeInTheDocument();
		expect(upload).not.toHaveBeenCalled();
		expect(uploadWillCallSignature).not.toHaveBeenCalled();
	});

	it('removes the uploaded storage object when DST persistence fails after upload succeeds', async () => {
		uploadWillCallSignature.mockRejectedValueOnce(new Error('DST unavailable'));

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
		expect(remove).toHaveBeenCalledWith(['will-call/42/signature_123.png']);
		await expect.element(page.getByText('DST unavailable')).toBeInTheDocument();
	});

	afterEach(() => {
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.toBlob = originalToBlob;
	});
});

function createCanvasRenderingContextMock() {
	return {
		beginPath: vi.fn(),
		lineCap: 'round',
		lineJoin: 'round',
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		stroke: vi.fn(),
		clearRect: vi.fn(),
		lineWidth: 0,
		strokeStyle: ''
	};
}
