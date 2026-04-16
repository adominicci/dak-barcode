import { describe, expect, it, vi } from 'vitest';
import type { RemoteQuery } from '@sveltejs/kit';
import {
	createCachedRemoteQuery,
	getTargetLookupCacheQualifier,
	invalidateLookupCache,
	lookupCacheKey
} from './browser-cache';

function createMemoryStorage(initial: Record<string, string> = {}) {
	const store = new Map(Object.entries(initial));

	return {
		getItem: vi.fn((key: string) => store.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store.set(key, value);
		}),
		removeItem: vi.fn((key: string) => {
			store.delete(key);
		})
	};
}

function createRemoteQuery<T>(current: T, nextCurrent: T): RemoteQuery<T> {
	let value = current;
	let ready = true;
	const set = vi.fn((next: T) => {
		value = next;
	});
	const refresh = vi.fn(async () => {
		value = nextCurrent;
		ready = true;
	});

	const then = (onfulfilled?: (value: T) => unknown, onrejected?: (reason: unknown) => unknown) =>
		Promise.resolve()
			.then(() => onfulfilled?.(value) ?? value)
			.catch((reason) => onrejected?.(reason));

	return {
		get current() {
			return value;
		},
		get error() {
			return null;
		},
		get loading() {
			return false;
		},
		get ready() {
			return ready;
		},
		set,
		refresh,
		withOverride: vi.fn(),
		then
	} as unknown as RemoteQuery<T>;
}

describe('browser cache helpers', () => {
	it('loads cached data into the remote query before refresh', async () => {
		const cacheKey = lookupCacheKey('loaders');
		const cachedLoaders = [
			{ id: 1, name: 'Alex', isActive: true },
			{ id: 2, name: 'Taylor', isActive: true }
		];
		const storage = createMemoryStorage({
			[cacheKey]: JSON.stringify({
				signature: 'cached',
				data: cachedLoaders,
				updatedAt: '2026-03-30T00:00:00.000Z'
			})
		});
		const query = createRemoteQuery([{ id: 99, name: 'Stale', isActive: false }], cachedLoaders);

		createCachedRemoteQuery(query, cacheKey, storage);

		expect(query.set).not.toHaveBeenCalled();

		await Promise.resolve();

		expect(query.set).toHaveBeenCalledWith(cachedLoaders);
		expect(query.current).toEqual(cachedLoaders);
	});

	it('does not re-hydrate the same cached query instance on repeated access', async () => {
		const cacheKey = lookupCacheKey('loaders');
		const cachedLoaders = [
			{ id: 1, name: 'Alex', isActive: true },
			{ id: 2, name: 'Taylor', isActive: true }
		];
		const storage = createMemoryStorage({
			[cacheKey]: JSON.stringify({
				signature: 'cached',
				data: cachedLoaders,
				updatedAt: '2026-03-30T00:00:00.000Z'
			})
		});
		const query = createRemoteQuery([{ id: 99, name: 'Stale', isActive: false }], cachedLoaders);

		createCachedRemoteQuery(query, cacheKey, storage);
		createCachedRemoteQuery(query, cacheKey, storage);

		await Promise.resolve();

		expect(query.set).toHaveBeenCalledTimes(1);
	});

	it('keeps the current reference when refresh returns the same payload', async () => {
		const cacheKey = lookupCacheKey('trailers');
		const cachedTrailers = [
			{ id: 11, name: 'TR-11' },
			{ id: 12, name: 'TR-12' }
		];
		const storage = createMemoryStorage();
		const query = createRemoteQuery(cachedTrailers, [...cachedTrailers]);

		createCachedRemoteQuery(query, cacheKey, storage);
		await Promise.resolve();
		await query.refresh();

		expect(query.current).toBe(cachedTrailers);
		expect(storage.setItem).toHaveBeenCalledTimes(1);
	});

	it('writes refreshed data to the cache when the payload changes', async () => {
		const cacheKey = lookupCacheKey('drop-areas', 'Wrap');
		const initialAreas = [
			{ id: 41, name: 'W12' }
		];
		const refreshedAreas = [
			{ id: 41, name: 'W12' },
			{ id: 42, name: 'W13' }
		];
		const storage = createMemoryStorage();
		const query = createRemoteQuery(initialAreas, refreshedAreas);

		createCachedRemoteQuery(query, cacheKey, storage);
		await query.refresh();

		expect(storage.setItem).toHaveBeenCalled();
		expect(query.current).toEqual(refreshedAreas);

		const cachedRecord = JSON.parse(String(storage.getItem(cacheKey)));
		expect(cachedRecord.data).toEqual(refreshedAreas);
	});

	it('scopes cache keys by target', () => {
		expect(lookupCacheKey('loaders', getTargetLookupCacheQualifier('Canton') ?? undefined)).toBe(
			'dak-lookup-cache:v1:loaders:canton'
		);
		expect(lookupCacheKey('loaders', getTargetLookupCacheQualifier('Freeport') ?? undefined)).toBe(
			'dak-lookup-cache:v1:loaders:freeport'
		);
		expect(
			lookupCacheKey(
				'drop-areas',
				`Wrap:${getTargetLookupCacheQualifier('Canton') ?? 'default'}`
			)
		).toBe('dak-lookup-cache:v1:drop-areas:Wrap:canton');
	});

	it('defers the initial cache write until the query settles', async () => {
		const cacheKey = lookupCacheKey('trailers', getTargetLookupCacheQualifier('Canton') ?? undefined);
		const storage = createMemoryStorage();
		const query = createRemoteQuery([{ id: 1, name: 'TR-1' }], [{ id: 2, name: 'TR-2' }]);

		createCachedRemoteQuery(query, cacheKey, storage);

		expect(storage.setItem).not.toHaveBeenCalled();

		await Promise.resolve();

		expect(storage.setItem).toHaveBeenCalledTimes(1);
		expect(JSON.parse(String(storage.getItem(cacheKey))).data).toEqual([{ id: 1, name: 'TR-1' }]);
	});

	it('skips the initial cache write for query doubles that are not thenable', async () => {
		const cacheKey = lookupCacheKey('drop-areas', 'Wrap');
		const storage = createMemoryStorage();
		const query = {
			current: [{ id: 41, name: 'W12' }],
			error: null,
			loading: false,
			ready: true,
			refresh: vi.fn(async () => undefined),
			set: vi.fn(),
			withOverride: vi.fn()
		} as unknown as RemoteQuery<{ id: number; name: string }[]>;

		expect(() => createCachedRemoteQuery(query, cacheKey, storage)).not.toThrow();
		expect(storage.setItem).not.toHaveBeenCalled();
	});

	it('invalidates a cached lookup entry', () => {
		const cacheKey = lookupCacheKey('loaders');
		const storage = createMemoryStorage({
			[cacheKey]: JSON.stringify({
				signature: 'cached',
				data: [{ id: 1, name: 'Alex', isActive: true }],
				updatedAt: '2026-03-30T00:00:00.000Z'
			})
		});

		invalidateLookupCache(storage, cacheKey);

		expect(storage.removeItem).toHaveBeenCalledWith(cacheKey);
		expect(storage.getItem(cacheKey)).toBeNull();
	});
});
