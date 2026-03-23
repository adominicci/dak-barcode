import { query } from '$app/server';
import { getDstCategoryList } from '$lib/server/dst-queries';

export const getCategoryList = query(async () => getDstCategoryList());
