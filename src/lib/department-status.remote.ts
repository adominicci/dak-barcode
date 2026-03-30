import { query } from '$app/server';
import { dropSheetIdSchema, getDstDepartmentStatusOnDrop } from '$lib/server/dst-queries';
import { custDropSheetIdSchema, getDakOnLoadStatusAllDepts } from '$lib/server/dak-department-status';

export const getDepartmentStatus = query(custDropSheetIdSchema, async (custDropSheetId) =>
	getDstDepartmentStatusOnDrop(custDropSheetId)
);

export const getOnLoadStatusAllDepts = query(dropSheetIdSchema, async (dropSheetId) =>
	getDakOnLoadStatusAllDepts(dropSheetId)
);
