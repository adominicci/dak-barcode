import { query } from '$app/server';
import {
	getDstLoadViewDetail,
	getDstLoadViewDetailAll,
	getDstLoadViewUnion,
	getDstNumberOfDrops,
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

export const getNumberOfDrops = query(numberOfDropsInputSchema, async (input) =>
	getDstNumberOfDrops(input)
);
