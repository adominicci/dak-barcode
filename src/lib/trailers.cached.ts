import { createCachedRemoteQuery, lookupCacheKey } from '$lib/browser-cache';
import { getTrailers as getTrailersRemote } from '$lib/trailers.remote';

const TRAILERS_CACHE_KEY = lookupCacheKey('trailers');

export function getTrailers() {
	return createCachedRemoteQuery(getTrailersRemote(), TRAILERS_CACHE_KEY);
}
