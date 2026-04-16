import * as v from 'valibot';
import { query } from '$app/server';
import {
	departmentSchema,
	dropAreaIdSchema,
	getDstDropArea,
	getDstDropAreasByDepartment
} from '$lib/server/dst-queries';

export const getDropArea = query(dropAreaIdSchema, async (dropAreaId) => getDstDropArea(dropAreaId));

const dropAreasByDepartmentInputSchema = v.object({
	department: departmentSchema,
	targetCacheKey: v.pipe(v.string(), v.trim(), v.nonEmpty('Target cache key is required.'))
});

export const getDropAreasByDepartment = query(dropAreasByDepartmentInputSchema, async (input) =>
	getDstDropAreasByDepartment(input.department)
);
