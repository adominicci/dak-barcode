import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	getLoadersRemote,
	getTrailersRemote,
	getDropAreasByDepartmentRemote
} = vi.hoisted(() => ({
	getLoadersRemote: vi.fn(),
	getTrailersRemote: vi.fn(),
	getDropAreasByDepartmentRemote: vi.fn()
}));

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
		getLoadersRemote.mockReset();
		getTrailersRemote.mockReset();
		getDropAreasByDepartmentRemote.mockReset();
	});

	it('returns the loader remote query directly without browser caching', () => {
		const loaderQuery = { source: 'loaders' };
		getLoadersRemote.mockReturnValue(loaderQuery);

		expect(getLoaders('Freeport')).toBe(loaderQuery);

		expect(getLoadersRemote).toHaveBeenCalledWith({ targetCacheKey: 'freeport' });
	});

	it('falls back to the default target qualifier for loaders', () => {
		const loaderQuery = { source: 'loaders-default' };
		getLoadersRemote.mockReturnValue(loaderQuery);

		expect(getLoaders()).toBe(loaderQuery);

		expect(getLoadersRemote).toHaveBeenCalledWith({ targetCacheKey: 'default' });
	});

	it('returns the trailer remote query directly without browser caching', () => {
		const trailerQuery = { source: 'trailers' };
		getTrailersRemote.mockReturnValue(trailerQuery);

		expect(getTrailers('Canton')).toBe(trailerQuery);

		expect(getTrailersRemote).toHaveBeenCalledWith({ target: 'Canton', targetCacheKey: 'canton' });
	});

	it('falls back to Canton for trailer location when no target is supplied', () => {
		const trailerQuery = { source: 'trailers-default' };
		getTrailersRemote.mockReturnValue(trailerQuery);

		expect(getTrailers()).toBe(trailerQuery);

		expect(getTrailersRemote).toHaveBeenCalledWith({ target: 'Canton', targetCacheKey: 'canton' });
	});

	it('returns the drop-area remote query directly without browser caching', () => {
		const dropAreasQuery = { source: 'drop-areas' };
		getDropAreasByDepartmentRemote.mockReturnValue(dropAreasQuery);

		expect(getDropAreasByDepartment('Wrap', 'Freeport')).toBe(dropAreasQuery);

		expect(getDropAreasByDepartmentRemote).toHaveBeenCalledWith({
			department: 'Wrap',
			targetCacheKey: 'freeport'
		});
	});

	it('falls back to the default target qualifier for drop areas', () => {
		const dropAreasQuery = { source: 'drop-areas-default' };
		getDropAreasByDepartmentRemote.mockReturnValue(dropAreasQuery);

		expect(getDropAreasByDepartment('Wrap')).toBe(dropAreasQuery);

		expect(getDropAreasByDepartmentRemote).toHaveBeenCalledWith({
			department: 'Wrap',
			targetCacheKey: 'default'
		});
	});
});
