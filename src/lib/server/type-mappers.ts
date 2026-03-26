import { OPERATIONAL_DEPARTMENTS } from '$lib/types';
import type {
	DepartmentStatus,
	DropSheetCategoryAvailability,
	DropArea,
	DropSheet,
	LoadViewDetail,
	LoadViewUnion,
	Loader,
	LoaderInfo,
	LoaderSession,
	OperationalDepartment,
	ScanDropAreaSummary,
	ScanResult,
	ScanStatus,
	ScanType,
	StagingListItem
} from '$lib/types';
import type {
	RawDstCategoryListEntry,
	RawDstDepartmentStatusOnDrop,
	RawDstDepartmentStatusOnDropSheet,
	RawDstDropSheetCategoryAvailability,
	RawDstDropArea,
	RawDstDropSheet,
	RawDstLoadViewDetail,
	RawDstLoadViewUnion,
	RawDstLoader,
	RawDstStagingListItem
} from '$lib/types/raw-dst';
import type {
	RawDakDepartmentStatus,
	RawDakLoaderInfo,
	RawDakLoaderSession,
	RawDakScanDropArea,
	RawDakScanResult
} from '$lib/types/raw-dak';

function nullableString(value: string | null | undefined): string | null {
	return value ?? null;
}

function nullableNumber(value: number | null | undefined): number | null {
	return value ?? null;
}

function stringOrEmpty(value: string | null | undefined): string {
	return value ?? '';
}

function numberOrZero(value: number | null | undefined): number {
	return value ?? 0;
}

function nullableBoolean(value: boolean | null | undefined): boolean | null {
	return value ?? null;
}

function nullableDakStatus(value: string | null | undefined): string | null {
	return value ?? null;
}

function requiredNumber(
	value: number | null | undefined,
	errorMessage: string
): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new Error(errorMessage);
	}

	return value;
}

// Loader sessions should only exist for scanner-eligible departments.
// Fail fast if dak-web broadens this payload unexpectedly so the mismatch is visible.
function mapOperationalDepartment(department: string): OperationalDepartment {
	switch (department) {
		case 'Roll':
		case 'Wrap':
		case 'Parts':
			return department;
		default:
			throw new Error(`Unsupported operational department: ${department}`);
	}
}

function isOperationalDepartment(department: string): department is OperationalDepartment {
	return OPERATIONAL_DEPARTMENTS.includes(department as OperationalDepartment);
}

function normalizeScanStatus(status: string): ScanStatus {
	switch (status.trim().toLowerCase().replace(/[\s_]+/g, '-')) {
		case 'success':
			return 'success';
		case 'needs-location':
			return 'needs-location';
		case 'invalid-location':
			return 'invalid-location';
		case 'does-not-belong':
			return 'does-not-belong';
		case 'incomplete-drop':
			return 'incomplete-drop';
		case 'no-match':
			return 'no-match';
		case 'department-blocked':
			return 'department-blocked';
		case 'api-error':
			return 'api-error';
		default:
			throw new Error(`Unsupported scan status: ${status}`);
	}
}

function normalizeScanType(scanType: string): ScanType {
	switch (scanType.trim().toLowerCase().replace(/-/g, '_')) {
		case 'location':
			return 'location';
		case 'pallet':
			return 'pallet';
		case 'single_label':
			return 'single_label';
		default:
			throw new Error(`Unsupported scan type: ${scanType}`);
	}
}

function mapDakScanDropArea(raw: RawDakScanDropArea): ScanDropAreaSummary {
	const id = raw.drop_area_id ?? raw.id ?? raw.DropAreaID;
	const label = raw.drop_area ?? raw.dropArea ?? raw.label ?? raw.name ?? raw.DropArea;

	if (typeof id !== 'number' || !Number.isFinite(id) || !label || typeof label !== 'string') {
		throw new Error('Invalid DAK scan drop area payload.');
	}

	return {
		id,
		label
	};
}

export function mapDstLoader(raw: RawDstLoader): Loader {
	return {
		id: raw.LoaderID,
		name: raw.Loader,
		isActive: raw.IsActive
	};
}

