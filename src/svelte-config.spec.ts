import { describe, expect, it } from 'vitest';
import svelteConfig from '../svelte.config.js';

describe('svelte config', () => {
	it('enables experimental async mode with remote functions', () => {
		expect(svelteConfig).toMatchObject({
			kit: {
				experimental: {
					remoteFunctions: true
				}
			},
			compilerOptions: {
				experimental: {
					async: true
				}
			}
		});
	});
});
