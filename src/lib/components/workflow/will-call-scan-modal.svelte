<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { LoaderCircle, PackageSearch, ScanBarcode, X } from '@lucide/svelte';
	import { readRemoteQuery } from '$lib/remote-query-read';
	import { lookupWillCallDropsheet } from '$lib/will-call.remote';

	let {
		onClose,
		onResolved
	}: {
		onClose: () => void;
		onResolved: (dropSheetId: number, loadNumber: string) => void | Promise<void>;
	} = $props();

	let scanValue = $state('');
	let errorMessage = $state<string | null>(null);
	let isSubmitting = $state(false);
	let inputElement = $state<HTMLInputElement | null>(null);
	let isActive = true;

	onMount(() => {
		void focusInput();

		return () => {
			isActive = false;
		};
	});

	async function focusInput() {
		await tick();
		inputElement?.focus();
	}

	function clearScanValue() {
		scanValue = '';
	}

	async function submitScan() {
		if (isSubmitting) {
			return;
		}

		const loadNumber = scanValue.trim();
		clearScanValue();
		errorMessage = null;

		if (!loadNumber) {
			await focusInput();
			return;
		}

		isSubmitting = true;
		let shouldRefocus = false;

		try {
			const result = await readRemoteQuery(lookupWillCallDropsheet(loadNumber));
			if (!isActive) {
				return;
			}

			await onResolved(result.dropSheetId, loadNumber);
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to resolve that delivery number.';
			shouldRefocus = true;
		} finally {
			isSubmitting = false;
		}

		if (shouldRefocus) {
			await focusInput();
		}
	}

	async function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();
		await submitScan();
	}

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		onClose();
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
	<div
		data-testid="will-call-scan-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="will-call-scan-title"
		class="w-full max-w-2xl rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
	>
		<div class="rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1">
					<p class="ui-label text-[10px] text-on-surface-variant">Will Call</p>
					<h2 id="will-call-scan-title" class="text-2xl font-bold tracking-tight text-slate-950">
						Scan delivery number
					</h2>
					<p class="text-sm leading-6 text-on-surface-variant">
						Keep the scanner focused here, scan the pack list, and we will jump straight into the
						Will Call category view.
					</p>
				</div>

				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900"
					aria-label="Close will call scan modal"
					disabled={isSubmitting}
					onclick={handleClose}
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-6 space-y-4">
				<div class="rounded-[1.5rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
					<label class="ui-label px-1 text-xs" for="will-call-scan-input">Delivery Number</label>
					<div class="mt-2 flex items-center gap-3 rounded-[1.25rem] bg-surface-high px-4 py-3 ring-1 ring-transparent focus-within:ring-[color:var(--ring)]">
						<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-[var(--shadow-soft)]">
							<ScanBarcode class="size-5" />
						</span>
						<input
							id="will-call-scan-input"
							data-testid="will-call-scan-input"
							bind:this={inputElement}
							bind:value={scanValue}
							type="text"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="characters"
							spellcheck="false"
							class="min-w-0 flex-1 bg-transparent text-lg font-semibold tracking-[0.04em] text-slate-950 outline-none placeholder:text-slate-400"
							placeholder="Scan Pack List"
							disabled={isSubmitting}
							onkeydown={handleKeydown}
						/>
						{#if isSubmitting}
							<LoaderCircle class="size-5 animate-spin text-primary" />
						{:else}
							<PackageSearch class="size-5 text-slate-400" />
						{/if}
					</div>
				</div>

				{#if errorMessage}
					<div
						data-testid="will-call-scan-error"
						class="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700"
					>
						<p class="font-semibold">Scan not accepted</p>
						<p class="mt-1 leading-6">{errorMessage}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
