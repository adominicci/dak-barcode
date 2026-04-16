import * as v from 'valibot';
import { command, query } from '$app/server';
import {
	getDstLoaders,
	insertDstLoader,
	loaderNameSchema,
	loaderUpdateInputSchema,
	updateDstLoader
} from '$lib/server/dst-queries';

const loadersQueryInputSchema = v.object({
	targetCacheKey: v.pipe(v.string(), v.trim(), v.nonEmpty('Target cache key is required.'))
});

export const getLoaders = query(loadersQueryInputSchema, async () => getDstLoaders());

export const createLoader = command(loaderNameSchema, async (loaderName) =>
	insertDstLoader(loaderName)
);

export const updateLoader = command(loaderUpdateInputSchema, async (input) => updateDstLoader(input));
