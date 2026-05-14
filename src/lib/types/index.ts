import type { User } from '@supabase/supabase-js';

export const WAREHOUSE_ALIASES = ['Canton', 'Freeport'] as const;
export const FRONTEND_TARGETS = [...WAREHOUSE_ALIASES, 'Sandbox'] as const;
export const DST_TARGETS = FRONTEND_TARGETS;
export const DAK_TARGETS = ['CANTON', 'FREEPORT', 'SANDBOX'] as const;

export type WarehouseAlias = (typeof WAREHOUSE_ALIASES)[number];
export type FrontendTarget = (typeof FRONTEND_TARGETS)[number];
export type DstTarget = (typeof DST_TARGETS)[number];
export type DakTarget = (typeof DAK_TARGETS)[number];

export type OperatorTarget = WarehouseAlias;
export type Target = FrontendTarget;

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

export type Warehouse = {
	id?: number | null;
	alias: WarehouseAlias | null;
};

export type WarehouseRecord = {
	alias: string | null;
};

export type Profile = {
	id: string;
	email: string | null;
	displayName: string | null;
	userRole: UserRole;
	isActive: boolean;
	warehouseId: number | null;
	warehouse: WarehouseRecord | null;
};

export type ProfileRecord = Omit<Profile, 'warehouse'>;

export type ProfileWithWarehouse = Profile;

export type AuthContext = {
	accessState: AccessState;
	isActive: boolean;
	isAdmin: boolean;
	profile: ProfileWithWarehouse | null;
	role: UserRole;
	target: FrontendTarget | null;
	user: User | null;
};

// Scanner entry and loader sessions stay limited to the three legacy workflow categories.
// DepartmentStatus still tracks Slit/Trim/Soffit because they gate loading readiness.
export const OPERATIONAL_DEPARTMENTS = ['Roll', 'Wrap', 'Parts'] as const;
export type OperationalDepartment = (typeof OPERATIONAL_DEPARTMENTS)[number];

export type Loader = {
	id: number;
	name: string;
	isActive: boolean;
};

export type Trailer = {
	id: number | string;
	name: string;
	photoUrl?: string | null;
};

export type DropSheet = {
	id: number;
	loadNumber: string;
	loadNumberShort: string | null;
	trailer: string | null;
	percentCompleted: number;
	loadedAt: string | null;
	dropWeight: number;
	driverId: number | null;
	driverName: string | null;
	allLoaded: boolean;
	loaderName: string | null;
	transfer: boolean;
};

export type WillCallDropsheetLookup = {
	dropSheetId: number;
};

export type WillCallSignatureRecord = {
	dropSheetCustomerId: number | null;
	dropSheetId: number;
	signature: string | null;
	signatureTimestamp: string | null;
	receivedBy: string | null;
	signaturePath: string | null;
};

export type WillCallSignatureUploadInput = {
	dropSheetId: number;
	signaturePath: string;
	receivedBy: string;
};

export type DropArea = {
	id: number;
	name: string;
	supportsWrap: boolean;
	supportsParts: boolean;
	supportsRoll: boolean;
	supportsLoading: boolean;
	supportsDriverLocation: boolean;
	firstCharacter: string | null;
};

export type LoadViewDetail = {
	dropSequence: number;
	dropSheetId: number;
	dropSheetCustomerId: number;
	loadNumber: string;
	loadDate: string | null;
	locationId: number;
	sequence: number;
	customerId: number | null;
	customerName: string;
	driverName: string;
	totalCountText: string;
	labelCount: number;
	scannedCount: number;
	needPickCount: number;
};

export type LoadViewUnion = {
	partListId: string;
	labelNumber: number;
	orderSoNumber: string;
	loadNumber: string;
	sequence: number;
	dropAreaName: string;
	scanned: boolean;
	locationId: number;
	lengthText: string;
	categoryId: number;
	lpid: number;
};

export type LoadViewBarcodeCounters = {
	dropSheetId: number;
	dropSheetCustomerId: number;
	loadNumber: string;
	sequence: number;
	locationId: number;
	labelCount: number;
	scannedCount: number;
	needPickCount: number;
	legacyLabelCount: number;
	legacyScannedCount: number;
	legacyNeedPickCount: number;
	counterMismatch: boolean;
};

export type LegacyLoadViewAllEntry = {
	dropSheetId: number;
	dropSheetCustId: number;
	sequence: string;
	loadNumber: string;
	driver: string;
	status: string | null;
};

export type LegacyOrderStatusRow = {
	dropSheetCustId: number;
	orderSoNumber: string;
	customerName: string;
	fkDropSheetId: number;
	sequence: number;
	orderSlitterStatus: string | null;
	orderTrimStatus: string | null;
	orderWrapStatus: string | null;
	orderPartStatus: string | null;
	orderRollStatus: string | null;
	orderSoffitStatus: string | null;
	statusSort: number;
};

