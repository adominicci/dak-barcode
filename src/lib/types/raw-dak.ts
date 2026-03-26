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
	needs_location?: boolean | null;
	needsLocation?: boolean | null;
	drop_area?: RawDakScanDropArea | null;
	dropArea?: RawDakScanDropArea | null;
};
