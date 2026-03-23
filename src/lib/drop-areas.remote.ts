import { query } from '$app/server';
import {
	departmentSchema,
	dropAreaIdSchema,
	getDstDropArea,
	getDstDropAreasByDepartment
} from '$lib/server/dst-queries';

export const getDropArea = query(dropAreaIdSchema, async (dropAreaId) => getDstDropArea(dropAreaId));

export const getDropAreasByDepartment = query(departmentSchema, async (department) =>
	getDstDropAreasByDepartment(department)
);
