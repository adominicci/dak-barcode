export type RawDstLoader = {
	LoaderID: number;
	Loader: string;
	IsActive: boolean;
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
	DriverLocation?: boolean | null;
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
