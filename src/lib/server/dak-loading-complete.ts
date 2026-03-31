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

function jsonInit(payload: unknown): RequestInit {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	};
}

export async function completeDakLoadingEmail(
	input: LoadingCompleteInput
): Promise<{ ok: true }> {
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

	return { ok: true };
}
