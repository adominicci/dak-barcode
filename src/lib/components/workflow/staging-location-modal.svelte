<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { LoaderCircle, MapPin, RefreshCw, TriangleAlert, X } from '@lucide/svelte';
	import { getOperatorErrorMessage } from '$lib/operator-error';
	import { readRemoteQuery } from '$lib/remote-query-read';
	import { getDropArea } from '$lib/drop-areas.remote';
	import { getDropAreasByDepartment } from '$lib/drop-areas.cached';
	import type { Target } from '$lib/auth/types';
	import type { DropArea } from '$lib/types';
	import type {
		WorkflowDepartment,
		WorkflowDropAreaSelection
	} from '$lib/workflow/stores';

	let {
		department,
		driverLocationOnly = false,
		mode = 'staging',
		target = null,
		onClose,
		onSelect
	}: {
		department: WorkflowDepartment;
		driverLocationOnly?: boolean;
		mode?: 'staging' | 'loading';
		target?: Target | null;
		onClose: () => void;
		onSelect: (dropArea: NonNullable<WorkflowDropAreaSelection>) => void;
	} = $props();

	let lookupValue = $state('');
	let lookupError = $state<string | null>(null);
	let isResolvingLookup = $state(false);
	let lookupInput: HTMLInputElement | null = null;
	let modalElement: HTMLElement | null = null;
	let activeLookupRequestToken = $state(0);
	let selectedLetterTab = $state<string | null>(null);
	let selectedSecondLetterTab = $state<string | null>(null);
	const tabPanelId = 'staging-location-tabpanel';
	const secondTabPanelId = 'staging-location-second-tabpanel';
	const ALL_SECOND_LETTER_GROUP_KEY = 'All';
	const dropAreaNameCollator = new Intl.Collator(undefined, {
		numeric: true,
		sensitivity: 'base'
	});

	function getDropAreasQuery() {
		return driverLocationOnly || department === null
			? null
			: getDropAreasByDepartment(department, target);
	}

	const dropAreasState = $derived.by(() => {
		const query = getDropAreasQuery();
		return {
			active: query !== null,
			current: query?.current ?? [],
			error: query?.error ?? null,
			loading: query?.loading ?? false,
			refresh: query ? () => query.refresh() : null
		};
	});

	const departmentSupportKey = {
		Wrap: 'supportsWrap',
		Roll: 'supportsRoll',
		Parts: 'supportsParts'
	} as const satisfies Record<NonNullable<WorkflowDepartment>, keyof DropArea>;
	const visibleDropAreas = $derived.by(() => {
		const availableDropAreas = dropAreasState.current;
		return availableDropAreas.filter(isSelectableDropArea);
	});
	const dropAreasError = $derived(dropAreasState.error);
	const isDropAreasLoading = $derived(dropAreasState.loading);
	const groupedDropAreas = $derived.by(() => {
		const groups: Record<string, DropArea[]> = {};

		for (const dropArea of visibleDropAreas) {
			const groupKey = resolveDropAreaGroupKey(dropArea);
			const existingGroup = groups[groupKey] ?? [];
			existingGroup.push(dropArea);
			groups[groupKey] = existingGroup;
		}

		return Object.entries(groups)
			.sort(([leftKey], [rightKey]) => dropAreaNameCollator.compare(leftKey, rightKey))
			.map(([key, dropAreas]) => ({
				key,
				dropAreas: [...dropAreas].sort(
					(left, right) =>
						dropAreaNameCollator.compare(left.name, right.name) || left.id - right.id
				)
			}));
	});
	const activeLetterTab = $derived.by(() => {
		const availableGroupKeys = groupedDropAreas.map((group) => group.key);

		if (availableGroupKeys.length === 0) {
			return null;
		}

		if (selectedLetterTab !== null && availableGroupKeys.includes(selectedLetterTab)) {
			return selectedLetterTab;
		}

		return availableGroupKeys[0];
	});
	const activeLetterGroup = $derived.by(
		() => groupedDropAreas.find((group) => group.key === activeLetterTab) ?? null
	);
	const shouldUseSecondLetterGrouping = $derived(
		mode === 'staging' && target === 'Freeport' && department === 'Roll'
	);
	const secondLetterGroups = $derived.by(() => {
		if (!shouldUseSecondLetterGrouping || !activeLetterGroup) {
			return [];
		}

		const groups: Record<string, DropArea[]> = {};

		for (const dropArea of activeLetterGroup.dropAreas) {
			const groupKey = resolveDropAreaSecondGroupKey(dropArea, activeLetterGroup.key);
			if (!groupKey) {
				continue;
			}

			const existingGroup = groups[groupKey] ?? [];
			existingGroup.push(dropArea);
			groups[groupKey] = existingGroup;
		}

		return Object.entries(groups)
			.sort(([leftKey], [rightKey]) => dropAreaNameCollator.compare(leftKey, rightKey))
			.map(([key, dropAreas]) => ({
				key,
				dropAreas: [...dropAreas].sort(
					(left, right) =>
						dropAreaNameCollator.compare(left.name, right.name) || left.id - right.id
				)
			}));
	});
	const availableSecondLetterGroupKeys = $derived.by(() => {
		if (!shouldUseSecondLetterGrouping || !activeLetterGroup) {
			return [];
		}

		return [ALL_SECOND_LETTER_GROUP_KEY, ...secondLetterGroups.map((group) => group.key)];
	});
	const activeSecondLetterTab = $derived.by(() => {
		if (!shouldUseSecondLetterGrouping || !activeLetterGroup) {
			return null;
		}

		if (
			selectedSecondLetterTab !== null &&
			availableSecondLetterGroupKeys.includes(selectedSecondLetterTab)
		) {
			return selectedSecondLetterTab;
		}

		return ALL_SECOND_LETTER_GROUP_KEY;
	});
	const activeTabPanelId = $derived(
		shouldUseSecondLetterGrouping ? secondTabPanelId : tabPanelId
	);
	const activeDropAreaOptions = $derived.by(() => {
		const baseDropAreas = activeLetterGroup?.dropAreas ?? [];

		if (
			!shouldUseSecondLetterGrouping ||
			activeSecondLetterTab === null ||
			activeSecondLetterTab === ALL_SECOND_LETTER_GROUP_KEY
		) {
			return baseDropAreas;
		}

		const matchingSecondLetterGroup = secondLetterGroups.find(
			(group) => group.key === activeSecondLetterTab
		);
		return matchingSecondLetterGroup?.dropAreas ?? [];
	});

	onMount(() => {
		lookupInput?.focus();
	});

	onDestroy(() => {
		invalidateLookupRequests();
	});

	function invalidateLookupRequests() {
		activeLookupRequestToken += 1;
	}

	function resolveDropAreaGroupKey(dropArea: DropArea) {
		const normalizedFirstCharacter = dropArea.firstCharacter?.trim().charAt(0).toUpperCase();
		if (normalizedFirstCharacter) {
			return normalizedFirstCharacter;
		}

		const normalizedNameCharacter = dropArea.name.trim().charAt(0).toUpperCase();
		return normalizedNameCharacter || '#';
	}

	function resolveDropAreaSecondGroupKey(dropArea: DropArea, firstGroupKey: string) {
		const normalizedSegments = dropArea.name
			.trim()
			.toUpperCase()
			.split('-')
			.map((segment) => segment.trim())
			.filter(Boolean);

		if (normalizedSegments.length > 0) {
			const [firstSegment, ...remainingSegments] = normalizedSegments;
			const candidateSegments =
				firstSegment.charAt(0) === firstGroupKey ? remainingSegments : normalizedSegments;

			for (const segment of candidateSegments) {
				const alphaMatch = segment.match(/[A-Z]/);
				if (alphaMatch) {
					return alphaMatch[0];
				}
			}
		}

		const compactName = dropArea.name.trim().toUpperCase().replace(/-/g, '');
		const firstGroupIndex = compactName.indexOf(firstGroupKey);
		if (firstGroupIndex === -1) {
			return null;
		}

		const remainingName = compactName.slice(firstGroupIndex + 1);
		const alphaMatch = remainingName.match(/[A-Z]/);
		return alphaMatch?.[0] ?? null;
	}

	function isSelectableDropArea(dropArea: DropArea) {
		if (driverLocationOnly) {
			return dropArea.supportsDriverLocation;
		}

		if (department !== null && !dropArea[departmentSupportKey[department]]) {
			return false;
		}

		if (mode === 'loading') {
			return dropArea.supportsLoading && dropArea.supportsDriverLocation;
		}

		return true;
	}

	function commitSelection(dropArea: DropArea) {
		invalidateLookupRequests();
		isResolvingLookup = false;
		lookupError = null;
		lookupValue = '';
		onSelect({
			dropAreaId: dropArea.id,
			dropAreaLabel: dropArea.name
		});
	}

	function handleClose() {
		invalidateLookupRequests();
		isResolvingLookup = false;
		onClose();
	}

	function handleTabListKeydown(event: KeyboardEvent) {
		if (
			event.key !== 'ArrowLeft' &&
			event.key !== 'ArrowRight' &&
			event.key !== 'Home' &&
			event.key !== 'End'
		) {
			return;
		}

		const tablist = event.currentTarget;
		if (!(tablist instanceof HTMLElement)) {
			return;
		}

		const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
		if (tabs.length === 0) {
			return;
		}

		const activeIndex =
			tabs.findIndex((tab) => tab === document.activeElement) ??
			tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');

		const currentIndex = activeIndex >= 0 ? activeIndex : 0;
		let nextIndex = currentIndex;

		if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = tabs.length - 1;
		} else if (event.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
		} else if (event.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % tabs.length;
		}

		event.preventDefault();
		const nextTab = tabs[nextIndex];
		selectedLetterTab = nextTab.dataset.letterTab ?? null;
		selectedSecondLetterTab = null;
		nextTab.focus();
	}

	function handleSecondTabListKeydown(event: KeyboardEvent) {
		if (
			event.key !== 'ArrowLeft' &&
			event.key !== 'ArrowRight' &&
			event.key !== 'Home' &&
			event.key !== 'End'
		) {
			return;
		}

		const tablist = event.currentTarget;
		if (!(tablist instanceof HTMLElement)) {
			return;
		}

		const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
		if (tabs.length === 0) {
			return;
		}

		const activeIndex =
			tabs.findIndex((tab) => tab === document.activeElement) ??
			tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');

		const currentIndex = activeIndex >= 0 ? activeIndex : 0;
		let nextIndex = currentIndex;

		if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = tabs.length - 1;
		} else if (event.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
		} else if (event.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % tabs.length;
		}

		event.preventDefault();
		const nextTab = tabs[nextIndex];
		selectedSecondLetterTab = nextTab.dataset.secondLetterTab ?? null;
		nextTab.focus();
	}

	function getFocusableElements() {
		if (!modalElement) {
			return [];
		}

		return Array.from(
			modalElement.querySelectorAll<HTMLElement>(
				'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => !element.hasAttribute('hidden') && element.tabIndex !== -1);
	}

	function handleModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
			return;
		}

		if (event.key !== 'Tab') {
			return;
		}

		const focusableElements = getFocusableElements();
		if (focusableElements.length === 0) {
			return;
		}

		const firstFocusableElement = focusableElements[0];
		const lastFocusableElement = focusableElements[focusableElements.length - 1];
		const activeElement = document.activeElement;

		if (event.shiftKey) {
			if (activeElement === firstFocusableElement) {
				event.preventDefault();
				lastFocusableElement?.focus();
			}

			return;
		}

		if (activeElement === lastFocusableElement) {
			event.preventDefault();
			firstFocusableElement?.focus();
		}
	}

	async function handleLookupSubmit(event?: SubmitEvent) {
		event?.preventDefault();

		const trimmedLookupValue = lookupValue.trim();
		if (!/^\d+$/.test(trimmedLookupValue)) {
			lookupError = 'Location is not valid.';
			return;
		}

		const parsedDropAreaId = Number.parseInt(trimmedLookupValue, 10);
		if (!Number.isInteger(parsedDropAreaId) || parsedDropAreaId <= 0) {
			lookupError = 'Location is not valid.';
			return;
		}

		lookupError = null;
		isResolvingLookup = true;
		const lookupRequestToken = activeLookupRequestToken + 1;
		activeLookupRequestToken = lookupRequestToken;

		try {
			const dropArea = await readRemoteQuery(getDropArea(parsedDropAreaId));
			if (activeLookupRequestToken !== lookupRequestToken) {
				return;
			}

			if (!dropArea) {
				lookupError = 'Location is not valid.';
				return;
			}

			if (!isSelectableDropArea(dropArea)) {
				lookupError =
					mode === 'loading'
						? 'Location is not valid.'
						: 'This location does not support the selected department.';
				return;
			}

			commitSelection(dropArea);
		} catch (error) {
			if (activeLookupRequestToken !== lookupRequestToken) {
				return;
			}

			lookupError =
				error instanceof Error ? error.message : 'Unable to resolve this location right now.';
		} finally {
			if (activeLookupRequestToken === lookupRequestToken) {
				isResolvingLookup = false;
			}
		}
	}
