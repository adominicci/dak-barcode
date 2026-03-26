import type { LoadingScanRequest, ScanResult } from '$lib/types';
import type { WorkflowDropAreaSelection } from '$lib/workflow/stores';

export type LoadingScanAction =
	| {
			kind: 'location-updated';
			message: string;
			dropArea: NonNullable<WorkflowDropAreaSelection>;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  }
	| {
			kind: 'success';
			message: string;
			dropArea: null;
			clearCurrentDropArea: boolean;
			showSuccessToast: true;
	  }
	| {
			kind: 'needs-location';
			message: string;
			dropArea: null;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  }
	| {
			kind: 'error';
			message: string;
			dropArea: null;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  };

type CreateLoadingScanControllerOptions = {
	processScan: (input: LoadingScanRequest) => Promise<ScanResult>;
	refreshActiveDropData: () => Promise<unknown>;
};

type ResolveScanOptions = {
	clearPendingOnResult: boolean;
};

export function createLoadingScanController({
	processScan,
	refreshActiveDropData
}: CreateLoadingScanControllerOptions) {
	let pendingScan: Pick<LoadingScanRequest, 'scannedText'> | null = null;
	let pendingScanVersion = 0;

	function invalidatePendingScan() {
		pendingScan = null;
		pendingScanVersion += 1;
	}

	async function resolveScan(
		input: LoadingScanRequest,
		{ clearPendingOnResult }: ResolveScanOptions
	): Promise<LoadingScanAction | null> {
		const requestVersion = pendingScanVersion;
		const result = await processScan(input);

		if (requestVersion !== pendingScanVersion) {
			return null;
		}

		if (result.needsLocation || result.status === 'needs-location') {
			pendingScan = { scannedText: input.scannedText };
			return {
				kind: 'needs-location',
				message: result.message,
				dropArea: null,
				clearCurrentDropArea: false,
				showSuccessToast: false
			};
		}

		if (result.status === 'success' && result.scanType === 'location' && result.dropArea) {
			return {
				kind: 'location-updated',
				message: result.message,
				dropArea: {
					dropAreaId: result.dropArea.id,
					dropAreaLabel: result.dropArea.label
				},
				clearCurrentDropArea: false,
				showSuccessToast: false
			};
		}

		if (result.status === 'success') {
			if (clearPendingOnResult || (pendingScan !== null && result.scanType !== 'location')) {
				invalidatePendingScan();
			}

			try {
				await refreshActiveDropData();
			} catch {
				// Successful scans must stay successful even if the follow-up refresh fails.
			}

			return {
				kind: 'success',
				message: result.message,
				dropArea: null,
				clearCurrentDropArea: input.department === 'Roll' && result.scanType !== 'location',
				showSuccessToast: true
			};
		}

		if (clearPendingOnResult) {
			invalidatePendingScan();
		}

		return {
			kind: 'error',
			message: result.message,
			dropArea: null,
			clearCurrentDropArea: false,
			showSuccessToast: false
		};
	}

	return {
		submitScan(input: LoadingScanRequest) {
			return resolveScan(input, { clearPendingOnResult: false });
		},
		async retryPendingScan(
			input: Omit<LoadingScanRequest, 'scannedText'>
		) {
			if (!pendingScan) {
				return null;
			}

			return resolveScan(
				{
					scannedText: pendingScan.scannedText,
					...input
				},
				{ clearPendingOnResult: true }
			);
		},
		hasPendingScan() {
			return pendingScan !== null;
		},
		cancelPendingScan() {
			const hadPendingScan = pendingScan !== null;
			if (hadPendingScan) {
				invalidatePendingScan();
			}
			return hadPendingScan;
		}
	};
}
