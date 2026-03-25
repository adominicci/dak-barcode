import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { get } from 'svelte/store';
import { workflowStores } from '$lib/workflow/stores';
import StagingPage from './+page.svelte';

describe('staging page department gate', () => {
	beforeEach(() => {
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
	});

	it('shows the blocking department gate and keeps scan controls disabled on entry', async () => {
		render(StagingPage);

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		await expect.element(page.getByTestId('staging-scan-input')).toBeDisabled();
		await expect.element(page.getByTestId('staging-location-trigger')).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Wrap' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Parts' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Roll' })).toBeInTheDocument();
	});

	it('resets stale workflow state on entry and stores the new department choice', async () => {
		workflowStores.setCurrentLoader({ loaderId: 12, loaderName: 'Loader 12' });
		workflowStores.setSelectedDepartment('Parts');
		workflowStores.setCurrentDropArea({ dropAreaId: 5, dropAreaLabel: 'Drop 5' });
		workflowStores.setScannedText('STALE-SCAN');

		render(StagingPage);

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		expect(get(workflowStores.currentLoader)).toBeNull();
		expect(get(workflowStores.selectedDepartment)).toBeNull();
		expect(get(workflowStores.currentDropArea)).toBeNull();
		expect(get(workflowStores.scannedText)).toBe('');

		await page.getByRole('button', { name: 'Roll' }).click();

		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();
		expect(get(workflowStores.selectedDepartment)).toBe('Roll');
		await expect.element(page.getByTestId('staging-department-trigger')).toHaveTextContent('Roll');
		await expect.element(page.getByTestId('staging-scan-input')).not.toBeDisabled();
	});
});
