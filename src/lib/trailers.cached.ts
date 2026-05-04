import { getTargetLookupCacheQualifier } from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getTrailers as getTrailersRemote } from '$lib/trailers.remote';

export function getTrailers(target: Target | null | undefined = null) {
	if (!target) {
		throw new Error('Trailer lookup requires an active target.');
	}

	const resolvedTarget = target;
	return getTrailersRemote({
		target: resolvedTarget,
		targetCacheKey: getTargetLookupCacheQualifier(resolvedTarget) ?? 'default'
	});
}
