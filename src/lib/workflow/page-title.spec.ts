import { describe, expect, it } from 'vitest';
import { getPageTitle } from './page-title';

describe('getPageTitle', () => {
	it('builds a meaningful title for select-category pages', () => {
		expect(
			getPageTitle('/select-category/25237', {
				loadNumber: '04012026-1006'
			})
		).toBe('Select Category 04012026-1006 - Stage & Load');
	});

	it('builds a meaningful title for loading pages with a load number', () => {
		expect(
			getPageTitle('/loading', {
				loadNumber: 'L-042'
			})
		).toBe('Loading L-042 - Stage & Load');
	});

	it('falls back to the app name for unknown routes', () => {
		expect(getPageTitle('/some-new-page')).toBe('Stage & Load');
	});
});
