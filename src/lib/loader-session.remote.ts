import { command, query } from '$app/server';
import {
	dropSheetIdSchema,
	endDakLoaderSession,
	getDakLoaderInfo,
	getDakLoadersForDropsheet,
	loaderIdSchema,
	loaderSessionEndInputSchema,
	loaderSessionUpsertInputSchema,
	upsertDakLoaderSession
} from '$lib/server/dak-loader-sessions';

export const getLoaderInfo = query(loaderIdSchema, async (loaderId) => getDakLoaderInfo(loaderId));

export const getLoadersForDropsheet = query(dropSheetIdSchema, async (dropSheetId) =>
	getDakLoadersForDropsheet(dropSheetId)
);

export const upsertLoaderSession = command(loaderSessionUpsertInputSchema, async (input) =>
	upsertDakLoaderSession(input)
);

export const endLoaderSession = command(loaderSessionEndInputSchema, async (input) =>
	endDakLoaderSession(input)
);
