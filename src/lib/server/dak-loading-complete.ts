import * as v from 'valibot';
import { fetchDak } from './proxy';

export const DAK_LOADING_COMPLETE_ROUTE = '/v1/logistics/dropsheet-notify' as const;
export const DAK_TRANSFER_LABEL_EXPORT_JOBS_ROUTE =
	'/v1/logistics/dropsheet-transfer-label-export-jobs' as const;
const COMPLETE_LOAD_NOTIFY_TIMEOUT_MS = 20_000;
const TRANSFER_LABEL_EXPORT_JOB_TIMEOUT_MS = 10_000;

const dropSheetIdSchema = v.pipe(
	v.number(),
	v.integer('Expected a whole-number drop sheet id'),
	v.minValue(1, 'Expected a positive drop sheet id')
);

export const loadingCompleteDropSheetInputSchema = v.object({
	dropSheetId: dropSheetIdSchema
});

export const loadingCompleteInputSchema = v.object({
	dropSheetId: dropSheetIdSchema,
	transfer: v.boolean()
});

type LoadingCompleteInput = v.InferOutput<typeof loadingCompleteInputSchema>;
type LoadedNotificationInput = v.InferOutput<typeof loadingCompleteDropSheetInputSchema>;
type PostSendSyncStatus = 'failed';
type TransferLabelExportWarningStatus = 'failed';

export type DakLoadingCompletePostSendSyncFailure = {
	status: PostSendSyncStatus;
	orderNumbers: number[];
	errors: string[];
	retryRecommended: boolean;
};

export type DakLoadingCompleteTransferLabelExportWarning = {
	status: TransferLabelExportWarningStatus;
	message: string;
};

export type DakLoadedNotificationResult = {
	postSendSync: DakLoadingCompletePostSendSyncFailure | null;
};

export type DakLoadingCompleteResult =
	| {
			ok: true;
			partial: false;
	  }
	| {
			ok: true;
			partial: true;
			postSendSync: DakLoadingCompletePostSendSyncFailure;
			transferLabelExport?: DakLoadingCompleteTransferLabelExportWarning;
	  }
	| {
			ok: true;
			partial: true;
			postSendSync?: DakLoadingCompletePostSendSyncFailure;
			transferLabelExport: DakLoadingCompleteTransferLabelExportWarning;
	  };

function jsonInit(payload: unknown, headersInit?: HeadersInit): RequestInit {
	const headers = new Headers(headersInit);
	headers.set('Content-Type', 'application/json');

	return {
		method: 'POST',
		headers,
		body: JSON.stringify(payload)
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumberArray(value: unknown): number[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry));
}

function readStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function readPostSendSyncFailure(value: unknown): DakLoadingCompletePostSendSyncFailure | null {
	if (!isRecord(value) || value.status !== 'failed') {
		return null;
	}

	return {
		status: 'failed',
		orderNumbers: readNumberArray(value.order_numbers),
		errors: readStringArray(value.errors),
		retryRecommended: value.retry_recommended === true
	};
}

async function readJsonPayload(response: Response): Promise<unknown> {
	const contentType = response.headers.get('Content-Type') ?? '';
	if (!contentType.includes('application/json')) {
		return null;
	}

	try {
		return await response.json();
	} catch {
		return null;
	}
}

async function requireOkLoadingNotification(response: Response) {
	if (!response.ok) {
		const details = (await response.text()).trim();
		throw new Error(
			`${response.status} ${response.statusText}${details ? `: ${details}` : ''}`
		);
	}
}

function formatTransferExportEnqueueFailure(response: Response, details: string): string {
	return `Transfer label export enqueue failed: ${response.status} ${response.statusText}${details ? `: ${details}` : ''}`;
}

function formatUnknownTransferExportEnqueueError(error: unknown): string {
	if (error instanceof Error && error.message.trim()) {
		return `Transfer label export enqueue failed: ${error.message}`;
	}

	return 'Transfer label export enqueue failed.';
}

export async function exportDakTransferLabels(
	dropSheetId: number
): Promise<DakLoadingCompleteTransferLabelExportWarning | null> {
	let response: Response;

	try {
		response = await fetchDak(
			DAK_TRANSFER_LABEL_EXPORT_JOBS_ROUTE,
			jsonInit(
				{
					dropsheet_id: dropSheetId,
					mode: 'repair_missing_target'
				},
				{
					'Y-Db': 'AZURE'
				}
			),
			{
				timeoutMs: TRANSFER_LABEL_EXPORT_JOB_TIMEOUT_MS
			}
		);
	} catch (error) {
		return {
			status: 'failed',
			message: formatUnknownTransferExportEnqueueError(error)
		};
	}

	if (!response.ok) {
		const details = (await response.text()).trim();
		return {
			status: 'failed',
			message: formatTransferExportEnqueueFailure(response, details)
		};
	}

	return null;
}

export async function sendDakLoadedNotification(
	dropSheetId: LoadedNotificationInput['dropSheetId']
): Promise<DakLoadedNotificationResult> {
	const response = await fetchDak(
		DAK_LOADING_COMPLETE_ROUTE,
		jsonInit({
			dropsheet_id: dropSheetId,
			type: 'loaded',
			send_email_to: ''
		}),
		{
			timeoutMs: COMPLETE_LOAD_NOTIFY_TIMEOUT_MS
		}
	);

	await requireOkLoadingNotification(response);

	const payload = await readJsonPayload(response);
	const postSendSync =
		isRecord(payload) ? readPostSendSyncFailure(payload.post_send_sync) : null;
	return { postSendSync };
}

export async function completeDakLoadingEmail(
	input: LoadingCompleteInput
): Promise<DakLoadingCompleteResult> {
	const { postSendSync } = await sendDakLoadedNotification(input.dropSheetId);
	const transferLabelExport = input.transfer
		? await exportDakTransferLabels(input.dropSheetId)
		: null;

	if (postSendSync && transferLabelExport) {
		return {
			ok: true,
			partial: true,
			postSendSync,
			transferLabelExport
		};
	}

	if (postSendSync) {
		return {
			ok: true,
			partial: true,
			postSendSync
		};
	}

	if (transferLabelExport) {
		return {
			ok: true,
			partial: true,
			transferLabelExport
		};
	}

	return { ok: true, partial: false };
}