export function mapDstDropSheet(raw: RawDstDropSheet): DropSheet {
	return {
		id: raw.DropSheetID,
		loadNumber: raw.LoadNumber,
		loadNumberShort: nullableString(raw.LoadNum),
		trailer: nullableString(raw.Trailer),
		percentCompleted: raw.PercentCompleted ?? 0,
		loadedAt: nullableString(raw.LoadedTS),
		dropWeight: raw.DropWeight ?? 0,
		driverId: nullableNumber(raw.Driver),
		driverName: nullableString(raw.DriverName),
		allLoaded: raw.AllLoaded ?? false,
		loaderName: nullableString(raw.Loader)
	};
}

export function mapDstDropArea(raw: RawDstDropArea): DropArea {
	return {
		id: raw.DropAreaID,
		name: raw.DropArea,
		supportsWrap: raw.WrapLocation ?? raw.wrapLocation ?? false,
		supportsParts: raw.PartLocation ?? raw.partLocation ?? false,
		supportsRoll: raw.RollLocation ?? raw.rollLocation ?? false,
		supportsLoading: raw.LoadLocation ?? raw.loadLocation ?? false,
		supportsDriverLocation: raw.DriverLocation ?? raw.driverLocation ?? false,
		firstCharacter: nullableString(raw.firstCharacter)
	};
}

export function mapDstLoadViewDetail(raw: RawDstLoadViewDetail): LoadViewDetail {
	return {
		dropSequence: raw.DropSequence,
		dropSheetId: raw.DropSheetID,
		dropSheetCustomerId: raw.DropSheetCustID,
		loadNumber: raw.LoadNumber,
		loadDate: nullableString(raw.LoadDate),
		locationId: raw.LocationID,
		sequence: raw.DSSequence,
		customerId: nullableNumber(raw.fkCustomerID),
		customerName: raw.CustomerName,
		driverName: raw.Driver ?? '',
		totalCountText: raw.TotalCount ?? '',
		labelCount: raw.LabelCount,
		scannedCount: raw.Scanned,
		needPickCount: raw.NeedPick
	};
}

export function mapDstLoadViewUnion(raw: RawDstLoadViewUnion): LoadViewUnion {
	return {
		partListId: raw.FirstOfPartListID ?? '',
		labelNumber: raw.LabelNumber ?? 0,
		orderSoNumber: raw.OrderSoNumber ?? '',
		loadNumber: raw.LoadNumber,
		sequence: raw.DSSequence,
		dropAreaName: raw.DropArea ?? '',
		scanned: raw.Scanned,
		locationId: raw.LocationID,
		lengthText: raw.length ?? '',
		categoryId: raw.CategoryID ?? 0,
		lpid: raw.LPID ?? 0
	};
}

export function mapDstDepartmentStatusFromDrop(
	raw: RawDstDepartmentStatusOnDrop
): DepartmentStatus {
	return {
		scope: 'drop',
		subjectId: raw.CustDropSheetID,
		slit: raw.StatusOnLoadSlit ?? null,
		trim: raw.StatusOnLoadTrim ?? null,
		wrap: raw.StatusOnLoadWrap ?? null,
		roll: raw.StatusOnLoadRoll ?? null,
		parts: raw.StatusOnLoadPart ?? null,
		soffit: raw.StatusOnLoadSoffit ?? null
	};
}

export function mapDstDepartmentStatusFromDropSheet(
	raw: RawDstDepartmentStatusOnDropSheet
): DepartmentStatus {
	return {
		scope: 'dropsheet',
		subjectId: raw.DropSheetID,
		slit: raw.StatusOnLoadSlitDS ?? null,
		trim: raw.StatusOnLoadTrimDS ?? null,
		wrap: raw.StatusOnLoadWrapDS ?? null,
		roll: raw.StatusOnLoadRollDS ?? null,
		parts: raw.StatusOnLoadPartDS ?? null,
		soffit: raw.StatusOnLoadSoffitDS ?? null
	};
}

export function mapDstDropSheetCategoryAvailability(
	raw: RawDstDropSheetCategoryAvailability
): DropSheetCategoryAvailability {
	return {
		dropSheetId: raw.DropSheetID,
		rollScannedPercent: raw.RollScannedPercent ?? 0,
		rollHasLabels: raw.RollHasLabels ?? 0,
		wrapScannedPercent: raw.WrapScannedPercent ?? 0,
		wrapHasLabels: raw.WrapHasLabels ?? 0,
		partsHasLabels: raw.PartHasLabels ?? 0,
		partsScannedPercent: raw.PartcannedPercent ?? 0,
		allLoaded: raw.AllLoaded ?? false
	};
}

