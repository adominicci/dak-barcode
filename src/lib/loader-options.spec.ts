import { describe, expect, it } from 'vitest';

import { getActiveLoaderOptions } from './loader-options';

describe('loader picker options', () => {
	it('maps only active loaders into picker options', () => {
		expect(
			getActiveLoaderOptions([
				{ id: 7, name: 'Kaleb', isActive: true },
				{ id: 8, name: 'Austin', isActive: false },
				{ id: 9, name: 'Alick', isActive: true }
			])
		).toEqual([
			{ id: 7, label: 'Kaleb' },
			{ id: 9, label: 'Alick' }
		]);
	});

	it('returns an empty array when all loaders are inactive', () => {
		expect(
			getActiveLoaderOptions([
				{ id: 8, name: 'Austin', isActive: false },
				{ id: 10, name: 'Troy', isActive: false }
			])
		).toEqual([]);
	});
});
