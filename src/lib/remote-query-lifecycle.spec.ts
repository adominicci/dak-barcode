import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = [
	'src/routes/(app)/select-category/[dropsheetId]/+page.svelte',
	'src/routes/(app)/dropsheets/+page.svelte',
	'src/routes/(app)/loaders/+page.svelte',
	'src/routes/(app)/loading/+page.svelte',
	'src/routes/(app)/order-status/[dropsheetId]/+page.svelte',
	'src/routes/(app)/move-orders/[dropsheetId]/+page.svelte',
	'src/lib/components/workflow/staging-location-modal.svelte'
];

describe('remote query lifecycle', () => {
	it('does not stash query instances inside derived values', () => {
		for (const file of files) {
			const source = readFileSync(file, 'utf8');

			expect(source).not.toMatch(/const\s+\w+Query\s*=\s*\$derived(?:\.by)?/);
		}
	});
});
