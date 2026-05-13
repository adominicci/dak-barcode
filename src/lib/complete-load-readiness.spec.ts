import { describe, expect, it } from 'vitest';

import { isCompleteLoadReadyForDisplay } from './complete-load-readiness';
import type { DepartmentStatus, DropSheetCategoryAvailability } from '$lib/types';

const loadedAvailability: DropSheetCategoryAvailability = {
	dropSheetId: 42,
	rollScannedPercent: 1,
	rollHasLabels: 4,
	wrapScannedPercent: 1,
	wrapHasLabels: 6,
	partsHasLabels: 3,
	partsScannedPercent: 1,
	allLoaded: true
};

const closedStatus: DepartmentStatus = {
	scope: 'dropsheet',
	subjectId: 42,
	slit: 'DONE',
	trim: 'NA',
	wrap: 'DONE',
	roll: 'DONE',
	parts: 'DONE',
	soffit: 'NA'
};

describe('complete load readiness', () => {
	it('allows completion only when allLoaded is true and every department is NA or DONE', () => {
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 1,
				categoryAvailability: loadedAvailability,
				departmentStatus: closedStatus
			})
		).toBe(true);
	});

	it('allows completion when live loading-category progress is complete before AllLoaded is checked', () => {
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 0.875,
				categoryAvailability: {
					...loadedAvailability,
					allLoaded: false
				},
				departmentStatus: closedStatus
			})
		).toBe(true);
	});

	it.each([
		['DUE'],
		['READY'],
		['WAIT'],
		['STOP'],
		['BOT'],
		['BOL'],
		[''],
		[null]
	])('blocks completion when a department status is %s', (rollStatus) => {
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 1,
				categoryAvailability: loadedAvailability,
				departmentStatus: {
					...closedStatus,
					roll: rollStatus
				}
			})
		).toBe(false);
	});

	it('blocks completion when live loading-category progress is not complete', () => {
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 0.875,
				categoryAvailability: {
					...loadedAvailability,
					allLoaded: false,
					rollScannedPercent: 0.75
				},
				departmentStatus: closedStatus
			})
		).toBe(false);
	});

	it('blocks completion while readiness data is unavailable', () => {
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 0.875,
				categoryAvailability: null,
				departmentStatus: closedStatus
			})
		).toBe(false);
		expect(
			isCompleteLoadReadyForDisplay({
				percentCompleted: 1,
				categoryAvailability: loadedAvailability,
				departmentStatus: null
			})
		).toBe(false);
	});
});
