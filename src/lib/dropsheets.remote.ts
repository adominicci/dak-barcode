import { query } from '$app/server';
import {
	dropSheetDateSchema,
	dropSheetIdSchema,
	getDstDropsheets,
	getDstDropsheetStatus
} from '$lib/server/dst-queries';

export const getDropsheets = query(dropSheetDateSchema, async (dropSheetDate) =>
	getDstDropsheets(dropSheetDate)
);

export const getDropsheetStatus = query(dropSheetIdSchema, async (dropSheetId) =>
	getDstDropsheetStatus(dropSheetId)
);