export function mapDstStagingListItem(raw: RawDstStagingListItem): StagingListItem {
	return {
		lpidDetail: requiredNumber(raw.LPIDDetail, 'mapDstStagingListItem: missing required ID fields'),
		partListId: stringOrEmpty(raw.PartListID),
		partListDescription: stringOrEmpty(raw.PartListDesc),
		orderSoNumber: stringOrEmpty(raw.OrderSONumber),
		quantity: numberOrZero(raw.QtyDet),
		dropAreaName: stringOrEmpty(raw.DropArea),
		lpid: requiredNumber(raw.LPID, 'mapDstStagingListItem: missing required ID fields')
	};
}

function getDstCategoryName(entry: RawDstCategoryListEntry): string {
	if (typeof entry === 'string') {
		return entry;
	}

	return (
		entry.Category ??
		entry.category ??
		entry.Department ??
		entry.department ??
		entry.InventoryCategory ??
		entry.inventoryCategory ??
		entry.Name ??
		entry.name ??
		''
	);
}

export function mapDstCategoryList(entries: RawDstCategoryListEntry[]): OperationalDepartment[] {
	return entries.map(getDstCategoryName).filter(isOperationalDepartment);
}

export function mapDakLoaderInfo(raw: RawDakLoaderInfo): LoaderInfo {
	return {
		id: raw.LoaderID,
		dropSheetId: raw.fkDropSheetID,
		loaderId: raw.fkLoaderID,
		department: mapOperationalDepartment(raw.Department),
		loaderName: raw.loader_name,
		startedAt: raw.started_at,
		endedAt: raw.ended_at ?? null
	};
}

export function mapDakDepartmentStatus(raw: RawDakDepartmentStatus): DepartmentStatus {
	const subjectId = raw.drop_sheet_id ?? raw.dropSheetId ?? raw.DropSheetID;

	if (typeof subjectId !== 'number' || !Number.isFinite(subjectId)) {
		throw new Error('Invalid DAK department status payload.');
	}

	return {
		scope: 'dropsheet',
		subjectId,
		slit: nullableDakStatus(raw.slit),
		trim: nullableDakStatus(raw.trim),
		wrap: nullableDakStatus(raw.wrap),
		roll: nullableDakStatus(raw.roll),
		parts: nullableDakStatus(raw.parts ?? raw.part),
		soffit: nullableDakStatus(raw.soffit)
	};
}

export function mapDakLoaderSession(raw: RawDakLoaderSession): LoaderSession {
	return {
		id: raw.loader_id ?? raw.LoaderID ?? null,
		dropSheetId: raw.fkDropSheetID,
		loaderId: raw.fkLoaderID,
		department: mapOperationalDepartment(raw.Department),
		loaderName: raw.loader_name,
		startedAt: raw.started_at,
		endedAt: raw.ended_at ?? null
	};
}

export function mapDakScanResult(raw: RawDakScanResult): ScanResult {
	const rawScanType = raw.scan_type ?? raw.scanType;
	const rawStatus = raw.status;
	const rawMessage = raw.message;
	const rawNeedPick = raw.need_pick ?? raw.needPick;
	const rawNeedsLocation = nullableBoolean(raw.needs_location ?? raw.needsLocation);

	if (typeof rawStatus !== 'string' || typeof rawMessage !== 'string') {
		throw new Error('Invalid DAK scan result payload.');
	}

	const status = normalizeScanStatus(rawStatus);
	if (typeof rawScanType !== 'string' && status === 'success') {
		throw new Error('Invalid DAK scan result payload.');
	}

	const scanType = typeof rawScanType === 'string' ? normalizeScanType(rawScanType) : null;

	return {
		scanType,
		status,
		message: rawMessage,
		needsLocation: rawNeedsLocation ?? false,
		needPick:
			typeof rawNeedPick === 'number' && Number.isFinite(rawNeedPick) ? rawNeedPick : null,
		dropArea: raw.drop_area || raw.dropArea ? mapDakScanDropArea(raw.drop_area ?? raw.dropArea!) : null
	};
}
