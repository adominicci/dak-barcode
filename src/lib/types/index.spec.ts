import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	DAK_TARGETS,
	FRONTEND_TARGETS,
	WAREHOUSE_ALIASES,
	resolveWarehouseAlias,
	toDakTarget,
	type AuthContext,
	type FrontendTarget,
	type WarehouseAlias
} from './index';

describe('shared target contracts', () => {
	it('exposes the canonical frontend and warehouse target sets', () => {
		expect(FRONTEND_TARGETS).toEqual(['Canton', 'Freeport', 'Sandbox']);
		expect(DAK_TARGETS).toEqual(['CANTON', 'FREEPORT', 'SANDBOX']);
		expect(WAREHOUSE_ALIASES).toEqual(['Canton', 'Freeport']);
	});

	it('normalizes operator warehouse aliases and dak targets centrally', () => {
		expect(resolveWarehouseAlias('Canton')).toBe<WarehouseAlias>('Canton');
		expect(resolveWarehouseAlias('Freeport')).toBe<WarehouseAlias>('Freeport');
		expect(resolveWarehouseAlias('Unknown')).toBe<WarehouseAlias>('Canton');
		expect(resolveWarehouseAlias(null)).toBe<WarehouseAlias>('Canton');
		expect(toDakTarget('Canton')).toBe('CANTON');
		expect(toDakTarget('Sandbox')).toBe('SANDBOX');
	});

	it('keeps auth context target typing aligned to the shared frontend contract', () => {
		expectTypeOf<FrontendTarget>().toEqualTypeOf<'Canton' | 'Freeport' | 'Sandbox'>();
		expectTypeOf<WarehouseAlias>().toEqualTypeOf<'Canton' | 'Freeport'>();
		expectTypeOf<AuthContext['target']>().toEqualTypeOf<FrontendTarget | null>();
		expect(true).toBe(true);
	});
});
