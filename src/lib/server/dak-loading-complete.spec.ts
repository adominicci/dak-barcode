import * as v from 'valibot';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchDak = vi.fn();

vi.mock('./proxy', () => ({
	fetchDak
}));

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json'
		},
		...init
	});
}

function getFetchCall() {
	return fetchDak.mock.calls.at(-1) as [string, RequestInit | undefined];
}

beforeEach(() => {
	vi.resetModules();
	fetchDak.mockReset();
});

describe('dak loading complete helpers', () => {
	it('validates the dropsheet id input used by the completion command', async () => {
		const { loadingCompleteInputSchema } = await import('./dak-loading-complete');

		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 42 }).success).toBe(true);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 0 }).success).toBe(false);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: '42' }).success).toBe(false);
	});

	it('posts the legacy loading-complete payload through dak-web and returns an ok result', async () => {
		fetchDak.mockResolvedValue(jsonResponse({ ok: true }));

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42 })).resolves.toEqual({ ok: true });

		const [path, init] = getFetchCall();
		const headers = new Headers(init?.headers);

		expect(path).toBe('/v1/logistics/dropsheet-notify');
		expect(init?.method).toBe('POST');
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(JSON.parse(String(init?.body))).toEqual({
			dropsheet_id: 42,
			type: 'loaded',
			send_email_to: ''
		});
	});

	it('surfaces the status code, status text, and upstream details when the completion call fails', async () => {
		fetchDak.mockResolvedValue(
			new Response('email dispatch failed', {
				status: 502,
				statusText: 'Bad Gateway'
			})
		);

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42 })).rejects.toThrow(
			'502 Bad Gateway: email dispatch failed'
		);
	});
});
