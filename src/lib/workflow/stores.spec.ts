import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { createWorkflowStores } from './stores';

describe('createWorkflowStores', () => {
	it('starts with empty workflow state', () => {
		const stores = createWorkflowStores();

		expect(get(stores.activeTarget)).toBeNull();
		expect(get(stores.currentLoader)).toBeNull();
		expect(get(stores.selectedDepartment)).toBeNull();
		expect(get(stores.currentDropArea)).toBeNull();
		expect(get(stores.currentLoadingHeaderContext)).toBeNull();
		expect(get(stores.scannedText)).toBe('');
	});

	it('keeps separate store instances isolated', () => {
		const first = createWorkflowStores();
		const second = createWorkflowStores();

		first.syncActiveTarget('Canton');
		first.setCurrentLoader({ loaderId: 17, loaderName: 'Loader 17' });
		first.setSelectedDepartment('Roll');
		first.setCurrentDropArea({ dropAreaId: 4, dropAreaLabel: 'Door 4' });
		first.setCurrentLoadingHeaderContext({ driverName: 'Driver 17', dropWeight: 17.5 });
		first.setScannedText('123456');

		expect(get(second.activeTarget)).toBeNull();
		expect(get(second.currentLoader)).toBeNull();
		expect(get(second.selectedDepartment)).toBeNull();
		expect(get(second.currentDropArea)).toBeNull();
		expect(get(second.currentLoadingHeaderContext)).toBeNull();
		expect(get(second.scannedText)).toBe('');
	});

	it('updates and clears each workflow field through explicit actions', () => {
		const stores = createWorkflowStores();

		stores.syncActiveTarget('Freeport');
		stores.setCurrentLoader({ loaderId: 3, loaderName: 'Loader 3' });
		stores.setSelectedDepartment('Wrap');
		stores.setCurrentDropArea({ dropAreaId: 9, dropAreaLabel: 'Driver 9' });
		stores.setCurrentLoadingHeaderContext({ driverName: 'Driver 9', dropWeight: 9.5 });
		stores.setScannedText('LP-42');

		expect(get(stores.activeTarget)).toBe('Freeport');
		expect(get(stores.currentLoader)).toEqual({ loaderId: 3, loaderName: 'Loader 3' });
		expect(get(stores.selectedDepartment)).toBe('Wrap');
		expect(get(stores.currentDropArea)).toEqual({ dropAreaId: 9, dropAreaLabel: 'Driver 9' });
		expect(get(stores.currentLoadingHeaderContext)).toEqual({
			driverName: 'Driver 9',
			dropWeight: 9.5
		});
		expect(get(stores.scannedText)).toBe('LP-42');

		stores.clearCurrentLoader();
		stores.clearSelectedDepartment();
		stores.clearCurrentDropArea();
		stores.clearCurrentLoadingHeaderContext();
		stores.clearScannedText();

		expect(get(stores.activeTarget)).toBe('Freeport');
		expect(get(stores.currentLoader)).toBeNull();
		expect(get(stores.selectedDepartment)).toBeNull();
		expect(get(stores.currentDropArea)).toBeNull();
		expect(get(stores.currentLoadingHeaderContext)).toBeNull();
		expect(get(stores.scannedText)).toBe('');
	});

	it('resets operational state while preserving the active target', () => {
		const stores = createWorkflowStores();

		stores.syncActiveTarget('Sandbox');
		stores.setCurrentLoader({ loaderId: 12, loaderName: 'Loader 12' });
		stores.setSelectedDepartment('Parts');
		stores.setCurrentDropArea({ dropAreaId: 5, dropAreaLabel: 'Drop 5' });
		stores.setCurrentLoadingHeaderContext({ driverName: 'Driver 5', dropWeight: 5.5 });
		stores.setScannedText('ABC-123');

		stores.resetOperationalState();

		expect(get(stores.activeTarget)).toBe('Sandbox');
		expect(get(stores.currentLoader)).toBeNull();
		expect(get(stores.selectedDepartment)).toBeNull();
		expect(get(stores.currentDropArea)).toBeNull();
		expect(get(stores.currentLoadingHeaderContext)).toBeNull();
		expect(get(stores.scannedText)).toBe('');
	});

	it('prepares for staging entry by clearing stale workflow state and preserving the active target', () => {
		const stores = createWorkflowStores();

		stores.syncActiveTarget('Canton');
		stores.setCurrentLoader({ loaderId: 21, loaderName: 'Loader 21' });
		stores.setSelectedDepartment('Roll');
		stores.setCurrentDropArea({ dropAreaId: 2, dropAreaLabel: 'Staging 2' });
		stores.setCurrentLoadingHeaderContext({ driverName: 'Driver 2', dropWeight: 2.5 });
		stores.setScannedText('STALE-STAGING');

		stores.prepareForStagingEntry();

		expect(get(stores.activeTarget)).toBe('Canton');
		expect(get(stores.currentLoader)).toBeNull();
		expect(get(stores.selectedDepartment)).toBeNull();
		expect(get(stores.currentDropArea)).toBeNull();
		expect(get(stores.currentLoadingHeaderContext)).toBeNull();
		expect(get(stores.scannedText)).toBe('');
	});

	it('prepares for loading entry by preserving loader and department while clearing scan state', () => {
		const stores = createWorkflowStores();

		stores.syncActiveTarget('Freeport');
		stores.setCurrentLoader({ loaderId: 30, loaderName: 'Loader 30' });
		stores.setSelectedDepartment('Parts');
		stores.setCurrentDropArea({ dropAreaId: 11, dropAreaLabel: 'Driver 11' });
		stores.setCurrentLoadingHeaderContext({ driverName: 'Driver 11', dropWeight: 11.5 });
		stores.setScannedText('STALE-LOADING');

		stores.prepareForLoadingEntry();

		expect(get(stores.activeTarget)).toBe('Freeport');
		expect(get(stores.currentLoader)).toEqual({ loaderId: 30, loaderName: 'Loader 30' });
		expect(get(stores.selectedDepartment)).toBe('Parts');
		expect(get(stores.currentDropArea)).toBeNull();
		expect(get(stores.currentLoadingHeaderContext)).toBeNull();
		expect(get(stores.scannedText)).toBe('');
	});
});
