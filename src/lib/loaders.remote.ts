import { command, query } from '$app/server';
import {
	getDstLoaders,
	insertDstLoader,
	loaderNameSchema,
	loaderUpdateInputSchema,
	updateDstLoader
} from '$lib/server/dst-queries';

export const getLoaders = query(async () => getDstLoaders());

export const createLoader = command(loaderNameSchema, async (loaderName) =>
	insertDstLoader(loaderName)
);

export const updateLoader = command(loaderUpdateInputSchema, async (input) => updateDstLoader(input));
