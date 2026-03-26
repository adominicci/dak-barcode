import { query } from '$app/server';
import {
	dropSheetDateSchema,
	dropSheetIdSchema,
	getDstDropSheetCategoryAvailability,
	getDstDropsheets,
	getDstDropsheetStatus
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
