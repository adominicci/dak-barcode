import type { User } from '@supabase/supabase-js';

export const OPERATOR_TARGETS = ['Canton', 'Freeport'] as const;
export const TARGETS = [...OPERATOR_TARGETS, 'Sandbox'] as const;

export type OperatorTarget = (typeof OPERATOR_TARGETS)[number];
export type Target = (typeof TARGETS)[number];
export type AccessState =
	| 'anonymous'
	| 'inactive'
	| 'operator-ready'
	| 'admin-needs-target'
	| 'admin-ready';

export type UserRole =
	| 'admin'
	| 'management'
	| 'isr'
	| 'osr'
	| 'production'
	| 'logistics'
	| 'financial'
	| 'loading'
	| null;

export type WarehouseRecord = {
	alias: string | null;
};

export type ProfileRecord = {
	id: string;
	email: string | null;
	displayName: string | null;
	userRole: UserRole;
	isActive: boolean;
	warehouseId: number | null;
};

export type ProfileWithWarehouse = ProfileRecord & {
	warehouse: WarehouseRecord | null;
};

export type AuthContext = {
	accessState: AccessState;
	isActive: boolean;
	isAdmin: boolean;
	profile: ProfileWithWarehouse | null;
	role: UserRole;
	target: Target | null;
	user: User | null;
};
