import type {
	DepartmentStatus,
	DropArea,
	DropSheet,
	LoadViewDetail,
	LoadViewUnion,
	Loader,
	LoaderInfo,
	LoaderSession,
	OperationalDepartment
} from '$lib/types';
import type {
	RawDstDepartmentStatusOnDrop,
	RawDstDepartmentStatusOnDropSheet,
	RawDstDropArea,
	RawDstDropSheet,
	RawDstLoadViewDetail,
	RawDstLoadViewUnion,
	RawDstLoader
} from '$lib/types/raw-dst';
import type { RawDakLoaderInfo, RawDakLoaderSession } from '$lib/types/raw-dak';

function nullableString(value: string | null | undefined): string | null {
	return value ?? null;
}

function nullableNumber(value: number | null | undefined): number | null {
	return value ?? null;
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
