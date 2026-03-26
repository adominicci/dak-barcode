import { describe, expect, it } from 'vitest';
import type { LoaderInfo } from '$lib/types';
import {
	buildEndLoaderSessionInput,
	hasLoadingWorkflowContext,
	parseLoadingEntryContext,
	toNavigationHref
} from './loading-lifecycle';

function createLoaderInfo(overrides: Partial<LoaderInfo> = {}): LoaderInfo {
	return {
		id: 88,
		dropSheetId: 42,
		loaderId: 7,
		department: 'Wrap',
		loaderName: 'Alex',
		startedAt: '2026-03-26T12:00:00.000Z',
		endedAt: null,
		...overrides
	};
}

describe('loading lifecycle helpers', () => {
	it('parses a complete loading entry context from the route URL', () => {
		const url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88'
		);

		expect(parseLoadingEntryContext(url)).toEqual({
			dropSheetId: 42,
			locationId: 2,
			loaderSessionId: 88
		});
	});

	it('rejects missing or invalid loading entry params', () => {
		expect(
			parseLoadingEntryContext(new URL('https://app.local/loading?dropsheetId=42&locationId=2'))
		).toBeNull();
		expect(
			parseLoadingEntryContext(
				new URL('https://app.local/loading?dropsheetId=42&locationId=abc&loaderSessionId=88')
			)
		).toBeNull();
	});

	it('requires both department and loader workflow context for a valid loading entry', () => {
		expect(
			hasLoadingWorkflowContext({
				selectedDepartment: 'Wrap',
				currentLoader: { loaderId: 7, loaderName: 'Alex' }
			})
		).toBe(true);
		expect(
			hasLoadingWorkflowContext({
				selectedDepartment: null,
				currentLoader: { loaderId: 7, loaderName: 'Alex' }
			})
		).toBe(false);
		expect(
			hasLoadingWorkflowContext({
				selectedDepartment: 'Wrap',
				currentLoader: null
			})
		).toBe(false);
	});

	it('builds the end-session payload from resolved loader info', () => {
		expect(buildEndLoaderSessionInput(createLoaderInfo(), '2026-03-26T12:05:00.000Z')).toEqual({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Wrap',
			loaderName: 'Alex',
			startedAt: '2026-03-26T12:00:00.000Z',
			endedAt: '2026-03-26T12:05:00.000Z'
		});
		expect(
			buildEndLoaderSessionInput(createLoaderInfo({ id: null }), '2026-03-26T12:05:00.000Z')
		).toBeNull();
	});

	it('normalizes navigation targets back into an internal href', () => {
		const url = new URL('https://app.local/home?tab=active#summary');

		expect(toNavigationHref(url)).toBe('/home?tab=active#summary');
	});
});