</script>

<div
	class="ds-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
>
	<div
		data-testid="staging-location-modal"
		role="dialog"
		aria-modal="true"
		aria-label={driverLocationOnly ? 'Driver location selector' : 'Staging location selector'}
		tabindex="-1"
		bind:this={modalElement}
		class={`ds-modal w-full overflow-hidden p-4 ${
			driverLocationOnly ? 'max-w-5xl' : 'h-[calc(100dvh-3rem)] max-w-7xl'
		}`}
		onkeydown={handleModalKeydown}
	>
		<div
			class={`flex min-h-0 flex-col ${
				driverLocationOnly ? '' : 'h-full overflow-hidden'
			}`}
		>
			<div class="flex justify-end gap-2">
				{#if dropAreasState.active}
					<button
						type="button"
						class="flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={() => void dropAreasState.refresh?.()}
						aria-label="Refresh list"
						disabled={isDropAreasLoading}
					>
						<RefreshCw class={`size-4 ${isDropAreasLoading ? 'animate-spin' : ''}`} />
					</button>
				{/if}

				<button
					type="button"
					class="flex size-12 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-slate-500 transition hover:text-slate-900"
					onclick={handleClose}
					aria-label="Close location selector"
				>
					<X class="size-5" />
				</button>
			</div>

			<div
				class={`mt-3 flex min-h-0 flex-col gap-3 ${
					driverLocationOnly ? '' : 'flex-1 overflow-hidden'
				}`}
			>
				<form
					class="rounded-[var(--ds-radius-card)] bg-white p-3"
					onsubmit={handleLookupSubmit}
				>
					<div class="flex flex-col gap-3 lg:flex-row lg:items-end">
						<div class="flex-1 space-y-2">
							<label class="ui-label px-1 text-xs" for="staging-location-lookup">Scan new location</label>
							<input
								id="staging-location-lookup"
								bind:value={lookupValue}
								bind:this={lookupInput}
								inputmode="numeric"
								placeholder="Enter location ID"
								class="ds-scan-input h-14 w-full px-4 text-base font-medium transition placeholder:text-on-surface-variant/55"
							/>
						</div>

						<button
							type="submit"
							disabled={isResolvingLookup}
							class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--ds-radius-control)] border-0 bg-ds-blue-500 px-6 text-sm font-semibold text-white transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto lg:min-w-44"
						>
							{#if isResolvingLookup}
								<LoaderCircle class="size-4 animate-spin" />
								Checking location...
							{:else}
								<MapPin class="size-4" />
								Set location
							{/if}
						</button>
					</div>

					{#if lookupError}
						<div class="mt-4 flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700">
							<TriangleAlert class="mt-0.5 size-4 shrink-0" />
							<p>{lookupError}</p>
						</div>
					{/if}
				</form>

				{#if !driverLocationOnly}
					<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--ds-radius-card)] bg-white p-3">
						<div
							data-testid="staging-location-list-scroll-region"
							class="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
						>
						{#if department === null}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-on-surface-variant/70">
								<MapPin class="size-7 text-primary/70" />
								<p class="text-sm font-medium">Scan a driver location to continue.</p>
							</div>
						{:else if dropAreasError}
							<div class="flex gap-3 rounded-[var(--ds-radius-card)] bg-rose-50 px-4 py-4 text-sm text-rose-700">
								<TriangleAlert class="mt-0.5 size-4 shrink-0" />
								<p>
									{getOperatorErrorMessage(
										dropAreasError,
										'Unable to load locations.'
									)}
								</p>
							</div>
						{:else if isDropAreasLoading}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<LoaderCircle class="size-7 animate-spin text-primary" />
								<p class="text-sm font-medium">Loading locations...</p>
							</div>
							{:else if visibleDropAreas.length === 0}
							<div class="flex min-h-40 flex-col items-center justify-center gap-3 text-on-surface-variant/70">
								<MapPin class="size-7 text-primary/70" />
								<p class="text-sm font-medium">No locations are available for this department yet.</p>
							</div>
						{:else}
							<div
								data-testid="staging-location-letter-tabs"
								role="tablist"
								tabindex="-1"
								aria-label="Location groups"
								class="flex gap-2 overflow-x-auto overscroll-contain pb-1"
								onkeydown={handleTabListKeydown}
							>
								{#each groupedDropAreas as group (group.key)}
									<button
										type="button"
										role="tab"
										aria-selected={group.key === activeLetterTab}
										aria-controls={activeTabPanelId}
										data-letter-tab={group.key}
										tabindex={group.key === activeLetterTab ? 0 : -1}
										class={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] px-3 text-sm font-semibold transition ${
											group.key === activeLetterTab
												? 'ui-primary-gradient text-white shadow-[var(--shadow-primary)]'
												: 'bg-surface-container-low text-slate-700 hover:bg-surface-container-high'
										}`}
										onclick={() => {
											selectedLetterTab = group.key;
											selectedSecondLetterTab = null;
										}}
									>
										{group.key}
									</button>
								{/each}
							</div>

							{#if shouldUseSecondLetterGrouping && availableSecondLetterGroupKeys.length > 1}
								<div
									data-testid="staging-location-second-letter-tabs"
									role="tablist"
									tabindex="-1"
									aria-label="Location subgroups"
									class="mt-3 flex gap-2 overflow-x-auto overscroll-contain pb-1"
									onkeydown={handleSecondTabListKeydown}
								>
									{#each availableSecondLetterGroupKeys as groupKey (groupKey)}
										<button
											type="button"
											role="tab"
											aria-selected={groupKey === activeSecondLetterTab}
											aria-controls={secondTabPanelId}
											data-second-letter-tab={groupKey}
											tabindex={groupKey === activeSecondLetterTab ? 0 : -1}
										class={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)] px-3 text-sm font-semibold transition ${
												groupKey === activeSecondLetterTab
													? 'ui-primary-gradient text-white shadow-[var(--shadow-primary)]'
													: 'bg-surface-container-low text-slate-700 hover:bg-surface-container-high'
											}`}
											onclick={() => {
												selectedSecondLetterTab = groupKey;
											}}
										>
											{groupKey}
										</button>
									{/each}
								</div>
							{/if}

							<div
								id={activeTabPanelId}
								data-testid="staging-location-modal-grid"
								role="tabpanel"
								aria-label={
									activeLetterTab
										? shouldUseSecondLetterGrouping && activeSecondLetterTab
											? `${activeLetterTab} ${activeSecondLetterTab} locations`
											: `${activeLetterTab} locations`
										: 'Locations'
								}
								class="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
							>
								{#each activeDropAreaOptions as dropArea (dropArea.id)}
									<button
										type="button"
										class="ds-action-card group flex min-h-16 flex-col justify-center px-4 py-3 text-left text-white"
										onclick={() => commitSelection(dropArea)}
									>
										<p class="text-2xl font-semibold text-white">
											{dropArea.name}
										</p>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				{/if}
			</div>
		</div>
	</div>
</div>
