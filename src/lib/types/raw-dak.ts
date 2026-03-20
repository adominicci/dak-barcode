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

export type RawDakStagingScanRequest = {
	scanned_text: string;
	department: string;
	drop_area_id: number;
};

export type RawDakLoadingScanRequest = RawDakStagingScanRequest & {
	load_number: string;
	loader_name: string;
};
