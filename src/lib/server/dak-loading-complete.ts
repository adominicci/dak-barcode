import * as v from 'valibot';
import { fetchDak } from './proxy';

export const DAK_LOADING_COMPLETE_ROUTE = '/v1/logistics/dropsheet-notify' as const;

export const loadingCompleteInputSchema = v.object({
	dropSheetId: v.pipe(
		v.number(),
		v.integer('Expected a whole-number drop sheet id'),
		v.minValue(1, 'Expected a positive drop sheet id')
	)
});

type LoadingCompleteInput = v.InferOutput<typeof loadingCompleteInputSchema>;
type PostSendSyncStatus = 'failed';

export type DakLoadingCompletePostSendSyncFailure = {
	status: PostSendSyncStatus;
	orderNumbers: number[];
	errors: string[];
	retryRecommended: boolean;
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
	  };

function jsonInit(payload: unknown): RequestInit {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
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

export async function completeDakLoadingEmail(
	input: LoadingCompleteInput
): Promise<DakLoadingCompleteResult> {
	const response = await fetchDak(
		DAK_LOADING_COMPLETE_ROUTE,
		jsonInit({
			dropsheet_id: input.dropSheetId,
			type: 'loaded',
			send_email_to: ''
		})
	);

	if (!response.ok) {
		const details = (await response.text()).trim();
		throw new Error(
			`${response.status} ${response.statusText}${details ? `: ${details}` : ''}`
		);
	}

	let payload: unknown = null;
	const contentType = response.headers.get('Content-Type') ?? '';

	if (contentType.includes('application/json')) {
		try {
			payload = await response.json();
		} catch {
			payload = null;
		}
	}

	const postSendSync =
		isRecord(payload) ? readPostSendSyncFailure(payload.post_send_sync) : null;

	if (postSendSync) {
		return {
			ok: true,
			partial: true,
			postSendSync
		};
	}

	return { ok: true, partial: false };
}
