import { createCachedRemoteQuery, lookupCacheKey } from '$lib/browser-cache';
import { getDropAreasByDepartment as getDropAreasByDepartmentRemote } from '$lib/drop-areas.remote';
import type { OperationalDepartment } from '$lib/types';

export function getDropAreasByDepartment(department: OperationalDepartment) {
	return createCachedRemoteQuery(
		getDropAreasByDepartmentRemote(department),
		lookupCacheKey('drop-areas', department)
	);
}
