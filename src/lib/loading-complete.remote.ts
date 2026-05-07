import { command } from '$app/server';
import {
	completeDakLoadingEmail,
	exportDakTransferLabels,
	loadingCompleteDropSheetInputSchema,
	loadingCompleteInputSchema,
	sendDakLoadedNotification
} from '$lib/server/dak-loading-complete';

export const completeLoadingEmail = command(loadingCompleteInputSchema, async (input) =>
	completeDakLoadingEmail(input)
);

export const sendLoadedNotification = command(loadingCompleteDropSheetInputSchema, async (input) =>
	sendDakLoadedNotification(input.dropSheetId)
);

export const exportTransferLabels = command(loadingCompleteDropSheetInputSchema, async (input) =>
	exportDakTransferLabels(input.dropSheetId)
);
