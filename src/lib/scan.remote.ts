import { command } from '$app/server';
import {
	loadingScanInputSchema,
	processDakLoadingScan,
	processDakStagingScan,
	stagingScanInputSchema
} from '$lib/server/dak-scan';

export const processStagingScan = command(stagingScanInputSchema, async (input) =>
	processDakStagingScan(input)
);

export const processLoadingScan = command(loadingScanInputSchema, async (input) =>
	processDakLoadingScan(input)
);
