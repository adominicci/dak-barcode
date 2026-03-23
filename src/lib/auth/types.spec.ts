import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	OPERATOR_TARGETS,
	TARGETS,
	type AccessState,
	type AuthContext,
	type Target
} from './types';

describe('auth type compatibility shim', () => {
	it('re-exports the legacy auth-facing constants and types', () => {
		expect(OPERATOR_TARGETS).toEqual(['Canton', 'Freeport']);
		expect(TARGETS).toEqual(['Canton', 'Freeport', 'Sandbox']);
		expectTypeOf<AuthContext['accessState']>().toEqualTypeOf<AccessState>();
		expectTypeOf<AuthContext['target']>().toEqualTypeOf<Target | null>();
	});
});

// @ts-expect-error Loader should stay in the operational type barrel, not the auth shim.
type _NoLoaderLeak = import('./types').Loader;
