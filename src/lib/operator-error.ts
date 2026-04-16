const FRAMEWORK_ERROR_MARKERS = ['https://svelte.dev/e/', 'experimental_async_required'];

function isFrameworkErrorMessage(message: string) {
	return FRAMEWORK_ERROR_MARKERS.some((marker) => message.includes(marker));
}

function readErrorMessage(error: unknown): string | null {
	if (error instanceof Error) {
		return error.message.trim();
	}

	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message.trim();
	}

	return null;
}

export function getOperatorErrorMessage(error: unknown, fallback: string): string {
	const message = readErrorMessage(error);

	if (!message) {
		return fallback;
	}

	if (isFrameworkErrorMessage(message)) {
		return fallback;
	}

	return message;
}
