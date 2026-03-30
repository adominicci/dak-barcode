import {
	createCachedRemoteQuery,
	invalidateLookupCacheByKey,
	getTargetLookupCacheQualifier,
	lookupCacheKey
} from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getLoaders as getLoadersRemote } from '$lib/loaders.remote';

function buildLoadersCacheKey(target: Target | null | undefined) {
	return lookupCacheKey('loaders', getTargetLookupCacheQualifier(target) ?? undefined);
}

export function getLoaders(target: Target | null | undefined = null) {
	return createCachedRemoteQuery(getLoadersRemote(), buildLoadersCacheKey(target));
}

export function invalidateLoadersCache(target: Target | null | undefined = null) {
	invalidateLookupCacheByKey(buildLoadersCacheKey(target));
}
