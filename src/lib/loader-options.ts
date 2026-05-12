import type { Loader } from '$lib/types';

export type LoaderPickerOption = {
	id: number;
	label: string;
};

export function getActiveLoaderOptions(loaders: Loader[]): LoaderPickerOption[] {
	return loaders
		.filter((loader) => loader.isActive === true)
		.map((loader) => ({
			id: loader.id,
			label: loader.name
		}));
}
