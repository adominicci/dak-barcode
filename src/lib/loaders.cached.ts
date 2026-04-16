import { getTargetLookupCacheQualifier } from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getLoaders as getLoadersRemote } from '$lib/loaders.remote';

export function getLoaders(target: Target | null | undefined = null) {
	return getLoadersRemote({ targetCacheKey: getTargetLookupCacheQualifier(target) ?? 'default' });
}

export function invalidateLoadersCache(_target: Target | null | undefined = null) {
	return;
}
