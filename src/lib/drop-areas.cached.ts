import { getTargetLookupCacheQualifier } from '$lib/browser-cache';
import type { Target } from '$lib/auth/types';
import { getDropAreasByDepartment as getDropAreasByDepartmentRemote } from '$lib/drop-areas.remote';
import type { OperationalDepartment } from '$lib/types';

export function getDropAreasByDepartment(
	department: OperationalDepartment,
	target: Target | null | undefined = null
) {
	return getDropAreasByDepartmentRemote({
		department,
		targetCacheKey: getTargetLookupCacheQualifier(target) ?? 'default'
	});
}
