import * as v from 'valibot';
import { command, query } from '$app/server';
import { FRONTEND_TARGETS } from '$lib/types';
import {
	dakDropSheetTrailerUpdateInputSchema,
	getDakEquipmentTrailers,
	updateDakDropSheetTrailer
} from '$lib/server/dak-equipment';

const trailersQueryInputSchema = v.object({
	target: v.picklist(FRONTEND_TARGETS),
	// Scopes the serialized client query identity per target; the server read stays target-driven.
	targetCacheKey: v.pipe(v.string(), v.trim(), v.nonEmpty('Target cache key is required.'))
});

export const getTrailers = query(trailersQueryInputSchema, async ({ target }) =>
	getDakEquipmentTrailers(target)
);

export const updateDropsheetTrailer = command(dakDropSheetTrailerUpdateInputSchema, async (input) =>
	updateDakDropSheetTrailer(input)
);
