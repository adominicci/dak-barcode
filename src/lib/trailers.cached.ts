import { createCachedRemoteQuery, getTargetLookupCacheQualifier, lookupCacheKey } from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getTrailers as getTrailersRemote } from '$lib/trailers.remote';

function buildTrailersCacheKey(target: Target | null | undefined) {
	return lookupCacheKey('trailers', getTargetLookupCacheQualifier(target) ?? undefined);
}

export function getTrailers(target: Target | null | undefined = null) {
	return createCachedRemoteQuery(getTrailersRemote(), buildTrailersCacheKey(target));
}
