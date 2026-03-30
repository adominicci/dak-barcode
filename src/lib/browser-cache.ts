import type { RemoteQuery } from '@sveltejs/kit';

const LOOKUP_CACHE_PREFIX = 'dak-lookup-cache:v1';

export type LookupCacheScope = 'loaders' | 'trailers' | 'drop-areas';

export type LookupCacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type LookupCacheRecord<T> = {
	signature: string;
	data: T;
	updatedAt: string;
};

function getDefaultStorage(): LookupCacheStorage | null {
	if (typeof localStorage === 'undefined') {
		return null;
	}

	return localStorage;
}

export function lookupCacheKey(scope: LookupCacheScope, qualifier?: string): string {
	return qualifier ? `${LOOKUP_CACHE_PREFIX}:${scope}:${qualifier}` : `${LOOKUP_CACHE_PREFIX}:${scope}`;
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
	if (cachedRecord) {
		query.set(cachedRecord.data);
	}

	if (storage && !cachedRecord) {
		if (query.ready) {
			writeLookupCache(storage, cacheKey, query.current);
		} else {
			void query
				.then((current) => {
					writeLookupCache(storage, cacheKey, current);
					return current;
				})
				.catch(() => {});
		}
	}

	const originalRefresh = query.refresh.bind(query);

	query.refresh = async () => {
		const previousValue = query.ready ? query.current : undefined;
		const previousSignature = previousValue === undefined ? null : stableStringify(previousValue);

		await originalRefresh();

		if (!storage || !query.ready) {
			return;
		}

		const nextValue = query.current;
		const nextSignature = stableStringify(nextValue);

		if (previousValue !== undefined && previousSignature === nextSignature) {
			query.set(previousValue);
			return;
		}

		writeLookupCache(storage, cacheKey, nextValue);
	};

	return query;
}
