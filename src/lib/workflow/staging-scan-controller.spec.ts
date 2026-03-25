import { describe, expect, it, vi } from 'vitest';
import type { ScanResult } from '$lib/types';
import { createStagingScanController } from './staging-scan-controller';

function createScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
	return {
		scanType: 'single_label',
		status: 'success',
		message: 'Label staged.',
		needsLocation: false,
		dropArea: null,
		...overrides
	};
}

describe('createStagingScanController', () => {
	it('maps a location scan into a drop-area update without refreshing the active list', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'location',
				message: 'Location updated.',
				dropArea: {
					id: 41,
					label: 'W12'
				}
			})
		);
		const refreshActiveList = vi.fn();
		const controller = createStagingScanController({
			processScan,
			refreshActiveList
		});

		await expect(
			controller.submitScan({
				scannedText: '41',
				department: 'Wrap',
				dropAreaId: null
			})
		).resolves.toEqual({
			kind: 'location-updated',
			message: 'Location updated.',
			dropArea: {
				dropAreaId: 41,
				dropAreaLabel: 'W12'
			},
			openLocationModal: false,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(refreshActiveList).not.toHaveBeenCalled();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('refreshes successful pallet scans and clears the active location for Roll', async () => {
		const processScan = vi.fn().mockResolvedValue(
			createScanResult({
				scanType: 'pallet',
				message: 'Pallet staged.'
			})
		);
		const refreshActiveList = vi.fn().mockResolvedValue(undefined);
		const controller = createStagingScanController({
			processScan,
			refreshActiveList
		});

		await expect(
			controller.submitScan({
				scannedText: 'PALLET-1',
				department: 'Roll',
				dropAreaId: 51
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Pallet staged.',
			dropArea: null,
			openLocationModal: false,
			clearCurrentDropArea: true,
			showSuccessToast: true
		});

		expect(refreshActiveList).toHaveBeenCalledOnce();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('stores a pending scan on needs-location and retries it after location selection', async () => {
		const processScan = vi
			.fn()
			.mockResolvedValueOnce(
				createScanResult({
					status: 'needs-location',
					message: 'Location is required before staging.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(createScanResult());
		const refreshActiveList = vi.fn().mockResolvedValue(undefined);
		const controller = createStagingScanController({
			processScan,
			refreshActiveList
		});

		await expect(
			controller.submitScan({
				scannedText: 'LP-100',
				department: 'Parts',
				dropAreaId: null
			})
		).resolves.toEqual({
			kind: 'needs-location',
			message: 'Location is required before staging.',
			dropArea: null,
			openLocationModal: true,
			clearCurrentDropArea: false,
			showSuccessToast: false
		});

		expect(controller.hasPendingScan()).toBe(true);

		await expect(
			controller.retryPendingScan({
				department: 'Parts',
				dropAreaId: 42
			})
		).resolves.toEqual({
			kind: 'success',
			message: 'Label staged.',
			dropArea: null,
			openLocationModal: false,
			clearCurrentDropArea: false,
			showSuccessToast: true
		});

		expect(processScan).toHaveBeenNthCalledWith(2, {
			scannedText: 'LP-100',
			department: 'Parts',
			dropAreaId: 42
		});
		expect(refreshActiveList).toHaveBeenCalledOnce();
		expect(controller.hasPendingScan()).toBe(false);
	});

	it('cancels a pending scan when the location modal is dismissed', async () => {
		const controller = createStagingScanController({
			processScan: vi.fn().mockResolvedValue(
				createScanResult({
					status: 'needs-location',
					needsLocation: true
				})
			),
			refreshActiveList: vi.fn()
		});

		await controller.submitScan({
			scannedText: 'LP-100',
			department: 'Wrap',
			dropAreaId: null
		});

		expect(controller.hasPendingScan()).toBe(true);
		expect(controller.cancelPendingScan()).toBe(true);
		expect(controller.hasPendingScan()).toBe(false);
		await expect(
			controller.retryPendingScan({
				department: 'Wrap',
				dropAreaId: 41
			})
		).resolves.toBeNull();
	});
});
