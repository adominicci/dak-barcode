import type { ScanResult, StagingScanRequest } from '$lib/types';
import type { WorkflowDropAreaSelection } from '$lib/workflow/stores';

export type StagingScanAction =
	| {
			kind: 'location-updated';
			message: string;
			dropArea: NonNullable<WorkflowDropAreaSelection>;
			openLocationModal: false;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  }
	| {
			kind: 'success';
			message: string;
			dropArea: null;
			openLocationModal: false;
			clearCurrentDropArea: boolean;
			showSuccessToast: true;
	  }
	| {
			kind: 'needs-location';
			message: string;
			dropArea: null;
			openLocationModal: false;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  }
	| {
			kind: 'error';
			message: string;
			dropArea: null;
			openLocationModal: false;
			clearCurrentDropArea: false;
			showSuccessToast: false;
	  };

type CreateStagingScanControllerOptions = {
	processScan: (input: StagingScanRequest) => Promise<ScanResult>;
	refreshActiveList: () => Promise<unknown>;
};

type ResolveScanOptions = {
	clearPendingOnResult: boolean;
};

export function createStagingScanController({
	processScan,
	refreshActiveList
}: CreateStagingScanControllerOptions) {
	let pendingScan: Pick<StagingScanRequest, 'scannedText'> | null = null;
	let pendingScanVersion = 0;

	function invalidatePendingScan() {
		pendingScan = null;
		pendingScanVersion += 1;
	}

	async function resolveScan(
		input: StagingScanRequest,
		{ clearPendingOnResult }: ResolveScanOptions
	): Promise<StagingScanAction | null> {
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
				openLocationModal: false,
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
				openLocationModal: false,
				clearCurrentDropArea: false,
				showSuccessToast: false
			};
		}

		if (result.status === 'success') {
			if (clearPendingOnResult) {
				invalidatePendingScan();
			}

			await refreshActiveList();
			return {
				kind: 'success',
				message: result.message,
				dropArea: null,
				openLocationModal: false,
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
			openLocationModal: false,
			clearCurrentDropArea: false,
			showSuccessToast: false
		};
	}

	return {
		submitScan(input: StagingScanRequest) {
			return resolveScan(input, { clearPendingOnResult: false });
		},
		async retryPendingScan({
			department,
			dropAreaId
		}: Pick<StagingScanRequest, 'department'> & { dropAreaId: number }) {
			if (!pendingScan) {
				return null;
			}

			return resolveScan({
				scannedText: pendingScan.scannedText,
				department,
				dropAreaId
			}, { clearPendingOnResult: true });
		},
		hasPendingScan() {
			return pendingScan !== null;
		},
		cancelPendingScan() {
			const hadPendingScan = pendingScan !== null;
			invalidatePendingScan();
			return hadPendingScan;
		}
	};
}
