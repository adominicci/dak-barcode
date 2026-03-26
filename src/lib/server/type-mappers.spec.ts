import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
	DepartmentStatus,
	LoadingScanRequest,
	LoaderInfo,
	LoaderSession,
	OperationalDepartment,
	ScanResult,
	StagingListItem,
	StagingScanRequest
} from '$lib/types';
import {
	mapDakLoaderInfo,
	mapDakLoaderSession,
	mapDakScanResult,
	mapDstCategoryList,
	mapDstDepartmentStatusFromDrop,
	mapDstDepartmentStatusFromDropSheet,
	mapDstDropArea,
	mapDstDropSheet,
	mapDstLoadViewDetail,
	mapDstLoadViewUnion,
	mapDstLoader,
	mapDstStagingListItem
} from './type-mappers';

describe('dst record mappers', () => {
	it('maps loaders and dropsheets into the canonical shared contract', () => {
		expect(
			mapDstLoader({
				LoaderID: 7,
				Loader: 'Alex',
				IsActive: true
			})
		).toEqual({
			id: 7,
			name: 'Alex',
			isActive: true
		});

		expect(
			mapDstDropSheet({
				DropSheetID: 42,
				LoadNumber: 'L-100',
				LoadNum: '100',
				Trailer: 'TR-9',
				PercentCompleted: 87.5,
				LoadedTS: '2026-03-20T10:00:00Z',
				DropWeight: 1234.5,
				Driver: 12,
				DriverName: 'Dylan',
				AllLoaded: false,
				Loader: 'Alex'
			})
		).toEqual({
			id: 42,
			loadNumber: 'L-100',
			loadNumberShort: '100',
			trailer: 'TR-9',
			percentCompleted: 87.5,
			loadedAt: '2026-03-20T10:00:00Z',
			dropWeight: 1234.5,
			driverId: 12,
			driverName: 'Dylan',
			allLoaded: false,
			loaderName: 'Alex'
		});
	});

	it('maps drop areas and load views into stable camelCase records', () => {
		expect(
			mapDstDropArea({
				DropAreaID: 5,
				DropArea: 'R12',
				WrapLocation: false,
				PartLocation: true,
				RollLocation: true,
				loadLocation: true,
				driverLocation: false,
				firstCharacter: 'R'
			})
		).toEqual({
			id: 5,
			name: 'R12',
			supportsWrap: false,
			supportsParts: true,
			supportsRoll: true,
			supportsLoading: true,
			supportsDriverLocation: false,
			firstCharacter: 'R'
		});

		expect(
			mapDstLoadViewDetail({
				DropSequence: 3,
				DropSheetID: 42,
				DropSheetCustID: 84,
				LoadNumber: 'L-100',
				LoadDate: '2026-03-20',
				LocationID: 1,
				DSSequence: 9,
				fkCustomerID: 222,
				CustomerName: 'Acme',
				Driver: 'Dylan',
				TotalCount: '12/20',
				LabelCount: 20,
				Scanned: 12,
				NeedPick: 8
			})
		).toEqual({
			dropSequence: 3,
			dropSheetId: 42,
			dropSheetCustomerId: 84,
			loadNumber: 'L-100',
			loadDate: '2026-03-20',
			locationId: 1,
			sequence: 9,
			customerId: 222,
			customerName: 'Acme',
			driverName: 'Dylan',
			totalCountText: '12/20',
			labelCount: 20,
			scannedCount: 12,
			needPickCount: 8
		});

		expect(
			mapDstLoadViewUnion({
				FirstOfPartListID: 'PL-1',
				LabelNumber: 77,
				OrderSoNumber: 'SO-9',
				LoadNumber: 'L-100',
				DSSequence: 9,
				DropArea: 'R12',
				Scanned: true,
				LocationID: 1,
				length: '10ft',
				CategoryID: 3,
				LPID: 999
			})
		).toEqual({
			partListId: 'PL-1',
			labelNumber: 77,
			orderSoNumber: 'SO-9',
			loadNumber: 'L-100',
			sequence: 9,
			dropAreaName: 'R12',
			scanned: true,
			locationId: 1,
			lengthText: '10ft',
			categoryId: 3,
			lpid: 999
		});
	});

	it('normalizes department status payloads from both supported dst scopes', () => {
		expect(
			mapDstDepartmentStatusFromDrop({
				CustDropSheetID: 55,
				StatusOnLoadSlit: 'DUE',
				StatusOnLoadTrim: 'STOP',
				StatusOnLoadWrap: 'READY',
				StatusOnLoadRoll: 'DONE',
				StatusOnLoadPart: null,
				StatusOnLoadSoffit: null
			})
		).toEqual({
			scope: 'drop',
			subjectId: 55,
			slit: 'DUE',
			trim: 'STOP',
			wrap: 'READY',
			roll: 'DONE',
			parts: null,
			soffit: null
		});

		expect(
			mapDstDepartmentStatusFromDropSheet({
				DropSheetID: 42,
				StatusOnLoadSlitDS: 'DUE',
				StatusOnLoadTrimDS: 'STOP',
				StatusOnLoadWrapDS: 'READY',
				StatusOnLoadRollDS: 'DONE',
				StatusOnLoadPartDS: 'WAIT',
				StatusOnLoadSoffitDS: null
			})
		).toEqual({
			scope: 'dropsheet',
			subjectId: 42,
			slit: 'DUE',
			trim: 'STOP',
			wrap: 'READY',
			roll: 'DONE',
			parts: 'WAIT',
			soffit: null
		});
	});

	it('maps staging day rows into a stable canonical list item', () => {
		expect(
			mapDstStagingListItem({
				LPIDDetail: 12,
				PartListID: 'PL-42',
				PartListDesc: 'Trim coil',
				OrderSONumber: 'SO-100',
				QtyDet: 3,
				DropArea: 'R12',
				LPID: 99
			})
		).toEqual({
			lpidDetail: 12,
			partListId: 'PL-42',
			partListDescription: 'Trim coil',
			orderSoNumber: 'SO-100',
			quantity: 3,
			dropAreaName: 'R12',
			lpid: 99
		});
	});

	it('fails fast when staging rows omit the required identifier fields', () => {
		expect(() =>
			mapDstStagingListItem({
				LPIDDetail: null,
				PartListID: 'PL-42',
				PartListDesc: 'Trim coil',
				OrderSONumber: 'SO-100',
				QtyDet: 3,
				DropArea: 'R12',
				LPID: 99
			})
		).toThrow('mapDstStagingListItem: missing required ID fields');

		expect(() =>
			mapDstStagingListItem({
				LPIDDetail: 12,
				PartListID: 'PL-42',
				PartListDesc: 'Trim coil',
				OrderSONumber: 'SO-100',
				QtyDet: 3,
				DropArea: 'R12',
				LPID: null
			})
		).toThrow('mapDstStagingListItem: missing required ID fields');
	});

	it('normalizes category-list payloads to the canonical departments', () => {
		expect(
			mapDstCategoryList([
				'Roll',
				{ category: 'Wrap' },
				{ Department: 'Parts' },
				{ InventoryCategory: 'Slit' },
				{ inventoryCategory: 'Trim' }
			])
		).toEqual(['Roll', 'Wrap', 'Parts']);
	});
});

