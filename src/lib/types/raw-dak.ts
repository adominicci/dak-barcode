import type {
	RawDstLoadViewBarcodeCounters,
	RawDstLoadViewDetail,
	RawDstLoadViewUnion
} from './raw-dst';

export type RawDakLoaderInfo = {
	LoaderID: number;
	fkDropSheetID: number;
	fkLoaderID: number;
	Department: string;
	loader_name: string;
	started_at: string;
	ended_at?: string | null;
};

export type RawDakLoaderSession = {
	LoaderID?: number | null;
	loader_id?: number | null;
	fkDropSheetID: number;
	fkLoaderID: number;
	Department: string;
	loader_name: string;
	started_at: string;
	ended_at?: string | null;
};

export type RawDakEquipment = {
	id: string;
	equipment_name: string;
	photo_url?: string | null;
	equipment_category: string;
	location: string;
};

export type RawDakDepartmentStatus = {
	drop_sheet_id?: number | null;
	dropSheetId?: number | null;
	DropSheetID?: number | null;
	slit?: string | null;
	trim?: string | null;
	wrap?: string | null;
	roll?: string | null;
	parts?: string | null;
	part?: string | null;
	soffit?: string | null;
	is_blocked?:
		| {
				wrap?: boolean | null;
				roll?: boolean | null;
				parts?: boolean | null;
		  }
		| null;
};

export type RawDakStagingScanRequest = {
	scanned_text: string;
	department: string;
	drop_area_id?: number | null;
};

export type RawDakLoadingScanRequest = RawDakStagingScanRequest & {
	load_number: string;
	loader_name: string;
};

export type RawDakScanDropArea = {
	drop_area_id?: number | null;
	id?: number | null;
	DropAreaID?: number | null;
	drop_area?: string | null;
	dropArea?: string | null;
	label?: string | null;
	name?: string | null;
	DropArea?: string | null;
};

export type RawDakScanResult = {
	scan_type?: string | null;
	scanType?: string | null;
	status?: string | null;
	message?: string | null;
	need_pick?: number | null;
	needPick?: number | null;
	needs_location?: boolean | null;
	needsLocation?: boolean | null;
	drop_area?: RawDakScanDropArea | null;
	dropArea?: RawDakScanDropArea | null;
};

type RawCustomerPortalLoadingRefreshKey = {
	load_number?: string | null;
	loadNumber?: string | null;
	sequence?: number | null;
	location_id?: number | null;
	locationId?: number | null;
};

export type RawCustomerPortalLoadingScanResult = RawDakScanResult & {
	load_view_detail_all?: RawDstLoadViewDetail[] | null;
	loadViewDetailAll?: RawDstLoadViewDetail[] | null;
	load_view_union?: RawDstLoadViewUnion[] | null;
	loadViewUnion?: RawDstLoadViewUnion[] | null;
	load_view_union_key?: RawCustomerPortalLoadingRefreshKey | null;
	loadViewUnionKey?: RawCustomerPortalLoadingRefreshKey | null;
	load_view_barcode_counters?: RawDstLoadViewBarcodeCounters | null;
	loadViewBarcodeCounters?: RawDstLoadViewBarcodeCounters | null;
};
