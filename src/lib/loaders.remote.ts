import { command, query } from '$app/server';
import { insertDstLoader, loaderNameSchema, getDstLoaders } from '$lib/server/dst-queries';

export const getLoaders = query(async () => getDstLoaders());

export const createLoader = command(loaderNameSchema, async (loaderName) =>
	insertDstLoader(loaderName)
);
