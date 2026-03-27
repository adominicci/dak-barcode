import { command, query } from '$app/server';
import {
	dropSheetDateSchema,
	dropSheetPickedByLoaderUpdateInputSchema,
	dropSheetIdSchema,
	getDstDropSheetCategoryAvailability,
	getDstDropsheets,
	getDstDropsheetStatus,
	updateDstDropSheetPickedByLoader
} from '$lib/server/dst-queries';

export const getDropsheets = query(dropSheetDateSchema, async (dropSheetDate) =>
	getDstDropsheets(dropSheetDate)
);

export const getDropsheetStatus = query(dropSheetIdSchema, async (dropSheetId) =>
	getDstDropsheetStatus(dropSheetId)
);

export const getDropsheetCategoryAvailability = query(dropSheetIdSchema, async (dropSheetId) =>
	getDstDropSheetCategoryAvailability(dropSheetId)
);

export const updateDropsheetPickedByLoader = command(
	dropSheetPickedByLoaderUpdateInputSchema,
	async (input) => updateDstDropSheetPickedByLoader(input)
);
