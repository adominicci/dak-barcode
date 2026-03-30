import {
	createCachedRemoteQuery,
	invalidateLookupCacheByKey,
	lookupCacheKey
} from '$lib/browser-cache';
import { getLoaders as getLoadersRemote } from '$lib/loaders.remote';

const LOADERS_CACHE_KEY = lookupCacheKey('loaders');

export function getLoaders() {
	return createCachedRemoteQuery(getLoadersRemote(), LOADERS_CACHE_KEY);
}

export function invalidateLoadersCache() {
	invalidateLookupCacheByKey(LOADERS_CACHE_KEY);
}
