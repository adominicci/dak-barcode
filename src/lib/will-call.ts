export const WILL_CALL_SIGNATURE_BUCKET = 'files';
export const WILL_CALL_SIGNATURE_URL_TTL_SECONDS = 3600;
export const LEGACY_WILL_CALL_DRIVER_ID = 21;

export function buildWillCallSignatureStoragePath(
	dropSheetId: number,
	timestamp: number = Date.now()
): string {
	return `signatures/will-call/${dropSheetId}/signature_${timestamp}.png`;
}

export function isAbsoluteHttpUrl(value: string | null | undefined): value is string {
	if (!value) {
		return false;
	}

	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

export function isLegacyWillCallDriver(driverId: number | null | undefined): boolean {
	return driverId === LEGACY_WILL_CALL_DRIVER_ID;
}
