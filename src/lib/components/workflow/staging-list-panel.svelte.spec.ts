import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StagingListPanel from './staging-list-panel.svelte';

describe('staging list panel', () => {
	it('hides framework runtime errors from operators', async () => {
		render(StagingListPanel, {
			props: {
				department: 'Wrap',
				items: [],
				error: new Error('https://svelte.dev/e/experimental_async_required')
			}
		});

		await expect.element(page.getByText('Unable to load staging items.').nth(1)).toBeInTheDocument();
		await expect.element(page.getByText('https://svelte.dev/e/experimental_async_required')).not.toBeInTheDocument();
	});
});
