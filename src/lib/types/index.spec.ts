import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	DAK_TARGETS,
	FRONTEND_TARGETS,
	WAREHOUSE_ALIASES,
	resolveWarehouseAlias,
	toDstTarget,
	toDakTarget,
	type AuthContext,
	type FrontendTarget,
	type OperationalDepartment,
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
		expect(toDstTarget('Canton')).toBe('Canton');
		expect(toDstTarget('Sandbox')).toBe('Sandbox');
		expect(toDakTarget('Canton')).toBe('CANTON');
		expect(toDakTarget('Sandbox')).toBe('SANDBOX');
	});

	it('keeps auth context target typing aligned to the shared frontend contract', () => {
		expectTypeOf<FrontendTarget>().toEqualTypeOf<'Canton' | 'Freeport' | 'Sandbox'>();
		expectTypeOf<WarehouseAlias>().toEqualTypeOf<'Canton' | 'Freeport'>();
		expectTypeOf<AuthContext['target']>().toEqualTypeOf<FrontendTarget | null>();
		expect(true).toBe(true);
	});

	it('keeps scan-entry departments limited to the legacy scanner workflow', () => {
		expectTypeOf<OperationalDepartment>().toEqualTypeOf<'Roll' | 'Wrap' | 'Parts'>();
		expect(true).toBe(true);
	});
});
