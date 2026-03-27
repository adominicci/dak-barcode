import { command, query } from '$app/server';
import {
	checkDstPalletBelongsToLpid,
	checkPalletBelongsToLpidInputSchema,
	dropSheetIdSchema,
	getDstLpidForPalletLoad,
	getDstLegacyLoadViewAll,
	getDstLegacyMoveOrdersRows,
	getDstLegacyOrderStatusRows,
	getLpidForPalletLoadInputSchema,
	legacyMoveOrdersInputSchema,
	legacyOrderStatusInputSchema,
	updateDstPalletLoad,
	updateDstSingleLabelLoad,
	updatePalletLoadInputSchema,
	updateSingleLabelLoadInputSchema
} from '$lib/server/dst-queries';

export const getLegacyLoadViewAll = query(dropSheetIdSchema, async (dropSheetId) =>
	getDstLegacyLoadViewAll({ dropSheetId })
);

export const getLegacyOrderStatusRows = query(legacyOrderStatusInputSchema, async (input) =>
	getDstLegacyOrderStatusRows(input)
);

export const getLegacyMoveOrdersRows = query(legacyMoveOrdersInputSchema, async (input) =>
	getDstLegacyMoveOrdersRows(input)
);

export const getLpidForPalletLoad = command(getLpidForPalletLoadInputSchema, async (input) =>
	getDstLpidForPalletLoad(input)
);

export const checkPalletBelongsToLpid = command(
	checkPalletBelongsToLpidInputSchema,
	async (input) => checkDstPalletBelongsToLpid(input)
);

export const updatePalletLoad = command(updatePalletLoadInputSchema, async (input) =>
	updateDstPalletLoad(input)
);

export const updateSingleLabelLoad = command(updateSingleLabelLoadInputSchema, async (input) =>
	updateDstSingleLabelLoad(input)
);
