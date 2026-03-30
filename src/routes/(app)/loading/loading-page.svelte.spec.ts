import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { DropArea, LoadViewDetail, LoadViewUnion, LoaderInfo, ScanResult } from '$lib/types';
import { workflowStores } from '$lib/workflow/stores';

type RemoteQueryState<T> = {
	current: T;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type LoaderInfoQueryState = {
	current: LoaderInfo | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

const {
	goto,
	getLoaderInfo,
	getLoadViewDetailAll,
	getLoadViewUnion,
	getDropAreasByDepartment,
	getDropArea,
	endLoaderSession,
	processLoadingScan,
	toastSuccess,
	pageState,
	navigationSpy
} = vi.hoisted(() => {
	const pageState = {
		url: new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4'
		)
	};

	const navigationSpy: {
		callback: ((navigation: any) => void) | null;
	} = {
		callback: null
	};

	return {
		goto: vi.fn(),
		getLoaderInfo: vi.fn<(loaderSessionId: number) => LoaderInfoQueryState>(),
		getLoadViewDetailAll: vi.fn<(input: { dropSheetId: number; locationId: number }) => RemoteQueryState<LoadViewDetail[]>>(),
		getLoadViewUnion: vi.fn<
			(input: { loadNumber: string; sequence: number; locationId: number }) => RemoteQueryState<LoadViewUnion[]>
		>(),
		getDropAreasByDepartment: vi.fn<(department: 'Roll' | 'Wrap' | 'Parts') => RemoteQueryState<DropArea[]>>(),
		getDropArea: vi.fn<(dropAreaId: number) => Promise<DropArea | null>>(),
		endLoaderSession: vi.fn(),
		processLoadingScan: vi.fn(),
		toastSuccess: vi.fn(),
		pageState,
		navigationSpy
	};
});

vi.mock('$app/state', () => ({
	page: pageState
}));

vi.mock('$app/navigation', () => ({
	goto,
	beforeNavigate: vi.fn((callback: (navigation: any) => void) => {
		navigationSpy.callback = callback;
	})
}));

vi.mock('$lib/loader-session.remote', () => ({
	getLoaderInfo,
	endLoaderSession
}));

vi.mock('$lib/load-view.remote', () => ({
	getLoadViewDetailAll,
	getLoadViewUnion
}));

vi.mock('$lib/drop-areas.remote', () => ({
	getDropAreasByDepartment,
	getDropArea
}));

vi.mock('$lib/scan.remote', () => ({
	processLoadingScan
}));

vi.mock('svelte-sonner', () => ({
	toast: {
		success: toastSuccess
	}
}));

import LoadingPage from './+page.svelte';

function createLoaderInfoQuery(
	current: LoaderInfo,
	overrides: Partial<LoaderInfoQueryState> = {}
): LoaderInfoQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

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

function createRemoteQuery<T>(
	current: T,
	overrides: Partial<RemoteQueryState<T>> = {}
): RemoteQueryState<T> {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createDropDetail(overrides: Partial<LoadViewDetail> = {}): LoadViewDetail {
	return {
		dropSequence: 1,
		dropSheetId: 42,
		dropSheetCustomerId: 84,
		loadNumber: 'L-042',
		loadDate: '2026-03-26',
		locationId: 2,
		sequence: 1,
		customerId: 999,
		customerName: 'Acme Metals',
		driverName: 'Dylan Driver',
		totalCountText: '12/20',
		labelCount: 20,
		scannedCount: 12,
		needPickCount: 8,
		...overrides
	};
}

function createUnionLabel(overrides: Partial<LoadViewUnion> = {}): LoadViewUnion {
	return {
		partListId: 'PL-100',
		labelNumber: 1001,
		orderSoNumber: 'SO-100',
		loadNumber: 'L-042',
		sequence: 1,
		dropAreaName: 'R12',
		scanned: false,
		locationId: 2,
		lengthText: '10ft',
		categoryId: 2,
		lpid: 5001,
		...overrides
	};
}

function createDropArea(overrides: Partial<DropArea> = {}): DropArea {
	return {
		id: 41,
		name: 'D12',
		supportsWrap: true,
		supportsParts: true,
		supportsRoll: false,
		supportsLoading: true,
		supportsDriverLocation: true,
		firstCharacter: 'D',
		...overrides
	};
}

function createScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
	return {
		scanType: 'single_label',
		status: 'success',
		message: 'Label loaded.',
		needsLocation: false,
		needPick: null,
		dropArea: null,
		...overrides
	};
}

async function submitMainScan(value: string) {
	const scanInput = page.getByTestId('loading-scan-input');
	await scanInput.fill(value);

	const inputElement = document.querySelector('[data-testid="loading-scan-input"]');
	if (!(inputElement instanceof HTMLInputElement)) {
		throw new Error('Expected loading scan input element.');
	}

	inputElement.dispatchEvent(
		new KeyboardEvent('keydown', {
			key: 'Enter',
			bubbles: true,
			cancelable: true
		})
	);

	return inputElement;
}

function getElementByTestId(testId: string) {
	const element = document.querySelector(`[data-testid="${testId}"]`);

	if (!(element instanceof HTMLElement)) {
		throw new Error(`Expected element with data-testid="${testId}".`);
	}

	return element;
}

function expectDocumentOrder(testIds: string[]) {
	const elements = testIds.map(getElementByTestId);

	for (let index = 0; index < elements.length - 1; index += 1) {
		expect(
			elements[index].compareDocumentPosition(elements[index + 1]) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	}
}

describe('loading page', () => {
	beforeEach(() => {
		goto.mockReset();
		getLoaderInfo.mockReset();
		getLoadViewDetailAll.mockReset();
		getLoadViewUnion.mockReset();
		getDropAreasByDepartment.mockReset();
		getDropArea.mockReset();
		endLoaderSession.mockReset();
		processLoadingScan.mockReset();
		toastSuccess.mockReset();
		navigationSpy.callback = null;
		workflowStores.syncActiveTarget('Canton');
		workflowStores.resetOperationalState();
		pageState.url = new URL(
			'https://app.local/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-26T12%3A00%3A00.000Z&loadNumber=L-042&dropWeight=2152.4'
		);
		getLoaderInfo.mockReturnValue(createLoaderInfoQuery(createLoaderInfo()));
		getLoadViewDetailAll.mockReturnValue(
			createRemoteQuery([
				createDropDetail(),
				createDropDetail({
					dropSequence: 2,
					dropSheetCustomerId: 85,
					sequence: 2,
					customerName: 'Beacon Supply',
					driverName: 'Taylor Driver',
					totalCountText: '4/10',
					labelCount: 10,
					scannedCount: 4,
					needPickCount: 6
				})
			])
		);
		getLoadViewUnion.mockImplementation(({ sequence }) =>
			createRemoteQuery(
				sequence === 1
					? [
							createUnionLabel({
								partListId: 'PL-100',
								orderSoNumber: 'SO-100',
								scanned: true
							}),
							createUnionLabel({
								partListId: 'PL-101',
								labelNumber: 1002,
								orderSoNumber: 'SO-101',
								scanned: false
							})
						]
					: [
							createUnionLabel({
								partListId: 'PL-200',
								labelNumber: 2001,
								orderSoNumber: 'SO-200',
								sequence: 2,
								scanned: false
							})
						]
			)
		);
		getDropAreasByDepartment.mockReturnValue(
			createRemoteQuery([
				createDropArea({
					id: 41,
					name: 'D12',
					supportsWrap: true,
					supportsParts: false,
					supportsRoll: false,
					supportsLoading: true,
					supportsDriverLocation: true,
					firstCharacter: 'D'
				}),
				createDropArea({
					id: 42,
					name: 'D13',
					supportsWrap: true,
					supportsParts: true,
					supportsRoll: false,
					supportsLoading: true,
					supportsDriverLocation: true,
					firstCharacter: 'D'
				})
			])
		);
		getDropArea.mockImplementation(async (dropAreaId) =>
			dropAreaId === 41
				? createDropArea({
						id: 41,
						name: 'D12',
						supportsWrap: true,
						supportsParts: false,
						supportsRoll: false,
						supportsLoading: true,
						supportsDriverLocation: true,
						firstCharacter: 'D'
					})
				: dropAreaId === 42
					? createDropArea({
							id: 42,
							name: 'D13',
							supportsWrap: true,
							supportsParts: true,
							supportsRoll: false,
							supportsLoading: true,
							supportsDriverLocation: true,
							firstCharacter: 'D'
						})
					: null
		);
		processLoadingScan.mockResolvedValue(createScanResult());
	});

	it('loads loader info from the category handoff and renders the resolved loading context', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		expect(getLoaderInfo).toHaveBeenCalledWith(88);
		expect(getLoadViewDetailAll).toHaveBeenCalledWith({
			dropSheetId: 42,
			locationId: 2
		});
		await expect
			.element(page.getByTestId('loading-summary-strip').getByText('Delivery Number'))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('loading-summary-strip').getByText('L-042')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('loading-summary-strip').getByText('Customer'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('loading-summary-strip').getByText('Acme Metals'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('loading-summary-strip').getByText('Alex'))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByTestId('loading-summary-strip').getByText('2,152.4 lbs'))
			.not.toBeInTheDocument();
		await expect.element(page.getByText(/^Driver location$/)).not.toBeInTheDocument();
		await expect.element(page.getByText(/^Scan state$/)).not.toBeInTheDocument();
		await expect.element(page.getByTestId('loading-scan-section')).toBeInTheDocument();
	});

	it('renders the active drop summary and only unscanned part-list entries under the scan input', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		await expect.element(page.getByText('Drop 1 of 2')).toBeInTheDocument();
		await expect.element(page.getByText('Acme Metals')).toBeInTheDocument();
		await expect.element(page.getByText('L-042').first()).toBeInTheDocument();
		await expect.element(page.getByTestId('loading-part-list-grid')).toBeInTheDocument();
		await expect.element(page.getByText('PL-101')).toBeInTheDocument();
		await expect.element(page.getByText('PL-100')).not.toBeInTheDocument();
		await expect.element(page.getByText('SO-100')).not.toBeInTheDocument();
		await expect.element(page.getByText('SO-101')).not.toBeInTheDocument();
		await expect.element(page.getByText('Need pick').first()).toBeInTheDocument();
		await expect.element(page.getByText('8').first()).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Previous drop/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Next drop/i })).toBeEnabled();
	});

	it('hides the empty SO-number placeholder while the label list is still loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoadViewUnion.mockReturnValue(
			createRemoteQuery([], {
				loading: true
			})
		);

		render(LoadingPage);

		await expect.element(page.getByText('Loading label list...')).toBeInTheDocument();
		await expect.element(page.getByText('PL-101')).not.toBeInTheDocument();
	});

	it('shows the need-pick summary only once for the active drop', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		const needPickLabels = Array.from(document.querySelectorAll('*')).filter(
			(element) => element.textContent?.trim() === 'Need pick'
		);

		expect(needPickLabels).toHaveLength(1);
	});

	it('renders the loading workspace in legacy order and hides dashboard-only blocks', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		await expect.element(page.getByRole('heading', { name: 'Loading' })).not.toBeInTheDocument();
		await expect.element(page.getByTestId('loading-summary-strip')).toBeInTheDocument();
		await expect.element(page.getByTestId('loading-scan-section')).toBeInTheDocument();

		expectDocumentOrder(['loading-summary-strip', 'loading-scan-section']);

		await expect.element(page.getByTestId('loading-active-drop-card')).not.toBeInTheDocument();
		await expect.element(page.getByText('Selected drop information')).not.toBeInTheDocument();
		await expect.element(page.getByText('Union labels for the active drop')).not.toBeInTheDocument();
		await expect.element(page.getByText('Scanner ready')).not.toBeInTheDocument();
		await expect.element(page.getByText(/^Active drop$/)).not.toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Loading' })).not.toBeInTheDocument();
		await expect.element(page.getByText('Drop navigation')).not.toBeInTheDocument();
		await expect.element(page.getByText('Session ID')).not.toBeInTheDocument();
		await expect.element(page.getByText('Started')).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Previous drop/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Next drop/i })).toBeInTheDocument();
	});

	it('moves between drops, refreshes the selected detail, and clamps navigation at the last drop', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');

		render(LoadingPage);

		await page.getByRole('button', { name: /Next drop/i }).click();

		await expect.element(page.getByText('Drop 2 of 2')).toBeInTheDocument();
		await expect.element(page.getByText('Beacon Supply')).toBeInTheDocument();
		await expect.element(page.getByText('PL-200')).toBeInTheDocument();
		expect(getLoadViewUnion).toHaveBeenLastCalledWith({
			loadNumber: 'L-042',
			sequence: 2,
			locationId: 2
		});
		await expect.element(page.getByRole('button', { name: /Next drop/i })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: /Previous drop/i })).toBeEnabled();
	});

	it('submits loading scans on Enter with the active drop context, refreshes data, and clears the input', async () => {
		const detailRefresh = vi.fn().mockResolvedValue(undefined);
		const unionRefresh = vi.fn().mockResolvedValue(undefined);
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoadViewDetailAll.mockReturnValue(
			createRemoteQuery([createDropDetail()], {
				refresh: detailRefresh
			})
		);
		getLoadViewUnion.mockReturnValue(
			createRemoteQuery([createUnionLabel()], {
				refresh: unionRefresh
			})
		);

		render(LoadingPage);

		const inputElement = await submitMainScan('LP-100');

		await vi.waitFor(() => {
			expect(processLoadingScan).toHaveBeenCalledWith({
				scannedText: 'LP-100',
				department: 'Wrap',
				dropAreaId: null,
				loadNumber: 'L-042',
				loaderName: 'Alex'
			});
		});
		await vi.waitFor(() => {
			expect(detailRefresh).toHaveBeenCalledOnce();
			expect(unionRefresh).toHaveBeenCalledOnce();
		});
		await vi.waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith('Label loaded.');
		});
		expect(inputElement.value).toBe('');
		expect(document.activeElement).toBe(inputElement);
	});

	it('updates the in-memory drop area for successful location scans without refreshing detail queries', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: 'location',
				message: 'Location updated.',
				dropArea: {
					id: 41,
					label: 'D12'
				}
			})
		);

		render(LoadingPage);

		await submitMainScan('41');

		await vi.waitFor(() => {
			expect(get(workflowStores.currentDropArea)).toEqual({
				dropAreaId: 41,
				dropAreaLabel: 'D12'
			});
		});
		expect(toastSuccess).not.toHaveBeenCalled();
	});

	it('shows an inline scanner-safe error when the backend blocks the current drop', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'department-blocked',
				message: 'This drop is not completed!'
			})
		);

		render(LoadingPage);

		const inputElement = await submitMainScan('LP-100');

		await expect.element(page.getByText(/^Not Completed$/)).toBeInTheDocument();
		await expect.element(page.getByText('This drop is not completed!')).toBeInTheDocument();
		expect(inputElement.value).toBe('');
		expect(document.activeElement).toBe(inputElement);
	});

	it('renders the mapped loading error title for does-not-belong results', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'does-not-belong',
				message: "Label doesn't belong to this drop!"
			})
		);

		render(LoadingPage);

		await submitMainScan('LP-404');

		await expect.element(page.getByText('Not Found')).toBeInTheDocument();
		await expect
			.element(page.getByText("Label doesn't belong to this drop!"))
			.toBeInTheDocument();
	});

	it('renders the mapped loading error title for no-match results', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'no-match',
				message: 'Label is not valid!'
			})
		);

		render(LoadingPage);

		await submitMainScan('LP-999');

		await expect.element(page.getByText('No Match')).toBeInTheDocument();
		await expect.element(page.getByText('Label is not valid!')).toBeInTheDocument();
	});

	it('opens the Scan New Location modal when the backend requests a location, then retries after a modal selection', async () => {
		const detailRefresh = vi.fn().mockResolvedValue(undefined);
		const unionRefresh = vi.fn().mockResolvedValue(undefined);
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoadViewDetailAll.mockReturnValue(
			createRemoteQuery([createDropDetail()], {
				refresh: detailRefresh
			})
		);
		getLoadViewUnion.mockReturnValue(
			createRemoteQuery([createUnionLabel()], {
				refresh: unionRefresh
			})
		);
		processLoadingScan
			.mockResolvedValueOnce(
				createScanResult({
					scanType: null,
					status: 'needs-location',
					message: 'Scan a driver location next.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(createScanResult());

		render(LoadingPage);

		await submitMainScan('LP-100');
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect.element(page.getByLabelText('Scan new location')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /D12/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /D13/i })).toBeInTheDocument();
		expect(getDropAreasByDepartment).toHaveBeenCalledWith('Wrap');

		await page.getByLabelText('Scan new location').fill('42');
		await page.getByRole('button', { name: 'Set location' }).click();

		await vi.waitFor(() => {
			expect(processLoadingScan).toHaveBeenCalledTimes(2);
		});
		expect(processLoadingScan).toHaveBeenNthCalledWith(2, {
			scannedText: 'LP-100',
			department: 'Wrap',
			dropAreaId: 42,
			loadNumber: 'L-042',
			loaderName: 'Alex'
		});
		await vi.waitFor(() => {
			expect(detailRefresh).toHaveBeenCalledOnce();
			expect(unionRefresh).toHaveBeenCalledOnce();
		});
		expect(toastSuccess).toHaveBeenCalledWith('Label loaded.');
		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toEqual({
			dropAreaId: 42,
			dropAreaLabel: 'D13'
		});
	});

	it('keeps the scan input disabled while the modal-selected retry is in flight', async () => {
		let resolveRetry: ((result: ScanResult) => void) | null = null;
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan
			.mockResolvedValueOnce(
				createScanResult({
					scanType: null,
					status: 'needs-location',
					message: 'Scan a driver location next.',
					needsLocation: true
				})
			)
			.mockImplementationOnce(
				() =>
					new Promise<ScanResult>((resolve) => {
						resolveRetry = resolve;
					})
			);

		render(LoadingPage);

		await submitMainScan('LP-100');
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await page.getByRole('button', { name: /D12/i }).click();

		await expect.element(page.getByTestId('loading-scan-input')).toBeDisabled();

		const retryResolver = resolveRetry as ((result: ScanResult) => void) | null;
		if (!retryResolver) {
			throw new Error('Expected retry resolver to be captured.');
		}

		retryResolver(createScanResult());

		await vi.waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith('Label loaded.');
		});
	});

	it('hides non-driver loading locations and rejects numeric lookup for them', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getDropAreasByDepartment.mockReturnValue(
			createRemoteQuery([
				createDropArea({
					id: 41,
					name: 'D12',
					supportsWrap: true,
					supportsLoading: true,
					supportsDriverLocation: true
				}),
				createDropArea({
					id: 51,
					name: 'W12',
					supportsWrap: true,
					supportsLoading: false,
					supportsDriverLocation: false
				})
			])
		);
		getDropArea.mockImplementation(async (dropAreaId) =>
			dropAreaId === 51
				? createDropArea({
						id: 51,
						name: 'W12',
						supportsWrap: true,
						supportsLoading: false,
						supportsDriverLocation: false
					})
				: createDropArea({
						id: 41,
						name: 'D12',
						supportsWrap: true,
						supportsLoading: true,
						supportsDriverLocation: true
					})
		);
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'needs-location',
				message: 'Scan a driver location next.',
				needsLocation: true
			})
		);

		render(LoadingPage);

		await submitMainScan('LP-100');
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /D12/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /W12/i })).not.toBeInTheDocument();

		await page.getByLabelText('Scan new location').fill('51');
		await page.getByRole('button', { name: 'Set location' }).click();

		expect(getDropArea).toHaveBeenCalledWith(51);
		await expect.element(page.getByText('Location is not valid.')).toBeInTheDocument();
		expect(get(workflowStores.currentDropArea)).toBeNull();
	});

	it('cancels a pending needs-location scan when the modal is dismissed', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'needs-location',
				message: 'Scan a driver location next.',
				needsLocation: true
			})
		);

		render(LoadingPage);

		await submitMainScan('LP-100');
		await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();

		await page.getByRole('button', { name: 'Close location selector' }).click();

		await expect.element(page.getByTestId('staging-location-modal')).not.toBeInTheDocument();
		expect(processLoadingScan).toHaveBeenCalledTimes(1);
		expect(get(workflowStores.currentDropArea)).toBeNull();
	});

	it('cancels a pending needs-location retry when the operator changes drops', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan
			.mockResolvedValueOnce(
				createScanResult({
					scanType: null,
					status: 'needs-location',
					message: 'Scan a driver location next.',
					needsLocation: true
				})
			)
			.mockResolvedValueOnce(
				createScanResult({
					scanType: 'location',
					message: 'Location updated.',
					dropArea: {
						id: 42,
						label: 'D13'
					}
				})
			);

		render(LoadingPage);

		await submitMainScan('LP-100');
		await expect.element(page.getByText('Scan a driver location next.')).toBeInTheDocument();

		await page.getByRole('button', { name: /Next drop/i }).click();
		await submitMainScan('42');

		await vi.waitFor(() => {
			expect(processLoadingScan).toHaveBeenCalledTimes(2);
		});
		expect(processLoadingScan).toHaveBeenNthCalledWith(2, {
			scannedText: '42',
			department: 'Wrap',
			dropAreaId: null,
			loadNumber: 'L-042',
			loaderName: 'Alex'
		});
	});

	it('keeps an in-flight successful scan visible when the operator changes drops', async () => {
		let resolveScan: ((result: ScanResult) => void) | null = null;
		const detailRefresh = vi.fn().mockResolvedValue(undefined);
		const unionRefresh = vi.fn().mockResolvedValue(undefined);
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoadViewDetailAll.mockReturnValue(
			createRemoteQuery([createDropDetail(), createDropDetail({ sequence: 2, dropSequence: 2 })], {
				refresh: detailRefresh
			})
		);
		getLoadViewUnion.mockReturnValue(
			createRemoteQuery([createUnionLabel()], {
				refresh: unionRefresh
			})
		);
		processLoadingScan.mockImplementationOnce(
			() =>
				new Promise<ScanResult>((resolve) => {
					resolveScan = resolve;
				})
		);

		render(LoadingPage);

		await submitMainScan('LP-100');
		await page.getByRole('button', { name: /Next drop/i }).click();

		const scanResolver = resolveScan as ((result: ScanResult) => void) | null;
		if (!scanResolver) {
			throw new Error('Expected scan resolver to be captured.');
		}

		scanResolver(createScanResult());

		await vi.waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith('Label loaded.');
		});
		expect(detailRefresh).toHaveBeenCalledOnce();
		expect(unionRefresh).toHaveBeenCalledOnce();
	});

	it('shows the real non-timeout error message when loading scan submission fails', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockRejectedValueOnce(new Error('Failed to execute remote function'));

		render(LoadingPage);

		const inputElement = await submitMainScan('LP-100');

		await expect.element(page.getByText('Failed to execute remote function')).toBeInTheDocument();
		await expect
			.element(page.getByText('We could not process that scan right now.'))
			.not.toBeInTheDocument();
		expect(inputElement.value).toBe('');
		expect(document.activeElement).toBe(inputElement);
	});

	it('dismisses a thrown loading scan failure and returns the field to ready state', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockRejectedValueOnce(new Error('Failed to execute remote function'));

		render(LoadingPage);

		const inputElement = await submitMainScan('LP-100');

		await expect.element(page.getByText('Connection issue')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Retry scan' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Dismiss error' }))
			.toBeInTheDocument();

		await page.getByRole('button', { name: 'Dismiss error' }).click();

		await expect.element(page.getByText('Connection issue')).not.toBeInTheDocument();
		expect(document.activeElement).toBe(inputElement);
	});

	it('retries the last thrown loading scan request from the recovery panel', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan
			.mockRejectedValueOnce(new Error('Failed to execute remote function'))
			.mockResolvedValueOnce(createScanResult());

		render(LoadingPage);

		const inputElement = await submitMainScan('LP-100');

		await expect.element(page.getByText('Connection issue')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Retry scan' })).toBeInTheDocument();

		await page.getByRole('button', { name: 'Retry scan' }).click();

		await vi.waitFor(() => {
			expect(processLoadingScan).toHaveBeenCalledTimes(2);
		});
		expect(processLoadingScan).toHaveBeenNthCalledWith(2, {
			scannedText: 'LP-100',
			department: 'Wrap',
			dropAreaId: null,
			loadNumber: 'L-042',
			loaderName: 'Alex'
		});
		await vi.waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith('Label loaded.');
		});
		expect(document.activeElement).toBe(inputElement);
	});

	it('dismisses a timed-out pending retry without leaving a stale pending scan behind', async () => {
		let rejectPendingRetry: ((error: Error) => void) | null = null;
		vi.useFakeTimers();

		try {
			workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
			workflowStores.setSelectedDepartment('Wrap');
			processLoadingScan
				.mockResolvedValueOnce(
					createScanResult({
						scanType: null,
						status: 'needs-location',
						message: 'Scan a driver location next.',
						needsLocation: true
					})
				)
				.mockImplementationOnce(
					() =>
						new Promise<ScanResult>((_, reject) => {
							rejectPendingRetry = reject;
						})
				)
				.mockResolvedValueOnce(
					createScanResult({
						scanType: 'location',
						message: 'Location updated.',
						dropArea: {
							id: 42,
							label: 'D13'
						}
					})
				);

			render(LoadingPage);

			await submitMainScan('LP-100');
			await expect.element(page.getByTestId('staging-location-modal')).toBeInTheDocument();
			await page.getByRole('button', { name: /D12/i }).click();

			await vi.advanceTimersByTimeAsync(8000);
			await expect.element(page.getByText('Connection issue')).toBeInTheDocument();

			const pendingRetryRejector = rejectPendingRetry as ((error: Error) => void) | null;
			if (!pendingRetryRejector) {
				throw new Error('Expected pending retry rejector to be captured.');
			}

			pendingRetryRejector(new Error('late retry failure'));

			await vi.waitFor(() => {
				expect(page.getByRole('button', { name: 'Dismiss error' })).toBeDefined();
			});

			await page.getByRole('button', { name: 'Dismiss error' }).click();
			await submitMainScan('42');

			await vi.waitFor(() => {
				expect(processLoadingScan).toHaveBeenCalledTimes(3);
			});
			expect(processLoadingScan).toHaveBeenNthCalledWith(3, {
				scannedText: '42',
				department: 'Wrap',
				dropAreaId: 41,
				loadNumber: 'L-042',
				loaderName: 'Alex'
			});
		} finally {
			vi.useRealTimers();
		}
	});

	it('shows api-error results with diagnosable loading context', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		processLoadingScan.mockResolvedValueOnce(
			createScanResult({
				scanType: null,
				status: 'api-error',
				message: '500: dak-web unavailable'
			})
		);

		render(LoadingPage);

		await submitMainScan('LP-500');

		await expect.element(page.getByText('API Error')).toBeInTheDocument();
		await expect.element(page.getByText('500: dak-web unavailable')).toBeInTheDocument();
	});

	it('redirects to home when the loading entry params are invalid', async () => {
		pageState.url = new URL('https://app.local/loading?dropsheetId=42&locationId=2');

		render(LoadingPage);

		await vi.waitFor(() => {
			expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		});
		expect(getLoaderInfo).not.toHaveBeenCalled();
	});

	it('redirects to home when the page is reopened without the in-memory workflow context', async () => {
		render(LoadingPage);

		await vi.waitFor(() => {
			expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		});
		expect(getLoaderInfo).not.toHaveBeenCalled();
	});

	it('ends the loader session before allowing in-app navigation away from loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		endLoaderSession.mockResolvedValue(
			createLoaderInfo({
				endedAt: '2026-03-26T12:05:00.000Z'
			})
		);

		render(LoadingPage);

		const cancel = vi.fn();
		navigationSpy.callback?.({
			type: 'link',
			willUnload: false,
			to: {
				url: new URL('https://app.local/home'),
				route: { id: '/home' }
			},
			cancel
		});

		expect(cancel).toHaveBeenCalledOnce();
		await vi.waitFor(() => {
			expect(endLoaderSession).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 88,
					dropSheetId: 42,
					loaderId: 7,
					department: 'Wrap',
					loaderName: 'Alex',
					startedAt: '2026-03-26T12:00:00.000Z',
					endedAt: expect.any(String)
				})
			);
		});
		expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
		expect(get(workflowStores.currentLoader)).toBeNull();
		expect(get(workflowStores.selectedDepartment)).toBeNull();
	});

	it('ends the loader session on exit even before loader info finishes loading', async () => {
		workflowStores.setCurrentLoader({ loaderId: 7, loaderName: 'Alex' });
		workflowStores.setSelectedDepartment('Wrap');
		getLoaderInfo.mockReturnValue(
			createLoaderInfoQuery(createLoaderInfo(), {
				current: null,
				loading: true
			})
		);
		endLoaderSession.mockResolvedValue(
			createLoaderInfo({
				endedAt: '2026-03-26T12:05:00.000Z'
			})
		);

		render(LoadingPage);

		const cancel = vi.fn();
		navigationSpy.callback?.({
			type: 'link',
			willUnload: false,
			to: {
				url: new URL('https://app.local/home'),
				route: { id: '/home' }
			},
			cancel
		});

		expect(cancel).toHaveBeenCalledOnce();
		await vi.waitFor(() => {
			expect(endLoaderSession).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 88,
					dropSheetId: 42,
					loaderId: 7,
					department: 'Wrap',
					loaderName: 'Alex',
					startedAt: '2026-03-26T12:00:00.000Z',
					endedAt: expect.any(String)
				})
			);
		});
		expect(goto).toHaveBeenCalledWith('/home', { replaceState: true });
	});
});