describe('dak record mappers', () => {
	it('maps loader info from dak-web into the shared session shape', () => {
		expect(
			mapDakLoaderInfo({
				LoaderID: 21,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Roll',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z'
			})
		).toEqual({
			id: 21,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Roll',
			loaderName: 'Alex',
			startedAt: '2026-03-20T10:00:00Z',
			endedAt: null
		});
	});

	it('preserves loader ids from start-session responses that use loader_id', () => {
		expect(
			mapDakLoaderSession({
				loader_id: 88,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Wrap',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z'
			})
		).toEqual({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Wrap',
			loaderName: 'Alex',
			startedAt: '2026-03-20T10:00:00Z',
			endedAt: null
		});
	});

	it('fails fast when dak-web returns a non-scannable operational department', () => {
		expect(() =>
			mapDakLoaderSession({
				loader_id: 88,
				fkDropSheetID: 42,
				fkLoaderID: 7,
				Department: 'Soffit',
				loader_name: 'Alex',
				started_at: '2026-03-20T10:00:00Z'
			})
		).toThrowError('Unsupported operational department: Soffit');
	});

	it('accepts needs-location scan payloads that omit scan_type', () => {
		expect(
			mapDakScanResult({
				status: 'needs-location',
				message: 'Location is required before staging.',
				needs_location: true
			})
		).toEqual({
			scanType: null,
			status: 'needs-location',
			message: 'Location is required before staging.',
			needsLocation: true,
			dropArea: null
		});
	});
});

describe('shared operational and scan contracts', () => {
	it('keeps session and request contracts aligned to the approved plan', () => {
		expectTypeOf<LoaderInfo>().toMatchTypeOf<LoaderSession>();
		expectTypeOf<LoaderSession['department']>().toEqualTypeOf<OperationalDepartment>();
		expectTypeOf<StagingScanRequest>().toMatchTypeOf<{
			scannedText: string;
			department: OperationalDepartment;
			dropAreaId?: number | null;
		}>();
		expectTypeOf<LoadingScanRequest>().toMatchTypeOf<{
			scannedText: string;
			department: OperationalDepartment;
			dropAreaId?: number | null;
			loadNumber: string;
			loaderName: string;
		}>();
		expectTypeOf<DepartmentStatus['scope']>().toEqualTypeOf<'drop' | 'dropsheet'>();
		expectTypeOf<ScanResult>().toMatchTypeOf<{
			scanType: 'location' | 'pallet' | 'single_label' | null;
			status: string;
			message: string;
			needsLocation: boolean;
			dropArea: {
				id: number;
				label: string;
			} | null;
		}>();
		expectTypeOf<StagingListItem>().toMatchTypeOf<{
			lpidDetail: number;
			partListId: string;
			partListDescription: string;
			orderSoNumber: string;
			quantity: number;
			dropAreaName: string;
			lpid: number;
		}>();
		expect(true).toBe(true);
	});
});
