import type { PageServerLoad } from './$types';

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function isDateValue(value: string | null | undefined): value is string {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export const load: PageServerLoad = async ({ url }) => {
	const dateParam = url.searchParams.get('date');

	return {
		selectedDate: isDateValue(dateParam) ? dateParam : getTodayDateValue()
	};
};
