import { query } from '$app/server';
import { getDstLoaders } from '$lib/server/dst-queries';

export const getLoaders = query(async () => getDstLoaders());
