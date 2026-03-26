import { describe, expect, it, vi } from 'vitest';
import type { ScanResult } from '$lib/types';
import { createLoadingScanController } from './loading-scan-controller';

function createScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
	return {
		scanType: 'single_label',
		status: 'success',
		message: 'Label loaded.',
		needsLocation: false,
		needPick: null,
		dropArea: null,
		...overrides
	};
}

describe('createLoadingScanController', () => {
	it('maps a location scan into a drop-area update without refreshing the active drop data', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'location',
				message: 'Location updated.',
				dropArea: {
					id: 41,
					label: 'D12'
				}
			})
		);
		const refreshActiveDropData = vi.fn();
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: '41',
				department: 'Wrap',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'location-updated',
			message: 'Location updated.',
			dropArea: {
				dropAreaId: 41,
				dropAreaLabel: 'D12'
			},
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(refreshActiveDropData).not.toHaveBeenCalled();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('treats failed location scans as errors even when the backend echoes a drop area', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'location',
				status: 'invalid-location',
				message: 'Location is not valid.',
				dropArea: {
					id: 41,
					label: 'D12'
				}
			})
		);
		const refreshActiveDropData = vi.fn();
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: '41',
				department: 'Wrap',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'error',
			title: 'Invalid Location',
			message: 'Location is not valid.',
			errorKind: 'business',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(refreshActiveDropData).not.toHaveBeenCalled();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('maps does-not-belong scans into a not-found loading error with the legacy meaning', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				status: 'does-not-belong',
				message: "Label doesn't belong to this drop!"
			})
		);
		const refreshActiveDropData = vi.fn();
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-404',
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'error',
			title: 'Not Found',
			message: "Label doesn't belong to this drop!",
			errorKind: 'business',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(refreshActiveDropData).not.toHaveBeenCalled();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('maps api-error scans into a diagnosable loading error', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				status: 'api-error',
				message: '500: dak-web unavailable'
			})
		);
		const refreshActiveDropData = vi.fn();
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-500',
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'error',
			title: 'API Error',
			message: '500: dak-web unavailable',
			errorKind: 'api',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(refreshActiveDropData).not.toHaveBeenCalled();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('refreshes successful pallet scans and clears the active location for Roll', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'pallet',
				message: 'Pallet loaded.'
			})
		);
		const refreshActiveDropData = vi.fn().mockResolvedValue(undefined);
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'PALLET-1',
				department: 'Roll',
				dropAreaId: 51,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Pallet loaded.',
			dropArea: null,
			clearCurrentDropArea: true,
			showSuccessToast: true
		});

		expect(refreshActiveDropData).toHaveBeenCalledOnce();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('returns success even when refreshing the active drop data fails after a successful scan', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'single_label',
				message: 'Label loaded.'
			})
		);
		const refreshActiveDropData = vi.fn().mockRejectedValue(new Error('Refresh failed.'));
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-200',
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Label loaded.',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: true
		});

		expect(refreshActiveDropData).toHaveBeenCalledOnce();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('stores a pending scan on needs-location without opening the future modal flow', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				status: 'needs-location',
				message: 'Scan a driver location next.',
				needsLocation: true
			})
		);
		const refreshActiveDropData = vi.fn().mockResolvedValue(undefined);
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-100',
				department: 'Parts',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'needs-location',
			message: 'Scan a driver location next.',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(controller.hasPendingScan()).toBe(true);
		expect(refreshActiveDropData).not.toHaveBeenCalled();
	});

	it('keeps a pending scan until a numeric location scan succeeds, then retries the original scan', async () => {
		const processScan = vi
			.fn()
			.mockResolvedValueOnce(
				createScanResult({
					status: 'needs-location',
					message: 'Scan a driver location next.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(
				createScanResult({
					scanType: 'location',
					message: 'Location updated.',
					dropArea: {
						id: 42,
						label: 'D13'
					}
				})
			)
			.mockResolvedValueOnce(createScanResult());
		const refreshActiveDropData = vi.fn().mockResolvedValue(undefined);
		const controller = createLoadingScanController({
			processScan,
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-100',
				department: 'Parts',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toMatchObject({
			kind: 'needs-location'
		});

		await expect(
			controller.submitScan({
				scannedText: '42',
				department: 'Parts',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'location-updated',
			message: 'Location updated.',
			dropArea: {
				dropAreaId: 42,
				dropAreaLabel: 'D13'
			},
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(controller.hasPendingScan()).toBe(true);

		await expect(
			controller.retryPendingScan({
				department: 'Parts',
				dropAreaId: 42,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Label loaded.',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: true
		});

		expect(processScan).toHaveBeenNthCalledWith(3, {
			scannedText: 'LP-100',
			department: 'Parts',
			dropAreaId: 42,
			loadNumber: 'L-100',
			loaderName: 'Alex'
		});
		expect(refreshActiveDropData).toHaveBeenCalledOnce();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('cancels a pending scan when the active drop changes', async () => {
		const controller = createLoadingScanController({
			processScan: vi.fn().mockResolvedValue(
				createScanResult({
					status: 'needs-location',
					needsLocation: true
				})
			),
			refreshActiveDropData: vi.fn()
		});

		await controller.submitScan({
			scannedText: 'LP-100',
			department: 'Wrap',
			dropAreaId: null,
			loadNumber: 'L-100',
			loaderName: 'Alex'
		});

		expect(controller.hasPendingScan()).toBe(true);
		expect(controller.cancelPendingScan()).toBe(true);
		expect(controller.hasPendingScan()).toBe(false);
		await expect(
			controller.retryPendingScan({
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
			loaderName: 'Alex'
		})
		).resolves.toBeNull();
	});

	it('does not invalidate an in-flight scan when cancelPendingScan is called without a pending retry', async () => {
		let resolveScan: ((result: ScanResult) => void) | null = null;
		const refreshActiveDropData = vi.fn().mockResolvedValue(undefined);
		const controller = createLoadingScanController({
			processScan: vi.fn(
				() =>
					new Promise<ScanResult>((resolve) => {
						resolveScan = resolve;
					})
			),
			refreshActiveDropData
		});

		const submission = controller.submitScan({
			scannedText: 'LP-300',
			department: 'Wrap',
			dropAreaId: 41,
			loadNumber: 'L-100',
			loaderName: 'Alex'
		});

		expect(controller.cancelPendingScan()).toBe(false);

		const scanResolver = resolveScan as ((result: ScanResult) => void) | null;
		if (!scanResolver) {
			throw new Error('Expected scan resolver to be captured.');
		}

		scanResolver(createScanResult());

		await expect(submission).resolves.toEqual({
			kind: 'success',
			message: 'Label loaded.',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: true
		});
		expect(refreshActiveDropData).toHaveBeenCalledOnce();
	});

	it('clears a stale pending scan when a different non-location scan succeeds before retrying', async () => {
		const refreshActiveDropData = vi.fn().mockResolvedValue(undefined);
		const controller = createLoadingScanController({
			processScan: vi
				.fn()
				.mockResolvedValueOnce(
					createScanResult({
						status: 'needs-location',
						message: 'Scan a driver location next.',
						needsLocation: true
					})
				)
				.mockResolvedValueOnce(
					createScanResult({
						scanType: 'single_label',
						message: 'Label loaded.'
					})
				),
			refreshActiveDropData
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: null,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toMatchObject({
			kind: 'needs-location'
		});
		expect(controller.hasPendingScan()).toBe(true);

		await expect(
			controller.submitScan({
				scannedText: 'LP-200',
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Label loaded.',
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: true
		});

		expect(controller.hasPendingScan()).toBe(false);
		await expect(
			controller.retryPendingScan({
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-100',
				loaderName: 'Alex'
			})
		).resolves.toBeNull();
	});
});
