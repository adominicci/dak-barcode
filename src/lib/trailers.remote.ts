import { command, query } from '$app/server';
import {
	dropSheetTrailerUpdateInputSchema,
	getDstTrailers,
	updateDstDropSheetTrailer
} from '$lib/server/dst-queries';

export const getTrailers = query(async () => getDstTrailers());

export const updateDropsheetTrailer = command(dropSheetTrailerUpdateInputSchema, async (input) =>
	updateDstDropSheetTrailer(input)
);

