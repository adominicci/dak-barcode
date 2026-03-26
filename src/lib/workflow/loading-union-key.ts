import type { LoadViewUnion } from '$lib/types';

export function getLoadingUnionKey(label: LoadViewUnion, index: number): string {
	if (label.lpid > 0) {
		return `lpid-${label.lpid}-${index}`;
	}

	return [
		'fallback',
		label.sequence,
		index,
		label.orderSoNumber || 'no-so',
		label.partListId || 'no-part-list',
		label.labelNumber,
		label.dropAreaName || 'no-drop-area'
	].join('-');
}
