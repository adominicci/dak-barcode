import type { RemoteQuery } from '@sveltejs/kit';
import type { Target } from '$lib/auth/types';

const LOOKUP_CACHE_PREFIX = 'dak-lookup-cache:v1';

export type LookupCacheScope = 'loaders' | 'trailers' | 'drop-areas';

export type LookupCacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type LookupCacheRecord<T> = {
	signature: string;
	data: T;
	updatedAt: string;
};

type CachedRemoteQueryState<T> = {
	cacheKey: string;
	storage: LookupCacheStorage | null;
	hydratedCacheKey: string | null;
	initialWritePending: boolean;
	initialWriteInitialized: boolean;
	refreshWrapped: boolean;
	originalRefresh: () => Promise<void>;
};

const cachedRemoteQueryStates = new WeakMap<
	RemoteQuery<unknown[]>,
	CachedRemoteQueryState<unknown>
>();

function getDefaultStorage(): LookupCacheStorage | null {
	if (typeof localStorage === 'undefined') {
		return null;
	}

	return localStorage;
}

export function lookupCacheKey(scope: LookupCacheScope, qualifier?: string): string {
	return qualifier ? `${LOOKUP_CACHE_PREFIX}:${scope}:${qualifier}` : `${LOOKUP_CACHE_PREFIX}:${scope}`;
}

export function getTargetLookupCacheQualifier(target: Target | null | undefined): string | null {
	const normalizedTarget = target?.trim();

	return normalizedTarget ? normalizedTarget.toLowerCase() : null;
}

export function stableStringify(value: unknown): string {
	if (value === undefined) {
		return 'undefined';
	}

	if (value === null || typeof value !== 'object') {
		const serialized = JSON.stringify(value);
		return serialized ?? String(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map((item) => stableStringify(item)).join(',')}]`;
	}

	const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
		left.localeCompare(right)
	);

	return `{${entries
		.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
		.join(',')}}`;
}

export function readLookupCache<T>(
	storage: LookupCacheStorage | null,
	key: string
): LookupCacheRecord<T> | null {
	if (!storage) {
		return null;
	}

	const rawValue = storage.getItem(key);
	if (!rawValue) {
		return null;
	}

	try {
		const parsed = JSON.parse(rawValue) as LookupCacheRecord<T>;
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			typeof parsed.signature !== 'string' ||
			!('data' in parsed) ||
			typeof parsed.updatedAt !== 'string'
		) {
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

export function writeLookupCache<T>(
	storage: LookupCacheStorage | null,
	key: string,
	data: T
): LookupCacheRecord<T> | null {
	if (!storage) {
		return null;
	}

	const record: LookupCacheRecord<T> = {
		signature: stableStringify(data),
		data,
		updatedAt: new Date().toISOString()
	};

	storage.setItem(key, JSON.stringify(record));
	return record;
}

export function invalidateLookupCache(storage: LookupCacheStorage | null, key: string): void {
	storage?.removeItem(key);
}

export function invalidateLookupCacheByKey(key: string): void {
	invalidateLookupCache(getDefaultStorage(), key);
}

export function createCachedRemoteQuery<T>(
	query: RemoteQuery<T[]>,
	cacheKey: string,
	storage: LookupCacheStorage | null = getDefaultStorage()
): RemoteQuery<T[]> {
	const cachedRecord = readLookupCache<T[]>(storage, cacheKey);
	let queryState = cachedRemoteQueryStates.get(query as RemoteQuery<unknown[]>) as
		| CachedRemoteQueryState<T>
		| undefined;

	if (!queryState) {
		queryState = {
			cacheKey,
			storage,
			hydratedCacheKey: null,
			initialWritePending: storage !== null && !cachedRecord,
			initialWriteInitialized: false,
			refreshWrapped: false,
			originalRefresh: query.refresh.bind(query)
		};
		cachedRemoteQueryStates.set(
			query as RemoteQuery<unknown[]>,
			queryState as CachedRemoteQueryState<unknown>
		);
	} else {
		queryState.cacheKey = cacheKey;
		queryState.storage = storage;
		queryState.initialWritePending = storage !== null && !cachedRecord;
	}

	if (cachedRecord && queryState.hydratedCacheKey !== cacheKey) {
		queryState.hydratedCacheKey = cacheKey;
		queueMicrotask(() => {
			query.set(cachedRecord.data);
		});
	}

	if (!queryState.initialWriteInitialized && storage && !cachedRecord && typeof query.then === 'function') {
		queryState.initialWriteInitialized = true;
		void query
			.then((current) => {
				if (queryState.initialWritePending) {
					queryState.initialWritePending = false;
					writeLookupCache(queryState.storage, queryState.cacheKey, current);
				}

				return current;
			})
			.catch(() => {});
	}

	if (!queryState.refreshWrapped) {
		queryState.refreshWrapped = true;
		query.refresh = async () => {
			queryState.initialWritePending = false;
			const previousValue = query.ready ? query.current : undefined;
			const previousSignature = previousValue === undefined ? null : stableStringify(previousValue);

			await queryState.originalRefresh();

			if (!queryState.storage || !query.ready) {
				return;
			}

			const nextValue = query.current;
			const nextSignature = stableStringify(nextValue);

			if (previousValue !== undefined && previousSignature === nextSignature) {
				query.set(previousValue);
				return;
			}

			writeLookupCache(queryState.storage, queryState.cacheKey, nextValue);
		};
	}

	return query;
}
