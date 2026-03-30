import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { get } from 'svelte/store';
import type { DropArea, ScanResult } from '$lib/types';
import { workflowStores } from '$lib/workflow/stores';

type StagingQueryState = {
	current: Array<{
		lpidDetail: number;
		partListId: string;
		partListDescription: string;
		orderSoNumber: string;
		quantity: number;
		dropAreaName: string;
		lpid: number;
	}> | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type DropAreaListQueryState = {
	current: DropArea[] | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

	const {
		goto,
		getStagingPartsForDay,
		getStagingPartsForDayRoll,
		getDropAreasByDepartment,
	getDropArea,
	processStagingScan
	} = vi.hoisted(() => ({
		goto: vi.fn(),
		getStagingPartsForDay: vi.fn<() => StagingQueryState>(),
	getStagingPartsForDayRoll: vi.fn<(orderSoNumber?: string | null) => StagingQueryState>(),
	getDropAreasByDepartment: vi.fn<(department: 'Roll' | 'Wrap' | 'Parts') => DropAreaListQueryState>(),
	getDropArea: vi.fn<(dropAreaId: number) => Promise<DropArea | null>>(),
	processStagingScan: vi.fn<
		(input: {
			scannedText: string;
			department: 'Roll' | 'Wrap' | 'Parts';
			dropAreaId?: number | null;
		}) => Promise<ScanResult>
	>()
}));

const { withTimeout } = vi.hoisted(() => ({
	withTimeout: vi.fn(async <T>(promise: Promise<T>) => promise)
}));

const { toast } = vi.hoisted(() => ({
	toast: {
		success: vi.fn<(message: string) => void>()
	}
}));

vi.mock('$lib/staging.remote', () => ({
	getStagingPartsForDay,
	getStagingPartsForDayRoll
}));

vi.mock('$lib/drop-areas.remote', () => ({
	getDropAreasByDepartment,
	getDropArea
}));

vi.mock('$lib/scan.remote', () => ({
	processStagingScan
}));

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$lib/workflow/async-timeout', () => ({
	withTimeout
}));

vi.mock('svelte-sonner', () => ({
	toast
}));

import StagingPage from './+page.svelte';

function createStagingQuery(
	current: NonNullable<StagingQueryState['current']>,
	overrides: Partial<StagingQueryState> = {}
): StagingQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createDropAreaListQuery(
	current: NonNullable<DropAreaListQueryState['current']>,
	overrides: Partial<DropAreaListQueryState> = {}
): DropAreaListQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

