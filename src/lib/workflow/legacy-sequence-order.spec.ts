import { describe, expect, it } from 'vitest';
import { sortLegacyLoadViewAllEntries } from './legacy-sequence-order';

describe('sortLegacyLoadViewAllEntries', () => {
	it('puts ALL first and then sorts numeric sequences ascending', () => {
		const result = sortLegacyLoadViewAllEntries([
			{
				dropSheetId: 42,
				dropSheetCustId: 3,
				sequence: '010',
				loadNumber: 'L-042',
				driver: 'Ed Stahl',
				status: 'Ready'
			},
			{
				dropSheetId: 42,
				dropSheetCustId: 1,
				sequence: 'ALL',
				loadNumber: 'L-042',
				driver: 'Ed Stahl',
				status: null
			},
			{
				dropSheetId: 42,
				dropSheetCustId: 2,
				sequence: '002',
				loadNumber: 'L-042',
				driver: 'Ed Stahl',
				status: 'Due'
			},
			{
				dropSheetId: 42,
				dropSheetCustId: 4,
				sequence: '001',
				loadNumber: 'L-042',
				driver: 'Ed Stahl',
				status: 'Due'
			}
		]);

		expect(result.map((entry) => entry.sequence)).toEqual(['ALL', '001', '002', '010']);
	});
});
