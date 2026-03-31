import { command } from '$app/server';
import { completeDakLoadingEmail, loadingCompleteInputSchema } from '$lib/server/dak-loading-complete';

export const completeLoadingEmail = command(loadingCompleteInputSchema, async (input) =>
	completeDakLoadingEmail(input)
);
