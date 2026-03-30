import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TargetBadge from './target-badge.svelte';

describe('target badge', () => {
	it('renders the active warehouse in the shared blue treatment', async () => {
		render(TargetBadge, {
			props: {
				target: 'Canton',
				testId: 'target-badge',
				wrapperClass: 'flex'
			}
		});

		await expect.element(page.getByTestId('target-badge')).toHaveTextContent('Canton');
		await expect.element(page.getByTestId('target-badge')).toHaveClass(
			/bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/
		);
		await expect.element(page.getByTestId('target-badge')).toHaveClass(/text-white/);
	});

	it('falls back to the neutral chip when no target is set', async () => {
		render(TargetBadge, {
			props: {
				target: null,
				testId: 'target-badge',
				wrapperClass: 'flex'
			}
		});

		await expect.element(page.getByTestId('target-badge')).toHaveTextContent('Target required');
		await expect.element(page.getByTestId('target-badge')).toHaveClass(/bg-surface-container-low/);
		await expect.element(page.getByTestId('target-badge')).toHaveClass(/text-slate-900/);
	});
});
