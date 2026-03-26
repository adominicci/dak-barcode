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
			title: string;
			message: string;
			errorKind: 'business' | 'api';
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

function fallbackLoadingErrorMessage(status: ScanResult['status']) {
	switch (status) {
		case 'invalid-location':
			return 'Location is not valid.';
		case 'does-not-belong':
			return "Label doesn't belong to this drop!";
		case 'no-match':
			return 'Label is not valid!';
		case 'department-blocked':
		case 'incomplete-drop':
			return 'This drop is not completed!';
		case 'api-error':
			return 'The loading scan request failed.';
		default:
			return 'We could not process that scan right now.';
	}
}

function normalizeLoadingError(result: ScanResult): Pick<
	Extract<LoadingScanAction, { kind: 'error' }>,
	'title' | 'message' | 'errorKind'
> {
	const message = result.message.trim() || fallbackLoadingErrorMessage(result.status);

	switch (result.status) {
		case 'invalid-location':
			return {
				title: 'Invalid Location',
				message,
				errorKind: 'business'
			};
		case 'does-not-belong':
			return {
				title: 'Not Found',
				message,
				errorKind: 'business'
			};
		case 'no-match':
			return {
				title: 'No Match',
				message,
				errorKind: 'business'
			};
		case 'department-blocked':
		case 'incomplete-drop':
			return {
				title: 'Not Completed',
				message,
				errorKind: 'business'
			};
		case 'api-error':
			return {
				title: 'API Error',
				message,
				errorKind: 'api'
			};
		default:
			return {
				title: 'Scan Error',
				message,
				errorKind: 'business'
			};
	}
}

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

		const loadingError = normalizeLoadingError(result);

		return {
			kind: 'error',
			title: loadingError.title,
			message: loadingError.message,
			errorKind: loadingError.errorKind,
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
