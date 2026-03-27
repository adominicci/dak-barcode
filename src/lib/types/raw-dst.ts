export type RawDstLoader = {
	LoaderID: number;
	Loader: string;
	IsActive: boolean;
};

export type RawDstTrailer = {
	TrailerID: number;
	Trailer: string;
};

export type RawDstDropSheet = {
	DropSheetID: number;
	LoadNumber: string;
	LoadNum?: string | null;
	Trailer?: string | null;
	PercentCompleted?: number | null;
	LoadedTS?: string | null;
	DropWeight?: number | null;
	Driver?: number | null;
	DriverName?: string | null;
	AllLoaded?: boolean | null;
	Loader?: string | null;
};

export type RawDstDropArea = {
	DropAreaID: number;
	DropArea: string;
	WrapLocation?: boolean | null;
	wrapLocation?: boolean | null;
	PartLocation?: boolean | null;
	partLocation?: boolean | null;
	RollLocation?: boolean | null;
	rollLocation?: boolean | null;
	LoadLocation?: boolean | null;
	loadLocation?: boolean | null;
	DriverLocation?: boolean | null;
	driverLocation?: boolean | null;
	firstCharacter?: string | null;
};

export type RawDstLoadViewDetail = {
	DropSequence: number;
	DropSheetID: number;
	DropSheetCustID: number;
	LoadNumber: string;
	LoadDate?: string | null;
	LocationID: number;
	DSSequence: number;
	fkCustomerID?: number | null;
	CustomerName: string;
	Driver?: string | null;
	TotalCount?: string | null;
	LabelCount: number;
	Scanned: number;
	NeedPick: number;
};

export type RawDstLoadViewUnion = {
	FirstOfPartListID?: string | null;
	LabelNumber?: number | null;
	OrderSoNumber?: string | null;
	LoadNumber: string;
	DSSequence: number;
	DropArea?: string | null;
	Scanned: boolean;
	LocationID: number;
	length?: string | null;
	CategoryID?: number | null;
	LPID?: number | null;
};

export type RawDstLegacyLoadViewAllEntry = {
	DropSheetID: number;
	Dropsheetcustid?: number | null;
	DSSequence?: string | null;
	LoadNumber?: string | null;
	Driver?: string | null;
	Status?: string | null;
};

export type RawDstLegacyOrderStatusRow = {
	DropSheetCustID: number;
	OrderSONumber?: string | null;
	CustomerName?: string | null;
	fkDropSheetID: number;
	DSSequence: number;
	OrderSlitterStatus?: string | null;
	OrderTrimStatus?: string | null;
	OrderWrapStatus?: string | null;
	OrderPartStatus?: string | null;
	OrderRollStatus?: string | null;
	OrderSoffitStatus?: string | null;
	StatusSort?: number | null;
};

export type RawDstLegacyMoveOrderRow = {
	DropSheetCustID: number;
	PartListID?: string | null;
	QtyDet?: string | null;
	LabelNumber?: number | null;
	Scanned?: boolean | null;
	OrderSONumber?: string | null;
	CustomerName?: string | null;
	LoadingLocationID: number;
	DropArea?: string | null;
	dropArea?: string | null;
	PartColor?: string | null;
	fkDropSheetID: number;
	RecordType: number;
	LPID: number;
	DSSequence: number;
	Unload?: boolean | null;
	UnloadManualScan?: boolean | null;
};

export type RawDstPalletLpidLookupRow = {
	LPID: number;
};

export type RawDstPalletBelongsToLpid = {
	LPID: number;
	PalletID: number;
	PalletLabel?: string | null;
	PalletScan?: boolean | null;
};

export type RawDstDepartmentStatusOnDrop = {
	CustDropSheetID: number;
	StatusOnLoadSlit?: string | null;
	StatusOnLoadTrim?: string | null;
	StatusOnLoadWrap?: string | null;
	StatusOnLoadRoll?: string | null;
	StatusOnLoadPart?: string | null;
	StatusOnLoadSoffit?: string | null;
};

export type RawDstDepartmentStatusOnDropSheet = {
	DropSheetID: number;
	StatusOnLoadSlitDS?: string | null;
	StatusOnLoadTrimDS?: string | null;
	StatusOnLoadWrapDS?: string | null;
	StatusOnLoadRollDS?: string | null;
	StatusOnLoadPartDS?: string | null;
	StatusOnLoadSoffitDS?: string | null;
};

export type RawDstDropSheetCategoryAvailability = {
	DropSheetID: number;
	RollScannedPercent?: number | null;
	RollHasLabels?: number | null;
	WrapScannedPercent?: number | null;
	WrapHasLabels?: number | null;
	PartHasLabels?: number | null;
	// DST returns this misspelled field name without the expected capital "S".
	PartcannedPercent?: number | null;
	AllLoaded?: boolean | null;
};

export type RawDstStagingListItem = {
	LPIDDetail?: number | null;
	PartListID?: string | null;
	PartListDesc?: string | null;
	OrderSONumber?: string | null;
	QtyDet?: number | null;
	DropArea?: string | null;
	LPID?: number | null;
};

export type RawDstCategoryListEntry =
	| string
	| {
			Category?: string | null;
			category?: string | null;
			Department?: string | null;
			department?: string | null;
			InventoryCategory?: string | null;
			inventoryCategory?: string | null;
			Name?: string | null;
			name?: string | null;
	  };
