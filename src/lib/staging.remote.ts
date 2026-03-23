import { query } from '$app/server';
import {
	getDstStagingPartsForDay,
	getDstStagingPartsForDayRoll,
	orderSoNumberSchema
} from '$lib/server/dst-queries';

export const getStagingPartsForDay = query(async () => getDstStagingPartsForDay());

export const getStagingPartsForDayRoll = query(orderSoNumberSchema, async (orderSoNumber) =>
	getDstStagingPartsForDayRoll(orderSoNumber)
);
