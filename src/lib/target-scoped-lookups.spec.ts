import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	createCachedRemoteQuery,
	getLoadersRemote,
	getTrailersRemote,
	getDropAreasByDepartmentRemote
} = vi.hoisted(() => ({
	createCachedRemoteQuery: vi.fn((query: unknown) => query),
	getLoadersRemote: vi.fn(),
	getTrailersRemote: vi.fn(),
	getDropAreasByDepartmentRemote: vi.fn()
}));

vi.mock('$lib/browser-cache', async () => {
	const actual = await vi.importActual<typeof import('$lib/browser-cache')>('$lib/browser-cache');

	return {
		...actual,
		createCachedRemoteQuery
	};
});

vi.mock('$lib/loaders.remote', () => ({
	getLoaders: getLoadersRemote
}));

vi.mock('$lib/trailers.remote', () => ({
	getTrailers: getTrailersRemote
}));

vi.mock('$lib/drop-areas.remote', () => ({
	getDropAreasByDepartment: getDropAreasByDepartmentRemote
}));

import { getDropAreasByDepartment } from '$lib/drop-areas.cached';
import { getLoaders } from '$lib/loaders.cached';
import { getTrailers } from '$lib/trailers.cached';

describe('target-scoped lookup wrappers', () => {
	beforeEach(() => {
		createCachedRemoteQuery.mockClear();
		getLoadersRemote.mockReset();
		getTrailersRemote.mockReset();
		getDropAreasByDepartmentRemote.mockReset();
	});

	it('keys loader remote queries by target qualifier', () => {
		const loaderQuery = { source: 'loaders' };
		getLoadersRemote.mockReturnValue(loaderQuery);

		getLoaders('Freeport');

		expect(getLoadersRemote).toHaveBeenCalledWith({ targetCacheKey: 'freeport' });
		expect(createCachedRemoteQuery).toHaveBeenCalledWith(
			loaderQuery,
			'dak-lookup-cache:v1:loaders:freeport'
		);
	});

	it('keys trailer remote queries by target qualifier', () => {
		const trailerQuery = { source: 'trailers' };
		getTrailersRemote.mockReturnValue(trailerQuery);

		getTrailers('Canton');

		expect(getTrailersRemote).toHaveBeenCalledWith({ targetCacheKey: 'canton' });
		expect(createCachedRemoteQuery).toHaveBeenCalledWith(
			trailerQuery,
			'dak-lookup-cache:v1:trailers:canton'
		);
	});

	it('keys drop-area remote queries by department and target qualifier', () => {
		const dropAreasQuery = { source: 'drop-areas' };
		getDropAreasByDepartmentRemote.mockReturnValue(dropAreasQuery);

		getDropAreasByDepartment('Wrap', 'Freeport');

		expect(getDropAreasByDepartmentRemote).toHaveBeenCalledWith({
			department: 'Wrap',
			targetCacheKey: 'freeport'
		});
		expect(createCachedRemoteQuery).toHaveBeenCalledWith(
			dropAreasQuery,
			'dak-lookup-cache:v1:drop-areas:Wrap:freeport'
		);
	});
});
