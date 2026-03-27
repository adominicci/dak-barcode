import { error } from '@sveltejs/kit';
import { getDstLoaders } from '$lib/server/dst-queries';
import { getDakLoadersForDropsheet } from '$lib/server/dak-loader-sessions';
import type { LoaderSession, OperationalDepartment } from '$lib/types';
import { parsePositiveNumber } from '$lib/workflow/loading-lifecycle';
import type { PageServerLoad } from './$types';

type DepartmentLoaderGroup = {
	department: OperationalDepartment;
	loaderNames: string[];
};

const DEPARTMENT_ORDER: OperationalDepartment[] = ['Wrap', 'Roll', 'Parts'];

function parseDropSheetId(value: string): number {
	if (!/^\d+$/.test(value)) {
		error(404, 'Dropsheet not found.');
	}

	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		error(404, 'Dropsheet not found.');
	}

	return parsed;
}

function parseLoadNumber(
	loadNumber: string | null | undefined,
	deliveryNumber: string | null | undefined,
	dropSheetId: number
): string {
	const trimmed = loadNumber?.trim() || deliveryNumber?.trim();

	if (trimmed) {
		return trimmed;
	}

	return String(dropSheetId);
}

function parseDriverName(driverName: string | null | undefined): string | null {
	const trimmed = driverName?.trim();
	return trimmed ? trimmed : null;
}

function buildEmptyDepartmentLoaderGroups(): DepartmentLoaderGroup[] {
	return DEPARTMENT_ORDER.map((department) => ({
		department,
		loaderNames: []
	}));
}

function buildDepartmentLoaderGroups(loaders: LoaderSession[]): DepartmentLoaderGroup[] {
	const loaderNamesByDepartment = new Map<OperationalDepartment, string[]>(
		DEPARTMENT_ORDER.map((department) => [department, []])
	);
	const seenByDepartment = new Map<OperationalDepartment, Set<string>>();

	for (const loader of loaders) {
		if (!loaderNamesByDepartment.has(loader.department)) {
			continue;
		}

		const loaderName = loader.loaderName.trim();

		if (!loaderName) {
			continue;
		}

		const seenNames = seenByDepartment.get(loader.department) ?? new Set<string>();

		if (seenNames.has(loaderName)) {
			continue;
		}

		seenNames.add(loaderName);
		seenByDepartment.set(loader.department, seenNames);
		loaderNamesByDepartment.get(loader.department)?.push(loaderName);
	}

	return DEPARTMENT_ORDER.map((department) => ({
		department,
		loaderNames: loaderNamesByDepartment.get(department) ?? []
	}));
}

export const load: PageServerLoad = async ({ params, url }) => {
	const dropSheetId = parseDropSheetId(params.dropsheetId);
	const loadersPromise = getDstLoaders().then((entries) => entries.filter((loader) => loader.isActive));
	const departmentLoadersPromise = getDakLoadersForDropsheet(dropSheetId);
	const loaders = await loadersPromise;
	let departmentLoaders = buildEmptyDepartmentLoaderGroups();
	let departmentLoadersError: string | null = null;

	try {
		departmentLoaders = buildDepartmentLoaderGroups(await departmentLoadersPromise);
	} catch (error) {
		departmentLoadersError =
			error instanceof Error ? error.message : 'Unable to load loader roster.';
		console.error('Failed to load department loaders for dropsheet', {
			dropSheetId,
			error
		});
	}
	const loadNumber = parseLoadNumber(
		url.searchParams.get('loadNumber'),
		url.searchParams.get('deliveryNumber'),
		dropSheetId
	);
	const driverName = parseDriverName(url.searchParams.get('driverName'));
	const dropWeight = parsePositiveNumber(url.searchParams.get('dropWeight'));

	return {
		dropSheetId,
		loadNumber,
		driverName,
		dropWeight,
		loaders,
		departmentLoaders,
		departmentLoadersError
	};
};
