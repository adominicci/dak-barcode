import * as v from 'valibot';
import { command, query } from '$app/server';
import {
	dropSheetTrailerUpdateInputSchema,
	getDstTrailers,
	updateDstDropSheetTrailer
} from '$lib/server/dst-queries';

const trailersQueryInputSchema = v.object({
	targetCacheKey: v.pipe(v.string(), v.trim(), v.nonEmpty('Target cache key is required.'))
});

export const getTrailers = query(trailersQueryInputSchema, async () => getDstTrailers());

export const updateDropsheetTrailer = command(dropSheetTrailerUpdateInputSchema, async (input) =>
	updateDstDropSheetTrailer(input)
);
