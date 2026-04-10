import { describe, expect, it } from 'vitest';
import {
	clampLoadingDropIndex,
	createLoadingDropNavigationState,
	moveLoadingDropSelection
} from './loading-drop-navigation';

describe('loading drop navigation helpers', () => {
	it('creates the initial navigation state from the available drop count', () => {
		expect(createLoadingDropNavigationState(3)).toEqual({
			selectedIndex: 2,
			activeDropNumber: 3,
			totalDrops: 3,
			canGoPrevious: false,
			canGoNext: true
		});

		expect(createLoadingDropNavigationState(0)).toEqual({
			selectedIndex: -1,
			activeDropNumber: 0,
			totalDrops: 0,
			canGoPrevious: false,
			canGoNext: false
		});
	});

	it('clamps arbitrary indexes to the valid drop bounds', () => {
		expect(clampLoadingDropIndex(-4, 3)).toBe(0);
		expect(clampLoadingDropIndex(1, 3)).toBe(1);
		expect(clampLoadingDropIndex(99, 3)).toBe(2);
		expect(clampLoadingDropIndex(0, 0)).toBe(-1);
	});

	it('moves through drops in reverse numeric order without crossing the first or last drop', () => {
		expect(moveLoadingDropSelection({ selectedIndex: 2, totalDrops: 3, direction: 'previous' })).toBe(2);
		expect(moveLoadingDropSelection({ selectedIndex: 2, totalDrops: 3, direction: 'next' })).toBe(1);
		expect(moveLoadingDropSelection({ selectedIndex: 0, totalDrops: 3, direction: 'next' })).toBe(0);
		expect(moveLoadingDropSelection({ selectedIndex: 0, totalDrops: 3, direction: 'previous' })).toBe(1);
		expect(moveLoadingDropSelection({ selectedIndex: -1, totalDrops: 0, direction: 'next' })).toBe(-1);
	});
});