describe('staging page department gate', () => {
	beforeEach(() => {
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
		goto.mockReset();
		goto.mockResolvedValue(undefined);
		withTimeout.mockReset();
		withTimeout.mockImplementation(async <T>(promise: Promise<T>) => promise);
		getStagingPartsForDay.mockReset();
		getStagingPartsForDayRoll.mockReset();
		getDropAreasByDepartment.mockReset();
		getDropArea.mockReset();
		processStagingScan.mockReset();
		toast.success.mockReset();
		getStagingPartsForDay.mockReturnValue(
			createStagingQuery([
				{
					lpidDetail: 20,
					partListId: 'PART-100',
					partListDescription: 'Wrap coil',
					orderSoNumber: 'SO-100',
					quantity: 4,
					dropAreaName: 'W12',
					lpid: 200
				},
				{
					lpidDetail: 21,
					partListId: 'PART-101',
					partListDescription: 'Parts shelf',
					orderSoNumber: 'SO-101',
					quantity: 7,
					dropAreaName: '',
					lpid: 201
				}
			])
		);
		getStagingPartsForDayRoll.mockReturnValue(
			createStagingQuery([
				{
					lpidDetail: 22,
					partListId: 'ROLL-100',
					partListDescription: 'Roll bundle',
					orderSoNumber: 'SO-200',
					quantity: 9,
					dropAreaName: '',
					lpid: 202
				}
			])
		);
		getDropAreasByDepartment.mockImplementation((department) =>
			createDropAreaListQuery(
				department === 'Roll'
					? [
							{
								id: 51,
								name: 'R12',
								supportsWrap: false,
								supportsParts: false,
								supportsRoll: true,
								supportsLoading: false,
								supportsDriverLocation: false,
								firstCharacter: 'R'
							}
						]
					: [
							{
								id: 41,
								name: 'W12',
								supportsWrap: true,
								supportsParts: false,
								supportsRoll: false,
								supportsLoading: false,
								supportsDriverLocation: false,
								firstCharacter: 'W'
							},
							{
								id: 42,
								name: 'W13',
								supportsWrap: true,
								supportsParts: true,
								supportsRoll: false,
								supportsLoading: false,
								supportsDriverLocation: false,
								firstCharacter: 'W'
							}
						]
			)
		);
		getDropArea.mockImplementation(async (dropAreaId) =>
			dropAreaId === 41
				? {
						id: 41,
						name: 'W12',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: false,
						supportsDriverLocation: false,
						firstCharacter: 'W'
					}
				: dropAreaId === 42
					? {
							id: 42,
							name: 'W13',
							supportsWrap: true,
							supportsParts: true,
							supportsRoll: false,
							supportsLoading: false,
							supportsDriverLocation: false,
							firstCharacter: 'W'
						}
					: dropAreaId === 51
						? {
								id: 51,
								name: 'R12',
								supportsWrap: false,
								supportsParts: false,
								supportsRoll: true,
								supportsLoading: false,
								supportsDriverLocation: false,
								firstCharacter: 'R'
							}
						: null
		);
	});

	function createScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
		return {
			scanType: 'single_label',
			status: 'success',
			message: 'Label staged.',
			needsLocation: false,
			needPick: null,
			dropArea: null,
			...overrides
		};
	}

	async function submitMainScan(value: string) {
		const scanInput = page.getByTestId('staging-scan-input');
		await scanInput.fill(value);

		const inputElement = document.querySelector('[data-testid="staging-scan-input"]');
		if (!(inputElement instanceof HTMLInputElement)) {
			throw new Error('Expected staging scan input element.');
		}

		inputElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			})
		);

		return scanInput;
	}

	it('shows the blocking department gate and keeps scan controls disabled on entry', async () => {
		render(StagingPage);

		const gateElement = document.querySelector('[data-testid="staging-department-gate"]');
		if (!(gateElement instanceof HTMLElement)) {
			throw new Error('Expected staging department gate element.');
		}

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		await expect.element(page.getByTestId('staging-department-gate')).toHaveFocus();
		gateElement.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			})
		);
		expect(goto).not.toHaveBeenCalled();
		await expect
			.element(page.getByRole('heading', { name: 'Select department' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Close department selector' })).toBeInTheDocument();
		await expect.element(page.getByText('No department selected')).toBeInTheDocument();
		await expect.element(page.getByText('No Location')).not.toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Select department' })).not.toHaveClass(
			/font-serif/
		);
		await expect.element(page.getByText('Staging entry')).not.toBeInTheDocument();
		await expect
			.element(page.getByText(/Staging starts with a clean session every time/i))
			.not.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-scan-input')).toBeDisabled();
		await expect.element(page.getByTestId('staging-location-trigger')).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Wrap' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Wrap' })).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByRole('button', { name: 'Parts' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Parts' })).toHaveClass(
			/ui-primary-gradient/
		);
		await expect.element(page.getByRole('button', { name: 'Roll' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Roll' })).toHaveClass(
			/ui-primary-gradient/
		);
	});

	it('lets the user close the department gate and return home', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Close department selector' }).click();

		expect(goto).toHaveBeenCalledWith('/home');
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

	it('closes the gate when the current department is re-selected', async () => {
		render(StagingPage);
		const gate = page.getByTestId('staging-department-gate');

		await gate.getByRole('button', { name: /^Roll/ }).click();
		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();

		await page.getByTestId('staging-department-gate').getByRole('button', { name: /^Roll/ }).click();

		await expect.element(page.getByTestId('staging-department-gate')).not.toBeInTheDocument();
		expect(get(workflowStores.selectedDepartment)).toBe('Roll');
		await expect.element(page.getByTestId('staging-scan-input')).not.toBeDisabled();
		await expect.element(page.getByTestId('staging-location-trigger')).not.toBeDisabled();
	});

	it('renders the general list for Wrap and Parts, then switches to the roll list', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();

		expect(getStagingPartsForDay).toHaveBeenCalledTimes(1);
		expect(getStagingPartsForDayRoll).toHaveBeenCalledWith(null);
		await expect.element(page.getByText('Wrap coil')).toBeInTheDocument();
		await expect.element(page.getByText('Parts shelf')).toBeInTheDocument();
		await expect.element(page.getByText('Roll bundle')).not.toBeInTheDocument();
		await expect.element(page.getByText('Part Number')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Parts' }).click();
		await expect.element(page.getByText('Wrap coil')).toBeInTheDocument();
		await expect.element(page.getByText('Parts shelf')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Roll' }).click();
		await expect.element(page.getByText('Roll bundle')).toBeInTheDocument();
		await expect.element(page.getByText('Wrap coil')).not.toBeInTheDocument();
		await expect.element(page.getByText('Part Number')).not.toBeInTheDocument();
	});

	it('shows scanned and pending row states based on the current location assignment', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();

		await expect
			.element(page.getByTestId('staging-list-row-200'))
			.toHaveTextContent('Staged');
		await expect
			.element(page.getByTestId('staging-list-row-201'))
			.toHaveTextContent('Pending');
		await expect.element(page.getByText('W12')).toBeInTheDocument();
		await expect.element(page.getByText('Unassigned')).toBeInTheDocument();
	});

	it('renders staging rows even when the backend returns duplicate lpid values', async () => {
		getStagingPartsForDay.mockReturnValueOnce(
			createStagingQuery([
				{
					lpidDetail: 30,
					partListId: 'PART-300',
					partListDescription: 'Wrap crate A',
					orderSoNumber: 'SO-300',
					quantity: 2,
					dropAreaName: '',
					lpid: 345029
				},
				{
					lpidDetail: 31,
					partListId: 'PART-301',
					partListDescription: 'Wrap crate B',
					orderSoNumber: 'SO-301',
					quantity: 5,
					dropAreaName: 'Bay 2',
					lpid: 345029
				}
			])
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();

		await expect.element(page.getByText('Wrap crate A')).toBeInTheDocument();
		await expect.element(page.getByText('Wrap crate B')).toBeInTheDocument();
	});

	it('renders empty and error states from the active query', async () => {
		getStagingPartsForDay.mockReturnValueOnce(createStagingQuery([]));
		getStagingPartsForDayRoll.mockReturnValueOnce(
			createStagingQuery([], {
				error: new Error('Roll staging is unavailable.')
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await expect.element(page.getByText('No staging items are ready for this department yet.')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();
		await page.getByTestId('staging-department-gate').getByRole('button', { name: 'Roll' }).click();
		await expect.element(page.getByText('Roll staging is unavailable.')).toBeInTheDocument();
	});

	it('opens the location modal for the selected department and loads matching drop areas', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();

		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		expect(getDropAreasByDepartment).toHaveBeenCalledWith('Wrap');
		await expect.element(page.getByLabelText('Scan new location')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /W12/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /W13/i })).toBeInTheDocument();
	});

	it('closes the location modal when reopening the department selector', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();

		await page.getByTestId('staging-department-trigger').click();

		await expect.element(page.getByTestId('staging-department-gate')).toBeInTheDocument();
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
	});

	it('closes the location modal when Escape is pressed', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();

		const modal = document.querySelector('[data-testid="staging-location-modal"]');
		if (!(modal instanceof HTMLElement)) {
			throw new Error('Expected staging location modal element.');
		}

		modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
	});

	it('renders the location modal with a simplified scanner strip and a dense scrollable grid', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();

		await expect.element(page.getByTestId('staging-location-modal')).toHaveClass(/max-h-\[calc\(100dvh-2rem\)\]/);
		await expect
			.element(page.getByTestId('staging-location-modal-grid'))
			.toHaveClass(/xl:grid-cols-5/);
		await expect
			.element(page.getByTestId('staging-location-list-scroll-region'))
			.toHaveClass(/overflow-y-auto/);
		await expect
			.element(page.getByTestId('staging-location-modal'))
			.not.toHaveTextContent('Resolve by number');
		await expect
			.element(page.getByTestId('staging-location-modal'))
			.not.toHaveTextContent('Drop area ID');
		await expect.element(page.getByText(/Drop area ID/i)).not.toBeInTheDocument();
		await expect.element(page.getByLabelText('Scan new location')).toBeInTheDocument();
	});

	it('keeps Tab focus trapped inside the location modal', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();

		const closeButton = document.querySelector(
			'[aria-label="Close location selector"]'
		);
		const lastTile = Array.from(
			document.querySelectorAll('[data-testid="staging-location-modal-grid"] button')
		).at(-1);
		const modal = document.querySelector('[data-testid="staging-location-modal"]');
		if (
			!(closeButton instanceof HTMLElement) ||
			!(lastTile instanceof HTMLElement) ||
			!(modal instanceof HTMLElement)
		) {
			throw new Error('Expected modal focus targets.');
		}

		lastTile.focus();
		modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(document.activeElement).toBe(closeButton);

		closeButton.focus();
		modal.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
		);
		expect(document.activeElement).toBe(lastTile);
	});

	it('stores the selected drop area and closes the modal after a card selection', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByRole('button', { name: /W13/i }).click();

		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W13');
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 42,
			dropAreaLabel: 'W13'
		});
	});

	it('accepts numeric lookup input in the location modal and updates the current location', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByLabelText('Scan new location').fill('42');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(42);
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W13');
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 42,
			dropAreaLabel: 'W13'
		});
	});

	it('keeps the location modal open and shows an error when numeric lookup is invalid', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByLabelText('Scan new location').fill('999');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(999);
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect.element(page.getByText('Location is not valid.')).toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toBeNull();
	});

	it('rejects numeric lookup when the location does not support the selected department', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByLabelText('Scan new location').fill('51');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(51);
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect
			.element(page.getByText('This location does not support the selected department.'))
			.toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toBeNull();
	});

	it('rejects partially numeric lookup input before attempting a drop-area lookup', async () => {
		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByLabelText('Scan new location').fill('42A');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).not.toHaveBeenCalled();
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect.element(page.getByText('Location is not valid.')).toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toBeNull();
	});

	it('autofocuses the main scan input after department selection and keeps it focused after a location scan', async () => {
		processStagingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: 'location',
				message: 'Location updated.',
				dropArea: {
					id: 41,
					label: 'W12'
				}
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		const scanInput = page.getByTestId('staging-scan-input');

		await expect.element(scanInput).toHaveFocus();
		await submitMainScan('41');

		expect(processStagingScan).toHaveBeenCalledWith({
			scannedText: '41',
			department: 'Wrap',
			dropAreaId: null
		});
		await expect.element(scanInput).toHaveValue('');
		await expect.element(scanInput).toHaveFocus();
		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W12');
	});

	it('keeps the main scan input active when a label needs a location and retries after a numeric location scan', async () => {
		processStagingScan
			.mockResolvedValueOnce(
				createScanResult({
					status: 'needs-location',
					message: 'Location is required before staging.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(
				createScanResult({
					scanType: 'location',
					message: 'Location updated.',
					dropArea: {
						id: 42,
						label: 'W13'
					}
				})
			)
			.mockResolvedValueOnce(createScanResult());

		render(StagingPage);

		await page.getByRole('button', { name: 'Parts' }).click();
		const scanInput = await submitMainScan('LP-100');

		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-scan-error')).toHaveTextContent(
			'Please scan a location first'
		);
		await expect.element(scanInput).toHaveFocus();

		await submitMainScan('42');
		await vi.waitFor(() => {
			expect(processStagingScan).toHaveBeenCalledTimes(3);
		});

		expect(processStagingScan).toHaveBeenNthCalledWith(1, {
			scannedText: 'LP-100',
			department: 'Parts',
			dropAreaId: null
		});
		expect(processStagingScan).toHaveBeenNthCalledWith(2, {
			scannedText: '42',
			department: 'Parts',
			dropAreaId: null
		});
		expect(processStagingScan).toHaveBeenNthCalledWith(3, {
			scannedText: 'LP-100',
			department: 'Parts',
			dropAreaId: 42
		});
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W13');
		await expect.element(scanInput).toHaveFocus();
	});

	it('cancels the pending label when the manual location modal is dismissed', async () => {
		processStagingScan
			.mockResolvedValueOnce(
				createScanResult({
					status: 'needs-location',
					message: 'Location is required before staging.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(
				createScanResult({
					scanType: 'location',
					message: 'Location updated.',
					dropArea: {
						id: 42,
						label: 'W13'
					}
				})
			);

		render(StagingPage);

		await page.getByRole('button', { name: 'Parts' }).click();
		await submitMainScan('LP-100');
		await page.getByTestId('staging-location-trigger').click();
		await page.getByRole('button', { name: 'Close location selector' }).click();
		await submitMainScan('42');

		await vi.waitFor(() => {
			expect(processStagingScan).toHaveBeenCalledTimes(2);
		});

		expect(processStagingScan).toHaveBeenNthCalledWith(1, {
			scannedText: 'LP-100',
			department: 'Parts',
			dropAreaId: null
		});
		expect(processStagingScan).toHaveBeenNthCalledWith(2, {
			scannedText: '42',
			department: 'Parts',
			dropAreaId: null
		});
		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W13');
	});

	it('renders inline scan errors and keeps the scan input ready for recovery', async () => {
		processStagingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: 'location',
				status: 'invalid-location',
				message: 'Location is not valid.'
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		const scanInput = await submitMainScan('999');

		await expect.element(page.getByTestId('staging-scan-error')).toHaveTextContent(
			'Location is not valid.'
		);
		await expect.element(scanInput).toHaveValue('');
		await expect.element(scanInput).toHaveFocus();
	});

	it('renders an inline fallback error when the staging scan command rejects', async () => {
		processStagingScan.mockRejectedValueOnce(new Error('Failed to execute remote function'));

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		const scanInput = await submitMainScan('LP-404');

		await expect.element(page.getByTestId('staging-scan-error')).toHaveTextContent(
			'We could not process that scan right now.'
		);
		await expect.element(scanInput).toHaveValue('');
		await expect.element(scanInput).toHaveFocus();
	});

	it('ignores overlapping scan submissions while a staging scan is still in flight', async () => {
		let resolveFirstScan: ((result: ScanResult) => void) | null = null;
		processStagingScan.mockImplementationOnce(
			() =>
				new Promise<ScanResult>((resolve) => {
					resolveFirstScan = resolve;
				})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		const scanInput = page.getByTestId('staging-scan-input');
		await submitMainScan('LP-100');

		expect(processStagingScan).toHaveBeenCalledTimes(1);
		await expect.element(scanInput).toBeDisabled();

		const firstScanResolver = resolveFirstScan as ((result: ScanResult) => void) | null;
		if (!firstScanResolver) {
			throw new Error('Expected first scan resolver to be captured.');
		}

		firstScanResolver(createScanResult());

		await vi.waitFor(() => {
			expect(processStagingScan).toHaveBeenCalledTimes(1);
		});
		await expect.element(scanInput).not.toBeDisabled();
		await expect.element(scanInput).toHaveFocus();
	});

	it('applies a late successful scan result after showing a timeout fallback', async () => {
		withTimeout.mockRejectedValueOnce(new Error('We could not process that scan right now.'));
		let resolveTimedOutScan: ((result: ScanResult) => void) | null = null;
		processStagingScan.mockReturnValueOnce(
			new Promise<ScanResult>((resolve) => {
				resolveTimedOutScan = resolve;
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		const scanInput = await submitMainScan('LP-405');

		await expect.element(page.getByTestId('staging-scan-error')).toHaveTextContent(
			'We could not process that scan right now.'
		);
		await expect.element(scanInput).toHaveValue('');
		await expect.element(scanInput).toBeDisabled();

		const timedOutScanResolver = resolveTimedOutScan as ((result: ScanResult) => void) | null;
		if (!timedOutScanResolver) {
			throw new Error('Expected timed-out scan resolver to be captured.');
		}

		timedOutScanResolver(createScanResult());

		await expect
			.element(page.getByTestId('staging-scan-error'))
			.not.toBeInTheDocument();
		await expect.element(scanInput).not.toBeDisabled();
		await expect.element(scanInput).toHaveFocus();
		expect(toast.success).toHaveBeenCalledWith('Label staged.');
	});

	it('ignores a late numeric lookup response after a newer card selection closes the modal', async () => {
		let resolveLookup: ((value: DropArea | null) => void) | null = null;
		getDropArea.mockReturnValueOnce(
			new Promise<DropArea | null>((resolve) => {
				resolveLookup = resolve;
			})
		);

		render(StagingPage);

		await page.getByRole('button', { name: 'Wrap' }).click();
		await page.getByTestId('staging-location-trigger').click();
		await page.getByLabelText('Scan new location').fill('42');
		await page.getByRole('button', { name: 'Set location' }).click();
		await page.getByRole('button', { name: /W12/i }).click();

		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 41,
			dropAreaLabel: 'W12'
		});

		const lookupResolver = resolveLookup as ((value: DropArea | null) => void) | null;
		if (!lookupResolver) {
			throw new Error('Expected lookup resolver to be available.');
		}

		lookupResolver({
			id: 42,
			name: 'W13',
			supportsWrap: true,
			supportsParts: true,
			supportsRoll: false,
			supportsLoading: false,
			supportsDriverLocation: false,
			firstCharacter: 'W'
		});

		await expect.element(page.getByTestId('staging-location-trigger')).toHaveTextContent('W12');
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 41,
			dropAreaLabel: 'W12'
		});
	});
});
