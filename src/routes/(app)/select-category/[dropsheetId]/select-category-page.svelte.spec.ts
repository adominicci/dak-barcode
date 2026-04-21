import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { get } from 'svelte/store';
import { workflowStores } from '$lib/workflow/stores';

type DepartmentStatusQueryState = {
	current: {
		scope: 'dropsheet';
		subjectId: number;
		slit: string | null;
		trim: string | null;
		wrap: string | null;
		roll: string | null;
		parts: string | null;
		soffit: string | null;
	} | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type CategoryAvailabilityQueryState = {
	current: {
		dropSheetId: number;
		wrapHasLabels: number;
		wrapScannedPercent: number;
		rollHasLabels: number;
		rollScannedPercent: number;
		partsHasLabels: number;
		partsScannedPercent: number;
		allLoaded: boolean;
	} | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type LoaderQueryState = {
	current: Array<{
		id: number;
		name: string;
		isActive: boolean;
	}> | null;
	loading: boolean;
	error: Error | null;
	refresh: ReturnType<typeof vi.fn>;
};

type DepartmentLoaderGroup = {
	department: 'Wrap' | 'Roll' | 'Parts';
	loaderNames: string[];
};

const {
	goto,
	resolve,
	completeLoadingEmail,
	getDropsheetCategoryAvailability,
	getDropsheetStatus,
	getWillCallSignature,
	getLoaders,
	getNumberOfDrops,
	toastWarning,
	uploadWillCallSignature,
	createSupabaseBrowserClient,
	upsertLoaderSession
} = vi.hoisted(
	() => ({
		goto: vi.fn(),
		resolve: vi.fn((href: string) => href),
		completeLoadingEmail: vi.fn(),
		getDropsheetCategoryAvailability: vi.fn<(dropSheetId: number) => CategoryAvailabilityQueryState>(),
		getDropsheetStatus: vi.fn<(dropSheetId: number) => DepartmentStatusQueryState>(),
		getWillCallSignature: vi.fn(),
		getLoaders: vi.fn<() => LoaderQueryState>(),
		getNumberOfDrops: vi.fn(),
		toastWarning: vi.fn(),
		uploadWillCallSignature: vi.fn(),
		createSupabaseBrowserClient: vi.fn(),
		upsertLoaderSession: vi.fn()
	})
);

vi.mock('$app/navigation', () => ({
	goto
}));

vi.mock('$app/paths', () => ({
	resolve
}));

vi.mock('$lib/loading-complete.remote', () => ({
	completeLoadingEmail
}));

vi.mock('$lib/dropsheets.remote', () => ({
	getDropsheetCategoryAvailability,
	getDropsheetStatus
}));

vi.mock('$lib/loaders.cached', () => ({
	getLoaders
}));

vi.mock('$lib/load-view.remote', () => ({ getNumberOfDrops }));

vi.mock('$lib/loader-session.remote', () => ({ upsertLoaderSession }));

vi.mock('$lib/will-call.remote', () => ({ getWillCallSignature, uploadWillCallSignature }));

vi.mock('$lib/supabase/client', () => ({ createSupabaseBrowserClient }));

vi.mock('svelte-sonner', () => ({
	toast: {
		warning: toastWarning
	}
}));

import SelectCategoryPage from './+page.svelte';

const originalCanvasGetContext = HTMLCanvasElement.prototype.getContext;
const originalCanvasToBlob = HTMLCanvasElement.prototype.toBlob;

function createStatusQuery(
	current: NonNullable<DepartmentStatusQueryState['current']>,
	overrides: Partial<DepartmentStatusQueryState> = {}
): DepartmentStatusQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createCategoryAvailabilityQuery(
	current: NonNullable<CategoryAvailabilityQueryState['current']>,
	overrides: Partial<CategoryAvailabilityQueryState> = {}
): CategoryAvailabilityQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createLoadersQuery(
	current: NonNullable<LoaderQueryState['current']>,
	overrides: Partial<LoaderQueryState> = {}
): LoaderQueryState {
	return {
		current,
		loading: false,
		error: null,
		refresh: vi.fn(),
		...overrides
	};
}

function createWillCallSignatureRecord(
	overrides: Partial<{
		dropSheetCustomerId: number | null;
		dropSheetId: number;
		signature: string | null;
		signatureTimestamp: string | null;
		receivedBy: string | null;
		signaturePath: string | null;
	}> = {}
) {
	return {
		dropSheetCustomerId: null,
		dropSheetId: 42,
		signature: null,
		signatureTimestamp: null,
		receivedBy: null,
		signaturePath: null,
		...overrides
	};
}

function createCanvasRenderingContextMock() {
	return {
		beginPath: vi.fn(),
		lineCap: 'round',
		lineJoin: 'round',
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		stroke: vi.fn(),
		clearRect: vi.fn(),
		lineWidth: 0,
		strokeStyle: ''
	};
}

function createDeferred<T>() {
	let resolvePromise!: (value: T | PromiseLike<T>) => void;
	let rejectPromise!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolve, reject) => {
		resolvePromise = resolve;
		rejectPromise = reject;
	});

	return {
		promise,
		resolve: resolvePromise,
		reject: rejectPromise
	};
}

