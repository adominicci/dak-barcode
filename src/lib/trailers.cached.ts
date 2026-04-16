import { getTargetLookupCacheQualifier } from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getTrailers as getTrailersRemote } from '$lib/trailers.remote';

export function getTrailers(target: Target | null | undefined = null) {
	return getTrailersRemote({ targetCacheKey: getTargetLookupCacheQualifier(target) ?? 'default' });
}
