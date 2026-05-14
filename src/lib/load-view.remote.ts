import { query } from '$app/server';
import {
	getDstLoadViewBarcodeCounters,
	getDstLoadViewDetail,
	getDstLoadViewDetailAll,
	getDstLoadViewUnion,
	getDstNumberOfDrops,
	loadViewBarcodeCountersInputSchema,
	loadViewDetailAllInputSchema,
	loadViewDetailInputSchema,
	loadViewUnionInputSchema,
	numberOfDropsInputSchema
} from '$lib/server/dst-queries';

export const getLoadViewDetail = query(loadViewDetailInputSchema, async (input) =>
	getDstLoadViewDetail(input)
);

export const getLoadViewUnion = query(loadViewUnionInputSchema, async (input) =>
	getDstLoadViewUnion(input)
);

export const getLoadViewDetailAll = query(loadViewDetailAllInputSchema, async (input) =>
	getDstLoadViewDetailAll(input)
);

export const getLoadViewBarcodeCounters = query(
	loadViewBarcodeCountersInputSchema,
	async (input) => getDstLoadViewBarcodeCounters(input)
);

export const getNumberOfDrops = query(numberOfDropsInputSchema, async (input) =>
	getDstNumberOfDrops(input)
);