const layoutData = {
	activeTarget: 'Canton' as const,
	displayName: 'Loader One',
	isAdmin: false,
	userEmail: 'loader@dakotasteelandtrim.com',
	userRole: 'loading' as const,
	willCall: false,
	percentCompleted: 0.875,
	departmentLoadersError: null,
	departmentLoaders: [
		{ department: 'Wrap', loaderNames: [] },
		{ department: 'Roll', loaderNames: [] },
		{ department: 'Parts', loaderNames: [] }
	] as DepartmentLoaderGroup[]
};

describe('select-category page', () => {
	beforeEach(() => {
		goto.mockReset();
		resolve.mockReset();
		resolve.mockImplementation((href: string) => href);
		completeLoadingEmail.mockReset();
		getDropsheetCategoryAvailability.mockReset();
		getDropsheetStatus.mockReset();
		getLoaders.mockReset();
		getNumberOfDrops.mockReset();
		toastWarning.mockReset();
		getWillCallSignature.mockReset();
		uploadWillCallSignature.mockReset();
		createSupabaseBrowserClient.mockReset();
		upsertLoaderSession.mockReset();
		workflowStores.resetOperationalState();

		getDropsheetStatus.mockReturnValue(
			createStatusQuery({
				scope: 'dropsheet',
				subjectId: 42,
				slit: 'DONE',
				trim: 'READY',
				wrap: 'WAIT',
				roll: 'STOP',
				parts: 'DUE',
				soffit: null
			})
		);

		getDropsheetCategoryAvailability.mockReturnValue(
			createCategoryAvailabilityQuery({
				dropSheetId: 42,
				wrapHasLabels: 6,
				wrapScannedPercent: 0.5,
				rollHasLabels: 4,
				rollScannedPercent: 0.25,
				partsHasLabels: 3,
				partsScannedPercent: 0.75,
				allLoaded: false
			})
		);
		getLoaders.mockReturnValue(
			createLoadersQuery([
				{ id: 7, name: 'Alex', isActive: true },
				{ id: 9, name: 'Casey', isActive: true }
			])
		);
	});

	afterEach(() => {
		HTMLCanvasElement.prototype.getContext = originalCanvasGetContext;
		HTMLCanvasElement.prototype.toBlob = originalCanvasToBlob;
	});

	it('shows the Signature action only when the current select-category handoff is will call', async () => {
		const willCallRender = render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'WC-042',
				driverName: 'WILL CALL',
				dropWeight: null,
				percentCompleted: 0,
				returnTo: '/home',
				willCall: true,
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByRole('button', { name: 'Signature' })).toBeInTheDocument();
		willCallRender.unmount();

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: null,
				willCall: false,
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByRole('button', { name: 'Signature' })).not.toBeInTheDocument();
	});

	it('loads the current will call signature through getWillCallSignature().run() before opening the modal', async () => {
		const runSignature = vi
			.fn()
			.mockResolvedValue(createWillCallSignatureRecord({ receivedBy: 'Jordan' }));
		getWillCallSignature.mockReturnValue({ run: runSignature });

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'WC-042',
				driverName: 'WILL CALL',
				dropWeight: null,
				percentCompleted: 0,
				returnTo: '/home',
				willCall: true,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Signature' }).click();

		expect(getWillCallSignature).toHaveBeenCalledWith(42);
		expect(runSignature).toHaveBeenCalledOnce();
		await expect.element(page.getByRole('dialog', { name: 'Customer signature' })).toBeInTheDocument();
		await expect.element(page.getByLabelText('Received By')).toHaveValue('Jordan');
	});

	it('refreshes the will call signature through getWillCallSignature().run() after upload', async () => {
		const runInitialSignature = vi.fn().mockResolvedValue(createWillCallSignatureRecord());
		const runRefreshedSignature = vi
			.fn()
			.mockResolvedValue(
				createWillCallSignatureRecord({
					receivedBy: 'Jordan',
					signaturePath: 'signatures/will-call/42/signature_123.png'
				})
			);
		const upload = vi.fn().mockResolvedValue({
			data: { path: 'signatures/will-call/42/signature_123.png' },
			error: null
		});
		const createSignedUrl = vi.fn().mockResolvedValue({
			data: { signedUrl: 'https://signed.example.com/signature.png' },
			error: null
		});
		const remove = vi.fn().mockResolvedValue({
			data: [],
			error: null
		});
		const canvasRenderingContext = createCanvasRenderingContextMock();

		getWillCallSignature
			.mockReturnValueOnce({ run: runInitialSignature })
			.mockReturnValueOnce({ run: runRefreshedSignature });
		createSupabaseBrowserClient.mockReturnValue({
			storage: {
				from: () => ({
					createSignedUrl,
					upload,
					remove
				})
			}
		});
		uploadWillCallSignature.mockResolvedValue(undefined);
		HTMLCanvasElement.prototype.getContext = ((
			contextId: string
		) => (contextId === '2d' ? canvasRenderingContext : null)) as typeof HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
			callback?.(new Blob(['signature'], { type: 'image/png' }));
		});

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'WC-042',
				driverName: 'WILL CALL',
				dropWeight: null,
				percentCompleted: 0,
				returnTo: '/home',
				willCall: true,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Signature' }).click();
		await page.getByLabelText('Received By').fill('Jordan');

		const canvasElement = document.querySelector('[data-testid="will-call-signature-canvas"]');
		if (!(canvasElement instanceof HTMLCanvasElement)) {
			throw new Error('Expected will call signature canvas element.');
		}

		canvasElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				clientX: 24,
				clientY: 24,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointermove', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true,
				buttons: 1
			})
		);
		canvasElement.dispatchEvent(
			new PointerEvent('pointerup', {
				clientX: 96,
				clientY: 72,
				bubbles: true,
				cancelable: true
			})
		);

		await page.getByRole('button', { name: 'Upload Signature' }).click();

		expect(runInitialSignature).toHaveBeenCalledOnce();
		await vi.waitFor(() => {
			expect(uploadWillCallSignature).toHaveBeenCalledWith({
				dropSheetId: 42,
				signaturePath: 'signatures/will-call/42/signature_123.png',
				receivedBy: 'Jordan'
			});
			expect(runRefreshedSignature).toHaveBeenCalledOnce();
		});
		await expect
			.element(page.getByRole('dialog', { name: 'Customer signature' }))
			.not.toBeInTheDocument();
	});

	it('renders the compact summary cards and department actions without the old sidebar or heading block', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: null,
				departmentLoaders: [
					{ department: 'Wrap', loaderNames: ['Kaleb', 'Anthony'] },
					{ department: 'Roll', loaderNames: ['Kaleb'] },
					{ department: 'Parts', loaderNames: [] }
				] as DepartmentLoaderGroup[],
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await expect.element(page.getByText('Select Category')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-panel')).not.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Driver'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Delivery Number'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('Weight'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('David Schmidt'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-summary-grid').getByText('L-042', { exact: true }))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-summary-grid')).not.toHaveTextContent(
			'lbs lbs'
		);
		await expect.element(page.getByTestId('select-category-summary-grid')).toHaveClass(/gap-1\.5/);
		await expect.element(page.getByText('David Schmidt', { exact: true })).toHaveClass(
			/text-lg/
		);
		await expect.element(page.getByText('David Schmidt', { exact: true })).toHaveClass(
			/font-semibold/
		);
		await expect.element(page.getByText('L-042', { exact: true })).toHaveClass(/text-lg/);
		await expect.element(page.getByText('L-042', { exact: true })).toHaveClass(/font-semibold/);
		await expect.element(page.getByText('2,152.4', { exact: true })).toHaveClass(/text-xl/);
		await expect.element(page.getByText('2,152.4', { exact: true })).toHaveClass(/font-semibold/);
		await expect.element(page.getByText('lbs', { exact: true })).toHaveClass(/text-\[10px\]/);
		await expect.element(page.getByText('lbs', { exact: true })).toHaveClass(/font-medium/);
		await expect
			.element(page.getByTestId('select-category-status-grid').getByText('DUE', { exact: true }))
			.toHaveClass(/bg-rose-500/);
		await expect.element(page.getByRole('button', { name: /Wrap/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Roll/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Parts/i })).toBeInTheDocument();
		await expect.element(page.getByText('Location 2')).not.toBeInTheDocument();
		await expect.element(page.getByText('Location 1')).not.toBeInTheDocument();
		await expect
			.element(page.getByText('Protect wrapped orders and finish the trailer handoff.'))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByText('Stage roll inventory into driver-valid loading locations.'))
			.not.toBeInTheDocument();
		await expect.element(page.getByText('50%')).toBeInTheDocument();
		await expect.element(page.getByText('25%')).toBeInTheDocument();
		await expect.element(page.getByText('75%')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-departments-card')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-departments-card')).toHaveTextContent(
			'Departments'
		);
		await expect.element(page.getByTestId('select-category-department-header-Wrap')).toHaveTextContent(
			/Wrap\s+50%\s+WAIT/
		);
		await expect.element(page.getByTestId('select-category-department-Wrap').getByText('50%')).toHaveClass(
			/bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/
		);
		await expect.element(page.getByTestId('select-category-department-Wrap').getByText('50%')).toHaveClass(
			/text-white/
		);
		await expect.element(page.getByTestId('select-category-department-progress-row-Wrap')).not.toHaveTextContent(
			'50%'
		);
		await expect.element(page.getByTestId('select-category-department-loader-row-Wrap')).toHaveTextContent(
			'Select loader'
		);
		await expect.element(
			page.getByTestId('select-category-department-Wrap').getByText('Select loader', {
				exact: true
			})
		).toHaveClass(/text-white/);
		await expect.element(page.getByTestId('select-category-loader-roster')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-roster')).toHaveTextContent(
			'Loaders'
		);
		await expect.element(page.getByTestId('select-category-loader-roster')).not.toHaveTextContent(
			'Current roster'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Wrap')).toHaveTextContent(
			'Kaleb'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Wrap')).toHaveTextContent(
			'Anthony'
		);
		await expect.element(
			page.getByTestId('select-category-loader-column-Wrap').getByText('2', { exact: true })
		).toHaveClass(/bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/);
		await expect.element(
			page.getByTestId('select-category-loader-column-Wrap').getByText('Kaleb', { exact: true })
		).toHaveClass(/text-white/);
		await expect.element(page.getByTestId('select-category-loader-column-Roll')).toHaveTextContent(
			'Kaleb'
		);
		await expect.element(page.getByTestId('select-category-loader-column-Parts')).toHaveTextContent(
			'No loaders yet for this department.'
		);
		await expect.element(page.getByTestId('select-category-loader-grid')).toHaveClass(/grid/);
		await expect.element(page.getByTestId('select-category-loader-grid')).toHaveClass(/grid-cols-3/);
		await expect.element(page.getByTestId('select-category-actions')).toHaveClass(/grid-cols-3/);
		await expect.element(page.getByTestId('select-category-departments-card')).toHaveClass(
			/bg-white\/92/
		);
		await expect.element(page.getByTestId('select-category-department-Wrap')).toHaveClass(
			/cursor-pointer/
		);
		await expect.element(page.getByTestId('select-category-department-Wrap')).toHaveClass(
			/ring-1/
		);
		await expect.element(page.getByText('Order Status')).toBeInTheDocument();
		await expect.element(page.getByText('Dropsheet')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Complete Load' })).not.toBeInTheDocument();
		await expect.element(page.getByText('Navigate')).not.toBeInTheDocument();
		await expect.element(page.getByText('Signature', { exact: true })).not.toBeInTheDocument();
	});

	it('shows a roster error banner when the loader sessions fail to load', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: null,
				departmentLoadersError: 'Roster unavailable.',
				departmentLoaders: [
					{ department: 'Wrap', loaderNames: [] },
					{ department: 'Roll', loaderNames: [] },
					{ department: 'Parts', loaderNames: [] }
				] as DepartmentLoaderGroup[],
				loaders: [
					{ id: 7, name: 'Alex', isActive: true }
				]
			}
		});

		await expect.element(page.getByTestId('select-category-loader-roster-error')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-roster-error')).toHaveTextContent(
			'Unable to load loader roster.'
		);
		await expect.element(page.getByTestId('select-category-loader-roster-error')).toHaveTextContent(
			'Roster unavailable.'
		);
		await expect.element(page.getByTestId('select-category-loader-grid')).not.toBeInTheDocument();
	});

	it('opens the loader modal on every department tap and persists the chosen loader for the loading handoff', async () => {
		const runNumberOfDrops = vi.fn().mockResolvedValue(14);
		getNumberOfDrops.mockReturnValue({
			run: runNumberOfDrops
		});
		const refresh = vi.fn();
		getLoaders.mockReturnValue(
			createLoadersQuery([
				{ id: 7, name: 'Alex', isActive: true },
				{ id: 9, name: 'Casey', isActive: true }
			], { refresh })
		);
		upsertLoaderSession.mockResolvedValue({
			id: 88,
			dropSheetId: 42,
			loaderId: 7,
			department: 'Wrap',
			loaderName: 'Alex',
			startedAt: '2026-03-24T12:00:00.000Z',
			endedAt: null
		});
		goto.mockResolvedValue(undefined);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [
					{ id: 7, name: 'Alex', isActive: true },
					{ id: 9, name: 'Casey', isActive: true }
				]
			}
		});

		await page.getByRole('button', { name: /Wrap/i }).click();
		await expect.element(page.getByTestId('selection-modal')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Refresh list' })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Refresh list' }).click();
		expect(refresh).toHaveBeenCalledOnce();

		await page.getByRole('button', { name: 'Alex' }).click();

		expect(getNumberOfDrops).toHaveBeenCalledWith({
			dropSheetId: 42,
			locationId: 2
		});
		expect(runNumberOfDrops).toHaveBeenCalledOnce();
		expect(upsertLoaderSession).toHaveBeenCalledWith(
			expect.objectContaining({
				dropSheetId: 42,
				loaderId: 7,
				department: 'Wrap',
				loaderName: 'Alex'
			})
		);
		expect(get(workflowStores.selectedDepartment)).toBe('Wrap');
		expect(get(workflowStores.currentLoader)).toEqual({
			loaderId: 7,
			loaderName: 'Alex'
		});
		await expect.element(page.getByRole('button', { name: /Wrap/i })).toHaveTextContent('Alex');
		expect(goto).toHaveBeenCalledWith(
			'/loading?dropsheetId=42&locationId=2&loaderSessionId=88&startedAt=2026-03-24T12%3A00%3A00.000Z&loadNumber=L-042&returnTo=%2Fselect-category%2F42%3FloadNumber%3DL-042%26driverName%3DDavid%2BSchmidt%26dropWeight%3D2152.4%26percentCompleted%3D0.875%26returnTo%3D%252Fdropsheets%253Fdate%253D2026-03-24&dropWeight=2152.4&driverName=David+Schmidt'
		);
	});

	it('sanitizes loader picker framework errors before rendering the modal banner', async () => {
		getLoaders.mockReturnValue(
			createLoadersQuery(
				[{ id: 7, name: 'Alex', isActive: true }],
				{ error: new Error('https://svelte.dev/e/derived_inert') }
			)
		);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: /Wrap/i }).click();

		await expect.element(page.getByRole('dialog', { name: 'Select loader for Wrap' })).toBeInTheDocument();
		await expect.element(page.getByText('Unable to load options.')).toBeInTheDocument();
		await expect.element(page.getByText('https://svelte.dev/e/derived_inert')).not.toBeInTheDocument();
	});

	it('does not render a loader picker error banner when the query is healthy', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: /Wrap/i }).click();

		await expect.element(page.getByRole('dialog', { name: 'Select loader for Wrap' })).toBeInTheDocument();
		await expect.element(page.getByText('Alex')).toBeInTheDocument();
		await expect.element(page.getByText('Unable to load options.')).not.toBeInTheDocument();
	});

	it('keeps the status strip and category cards responsive enough for the shared iPad layout', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: null,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByTestId('select-category-summary-grid')).toHaveClass(/grid/);
		await expect.element(page.getByTestId('select-category-status-grid')).toHaveClass(/grid-cols-6/);
		await expect.element(page.getByTestId('select-category-actions')).toHaveClass(/gap-3/);
		await expect.element(page.getByTestId('select-category-department-Wrap')).toHaveClass(/min-h-\[7rem\]/);
	});

	it('shows shared loading spinners for the remote status and department sections before data is ready', async () => {
		getDropsheetStatus.mockReturnValue({
			current: null,
			loading: true,
			error: null,
			refresh: vi.fn()
		});

		getDropsheetCategoryAvailability.mockReturnValue({
			current: null,
			loading: true,
			error: null,
			refresh: vi.fn()
		});

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 0.875,
				returnTo: null,
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByTestId('select-category-status-loading-spinner')).toBeInTheDocument();
		await expect
			.element(page.getByTestId('select-category-departments-loading-spinner'))
			.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-status-strip')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-actions')).not.toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-loader-roster')).toBeInTheDocument();
	});

	it('shows the legacy stacked complete-load footer only when percent completed reaches one', async () => {
		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 1,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await expect.element(page.getByTestId('select-category-action-footer')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-utility-actions')).toBeInTheDocument();
		await expect.element(page.getByTestId('select-category-complete-action-row')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Complete Load' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Complete Load' }))
			.toHaveTextContent('Complete Load');
	});

	it('opens the completion modal, shows the shared spinner while pending, and returns to dropsheets on success', async () => {
		const completionRequest = createDeferred<{ ok: true; partial: false }>();
		completeLoadingEmail.mockReturnValue(completionRequest.promise);
		goto.mockResolvedValue(undefined);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 1,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Complete Load' }).click();
		await expect.element(page.getByTestId('complete-loading-modal')).toBeInTheDocument();
		await expect.element(page.getByText('Complete Loading', { exact: true })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Confirm', exact: true }).click();

		expect(completeLoadingEmail).toHaveBeenCalledWith({ dropSheetId: 42 });
		await expect.element(page.getByTestId('complete-loading-confirm-spinner')).toBeInTheDocument();
		await expect.element(page.getByLabelText('Completing loading')).toBeInTheDocument();

		completionRequest.resolve({ ok: true, partial: false });
		await Promise.resolve();

		expect(goto).toHaveBeenCalledWith('/dropsheets?date=2026-03-24');
	});

	it('shows a do-not-resend warning and still exits when post-send sync fails after notifications were sent', async () => {
		completeLoadingEmail.mockResolvedValue({
			ok: true,
			partial: true,
			postSendSync: {
				status: 'failed',
				orderNumbers: [41012026],
				errors: ['spUpdateOrderBackToInvoiced failed'],
				retryRecommended: false
			}
		});
		goto.mockResolvedValue(undefined);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 1,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Complete Load' }).click();
		await page.getByRole('button', { name: 'Confirm', exact: true }).click();

		expect(toastWarning).toHaveBeenCalledWith(
			'Notifications were already sent. Internal sync still needs attention. Do not resend.'
		);
		expect(goto).toHaveBeenCalledWith('/dropsheets?date=2026-03-24');
		await expect.element(page.getByTestId('complete-loading-modal')).not.toBeInTheDocument();
	});

	it('reuses an already-resolved returnTo path when exiting complete load', async () => {
		resolve.mockImplementation((href: string) => `/base${href}`);
		completeLoadingEmail.mockResolvedValue({ ok: true, partial: false });
		goto.mockResolvedValue(undefined);

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 1,
				returnTo: '/base/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Complete Load' }).click();
		await page.getByRole('button', { name: 'Confirm', exact: true }).click();

		expect(goto).toHaveBeenCalledWith('/base/dropsheets?date=2026-03-24');
	});

	it('keeps the completion modal open and shows the status code plus description when the request fails', async () => {
		completeLoadingEmail.mockRejectedValue(new Error('500 Internal Server Error: email dispatch failed'));

		render(SelectCategoryPage, {
			params: { dropsheetId: '42' },
			form: null,
			data: {
				...layoutData,
				dropSheetId: 42,
				loadNumber: 'L-042',
				driverName: 'David Schmidt',
				dropWeight: 2152.4,
				percentCompleted: 1,
				returnTo: '/dropsheets?date=2026-03-24',
				loaders: [{ id: 7, name: 'Alex', isActive: true }]
			}
		});

		await page.getByRole('button', { name: 'Complete Load' }).click();
		await page.getByRole('button', { name: 'Confirm', exact: true }).click();

		await expect.element(page.getByTestId('complete-loading-modal')).toBeInTheDocument();
		await expect.element(page.getByTestId('complete-loading-error')).toHaveTextContent(
			'500 Internal Server Error: email dispatch failed'
		);
		expect(goto).not.toHaveBeenCalled();
	});
});
