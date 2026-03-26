import { describe, expect, it } from 'vitest';
import type { LoadViewUnion } from '$lib/types';
import { getLoadingUnionKey } from './loading-union-key';

function createUnionLabel(overrides: Partial<LoadViewUnion> = {}): LoadViewUnion {
	return {
		partListId: 'PL-100',
		labelNumber: 1001,
		orderSoNumber: 'SO-100',
		loadNumber: 'L-042',
		sequence: 1,
		dropAreaName: 'R12',
		scanned: false,
		locationId: 2,
		lengthText: '10ft',
		categoryId: 2,
		lpid: 5001,
		...overrides
	};
}

describe('loading union key helper', () => {
	it('prefers LPID when the backend provides it', () => {
		expect(getLoadingUnionKey(createUnionLabel(), 0)).toBe('lpid-5001-0');
	});

	it('falls back to a sequence-aware unique key when label display fields collide', () => {
		const first = createUnionLabel({
			partListId: '',
			labelNumber: 0,
			orderSoNumber: '',
			lpid: 0
		});
		const second = createUnionLabel({
			partListId: '',
			labelNumber: 0,
			orderSoNumber: '',
			dropAreaName: 'R13',
			lpid: 0
		});

		expect(getLoadingUnionKey(first, 0)).not.toBe(getLoadingUnionKey(second, 1));
	});
});
