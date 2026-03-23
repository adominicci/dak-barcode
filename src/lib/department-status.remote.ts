import { query } from '$app/server';
import {
	custDropSheetIdSchema,
	dropSheetIdSchema,
	getDakDepartmentStatus,
	getDakOnLoadStatusAllDepts
} from '$lib/server/dak-department-status';

export const getDepartmentStatus = query(custDropSheetIdSchema, async (custDropSheetId) =>
	getDakDepartmentStatus(custDropSheetId)
);

export const getOnLoadStatusAllDepts = query(dropSheetIdSchema, async (dropSheetId) =>
	getDakOnLoadStatusAllDepts(dropSheetId)
);
