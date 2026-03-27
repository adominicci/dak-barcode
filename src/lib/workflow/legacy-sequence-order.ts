import type { LegacyLoadViewAllEntry } from '$lib/types';

function getSequenceSortKey(sequence: string): {
	isAll: boolean;
	numericValue: number | null;
	normalized: string;
} {
	const normalized = sequence.trim().toUpperCase();

	if (normalized === 'ALL') {
		return {
			isAll: true,
			numericValue: null,
			normalized
		};
	}

	const parsedNumericValue = Number.parseInt(normalized, 10);

	return {
		isAll: false,
		numericValue: Number.isNaN(parsedNumericValue) ? null : parsedNumericValue,
		normalized
	};
}

export function sortLegacyLoadViewAllEntries(
	entries: LegacyLoadViewAllEntry[]
): LegacyLoadViewAllEntry[] {
	return [...entries].sort((left, right) => {
		const leftSortKey = getSequenceSortKey(left.sequence);
		const rightSortKey = getSequenceSortKey(right.sequence);

		if (leftSortKey.isAll && !rightSortKey.isAll) {
			return -1;
		}

		if (rightSortKey.isAll && !leftSortKey.isAll) {
			return 1;
		}

		if (leftSortKey.numericValue !== null && rightSortKey.numericValue !== null) {
			return leftSortKey.numericValue - rightSortKey.numericValue;
		}

		if (leftSortKey.numericValue !== null) {
			return -1;
		}

		if (rightSortKey.numericValue !== null) {
			return 1;
		}

		return leftSortKey.normalized.localeCompare(rightSortKey.normalized);
	});
}
