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
	return fetchDak.mock.calls.at(-1) as [
		string,
		RequestInit | undefined,
		{ timeoutMs?: number } | undefined
	];
}

function getFetchCallAt(index: number) {
	return fetchDak.mock.calls.at(index) as [
		string,
		RequestInit | undefined,
		{ timeoutMs?: number } | undefined
	];
}

beforeEach(() => {
	vi.resetModules();
	fetchDak.mockReset();
});

describe('dak loading complete helpers', () => {
	it('validates the dropsheet id and transfer flag input used by the completion command', async () => {
		const { loadingCompleteInputSchema } = await import('./dak-loading-complete');

		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 42, transfer: false }).success).toBe(true);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 42 }).success).toBe(false);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 42, transfer: 'true' }).success).toBe(false);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: 0, transfer: false }).success).toBe(false);
		expect(v.safeParse(loadingCompleteInputSchema, { dropSheetId: '42', transfer: false }).success).toBe(false);
	});

	it('posts only the loaded notification when the dropsheet is not a transfer', async () => {
		fetchDak.mockResolvedValue(jsonResponse({ ok: true }));

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: false })).resolves.toEqual({
			ok: true,
			partial: false
		});

		expect(fetchDak).toHaveBeenCalledOnce();
		const [path, init, options] = getFetchCall();
		const headers = new Headers(init?.headers);

		expect(path).toBe('/v1/logistics/dropsheet-notify');
		expect(init?.method).toBe('POST');
		expect(options).toEqual({ timeoutMs: 20_000 });
		expect(headers.get('Content-Type')).toBe('application/json');
		expect(JSON.parse(String(init?.body))).toEqual({
			dropsheet_id: 42,
			type: 'loaded',
			send_email_to: ''
		});
	});

	it('posts the transfer label export after the loaded notification for transfer dropsheets', async () => {
		fetchDak.mockResolvedValueOnce(jsonResponse({ ok: true }));
		fetchDak.mockResolvedValueOnce(jsonResponse({
			orders_considered: 2,
			orders_exported: 2,
			orders_skipped: 0,
			packages_exported: 8,
			details_exported: 8,
			results: []
		}));

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: true })).resolves.toEqual({
			ok: true,
			partial: false
		});

		expect(fetchDak).toHaveBeenCalledTimes(2);
		const [notifyPath, , notifyOptions] = getFetchCallAt(0);
		const [exportPath, exportInit, exportOptions] = getFetchCallAt(1);
		const exportHeaders = new Headers(exportInit?.headers);

		expect(notifyPath).toBe('/v1/logistics/dropsheet-notify');
		expect(notifyOptions).toEqual({ timeoutMs: 20_000 });
		expect(exportPath).toBe('/v1/logistics/dropsheet-transfer-label-export');
		expect(exportInit?.method).toBe('POST');
		expect(exportOptions).toEqual({ timeoutMs: 35_000 });
		expect(exportHeaders.get('Content-Type')).toBe('application/json');
		expect(exportHeaders.get('Y-Db')).toBe('AZURE');
		expect(exportHeaders.get('X-Db')).toBeNull();
		expect(JSON.parse(String(exportInit?.body))).toEqual({
			dropsheet_id: 42,
			mode: 'repair_missing_target'
		});
	});

	it('returns a partial-success result when notifications were sent but post-send sync failed', async () => {
		fetchDak.mockResolvedValue(
			jsonResponse({
				success: true,
				notification_type: 'loaded',
				post_send_sync: {
					status: 'failed',
					order_numbers: [41012026, 41012027],
					errors: ['spUpdateOrderBackToInvoiced failed'],
					retry_recommended: false
				}
			})
		);

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: false })).resolves.toEqual({
			ok: true,
			partial: true,
			postSendSync: {
				status: 'failed',
				orderNumbers: [41012026, 41012027],
				errors: ['spUpdateOrderBackToInvoiced failed'],
				retryRecommended: false
			}
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

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: true })).rejects.toThrow(
			'502 Bad Gateway: email dispatch failed'
		);
		expect(fetchDak).toHaveBeenCalledOnce();
	});

	it('returns partial success when transfer label export fails after notification succeeds', async () => {
		fetchDak.mockResolvedValueOnce(jsonResponse({ ok: true }));
		fetchDak.mockResolvedValueOnce(
			new Response('label export failed', {
				status: 502,
				statusText: 'Bad Gateway'
			})
		);

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: true })).resolves.toEqual({
			ok: true,
			partial: true,
			transferLabelExport: {
				status: 'failed',
				message: 'Transfer label export failed: 502 Bad Gateway: label export failed'
			}
		});
		expect(fetchDak).toHaveBeenCalledTimes(2);
	});

	it('returns partial success when transfer label export skips rows with missing source packages', async () => {
		fetchDak.mockResolvedValueOnce(jsonResponse({ ok: true }));
		fetchDak.mockResolvedValueOnce(
			jsonResponse({
				orders_considered: 1,
				orders_exported: 0,
				orders_skipped: 1,
				packages_exported: 0,
				details_exported: 0,
				results: [
					{
						order_number: 41012026,
						status: 'skipped',
						reason: 'source_packages_missing'
					}
				]
			})
		);

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: true })).resolves.toEqual({
			ok: true,
			partial: true,
			transferLabelExport: {
				status: 'source_packages_missing',
				message: 'Transfer label export skipped 1 order because source packages are missing.'
			}
		});
	});

	it('returns partial success when transfer label export reports skipped rows for an unhandled reason', async () => {
		fetchDak.mockResolvedValueOnce(jsonResponse({ ok: true }));
		fetchDak.mockResolvedValueOnce(
			jsonResponse({
				orders_considered: 2,
				orders_exported: 1,
				orders_skipped: 1,
				packages_exported: 4,
				details_exported: 4,
				results: [
					{
						order_number: 41012027,
						status: 'skipped',
						reason: 'quota_exceeded'
					}
				]
			})
		);

		const { completeDakLoadingEmail } = await import('./dak-loading-complete');

		await expect(completeDakLoadingEmail({ dropSheetId: 42, transfer: true })).resolves.toEqual({
			ok: true,
			partial: true,
			transferLabelExport: {
				status: 'orders_skipped',
				message: 'Transfer label export skipped 1 order.'
			}
		});
	});
});
