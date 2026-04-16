const FRAMEWORK_ERROR_MARKERS = ['https://svelte.dev/e/', 'experimental_async_required'];

function isFrameworkErrorMessage(message: string) {
	return FRAMEWORK_ERROR_MARKERS.some((marker) => message.includes(marker));
}

export function getOperatorErrorMessage(error: unknown, fallback: string): string {
	if (!(error instanceof Error)) {
		return fallback;
	}

	const message = error.message.trim();

	if (!message || isFrameworkErrorMessage(message)) {
		return fallback;
	}

	return message;
}