export type LegacyMoveOrderRow = {
	dropSheetCustId: number;
	partListId: string;
	qtyDet: string;
	labelNumber: number;
	scanned: boolean;
	orderSoNumber: string;
	customerName: string;
	loadingLocationId: number;
	dropArea: string;
	partColor: string | null;
	fkDropSheetId: number;
	recordType: number;
	lpid: number;
	sequence: number;
	unload: boolean;
	unloadManualScan: boolean;
};

export type PalletBelongsToLpidResult = {
	lpid: number;
	palletId: number;
	palletLabel: string | null;
	palletScan: boolean;
};

export type LoaderSession = {
	id: number | null;
	dropSheetId: number;
	loaderId: number;
	department: OperationalDepartment;
	loaderName: string;
	startedAt: string;
	endedAt: string | null;
};

export type LoaderInfo = LoaderSession;

export type LoaderSessionUpsertInput = {
	dropSheetId: number;
	loaderId: number;
	department: OperationalDepartment;
	loaderName: string;
	startedAt: string;
	id?: number | null;
	endedAt?: string | null;
};

export type DepartmentStatus = {
	scope: 'drop' | 'dropsheet';
	subjectId: number;
	slit: string | null;
	trim: string | null;
	wrap: string | null;
	roll: string | null;
	parts: string | null;
	soffit: string | null;
};

export type DropSheetCategoryAvailability = {
	dropSheetId: number;
	rollScannedPercent: number;
	rollHasLabels: number;
	wrapScannedPercent: number;
	wrapHasLabels: number;
	partsHasLabels: number;
	partsScannedPercent: number;
	allLoaded: boolean;
};

export type StagingListItem = {
	lpidDetail: number;
	partListId: string;
	partListDescription: string;
	orderSoNumber: string;
	quantity: number;
	dropAreaName: string;
	lpid: number;
};

export type StagingScanRequest = {
	scannedText: string;
	department: OperationalDepartment;
	dropAreaId?: number | null;
};

export type LoadingScanRequest = StagingScanRequest & {
	loadNumber: string;
	loaderName: string;
	dropSheetId?: number;
	locationId?: number;
	sequence?: number;
	selectedDropIndex?: number;
};

export type ScanType = 'location' | 'pallet' | 'single_label';

export type ScanStatus =
	| 'success'
	| 'needs-location'
	| 'invalid-location'
	| 'does-not-belong'
	| 'incomplete-drop'
	| 'no-match'
	| 'department-blocked'
	| 'api-error';

export type ScanDropAreaSummary = {
	id: number;
	label: string;
};

export type LoadingScanRefreshPayload = {
	dropDetails: LoadViewDetail[];
	dropLabels: LoadViewUnion[];
	dropLabelsKey: {
		loadNumber: string;
		sequence: number;
		locationId: number;
	};
	dropCounters?: LoadViewBarcodeCounters | null;
};

export type ScanResult = {
	scanType: ScanType | null;
	status: ScanStatus;
	message: string;
	needsLocation: boolean;
	needPick: number | null;
	dropArea: ScanDropAreaSummary | null;
	loadingRefresh?: LoadingScanRefreshPayload;
};

export const OPERATOR_TARGETS = WAREHOUSE_ALIASES;
export const TARGETS = FRONTEND_TARGETS;

export function isWarehouseAlias(value: string | null | undefined): value is WarehouseAlias {
	return WAREHOUSE_ALIASES.includes(value as WarehouseAlias);
}

export function isFrontendTarget(value: string | null | undefined): value is FrontendTarget {
	return FRONTEND_TARGETS.includes(value as FrontendTarget);
}

/**
 * Resolves the locked non-admin warehouse target from profile data.
 *
 * Per the current product rules, missing or unknown profile aliases default to `Canton`
 * during operator auth resolution. Callers that require strict alias validation should
 * use `isWarehouseAlias` first and handle invalid data explicitly instead of relying on
 * this fallback helper.
 */
export function resolveWarehouseAlias(alias: string | null | undefined): WarehouseAlias {
	if (isWarehouseAlias(alias)) {
		return alias;
	}

	return 'Canton';
}

// DST already accepts the canonical title-case frontend targets, so this helper marks the
// backend boundary without changing the value.
export function toDstTarget(target: FrontendTarget): DstTarget {
	return target;
}

export function toDakTarget(target: FrontendTarget): DakTarget {
	switch (target) {
		case 'Canton':
			return 'CANTON';
		case 'Freeport':
			return 'FREEPORT';
		case 'Sandbox':
			return 'SANDBOX';
	}
}
