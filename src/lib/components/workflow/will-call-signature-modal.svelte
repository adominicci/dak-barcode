<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Eraser, LoaderCircle, Upload, X } from '@lucide/svelte';
	import { createSupabaseBrowserClient } from '$lib/supabase/client';
	import type { WillCallSignatureRecord } from '$lib/types';
	import {
		WILL_CALL_SIGNATURE_BUCKET,
		WILL_CALL_SIGNATURE_URL_TTL_SECONDS,
		buildWillCallSignatureStoragePath,
		isAbsoluteHttpUrl
	} from '$lib/will-call';
	import { uploadWillCallSignature } from '$lib/will-call.remote';

	type Point = {
		x: number;
		y: number;
	};

	let {
		dropSheetId,
		signatureRecord,
		onClose,
		onUploaded = () => undefined
	}: {
		dropSheetId: number;
		signatureRecord: WillCallSignatureRecord;
		onClose: () => void;
		onUploaded?: () => void | Promise<void>;
	} = $props();

	let receivedBy = $state('');
	let uploadError = $state<string | null>(null);
	let resolvedSignatureUrl = $state<string | null>(null);
	let isResolvingSignature = $state(false);
	let isUploading = $state(false);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let inputElement = $state<HTMLInputElement | null>(null);
	let isDrawing = $state(false);
	let hasSignatureStroke = $state(false);
	let lastPoint = $state<Point | null>(null);
	const receivedByRequiredMessage = 'Received By is required.';

	const isViewOnly = $derived(Boolean(signatureRecord.signaturePath?.trim()));

	onMount(() => {
		receivedBy = signatureRecord.receivedBy ?? '';
		void focusReceivedBy();
		void hydrateExistingSignature();
		initializeCanvasContext();
	});

	async function focusReceivedBy() {
		if (isViewOnly) {
			return;
		}

		await tick();
		inputElement?.focus();
	}

	function initializeCanvasContext() {
		if (!canvasElement || isViewOnly) {
			return;
		}

		const context = canvasElement.getContext('2d');

		if (!context) {
			return;
		}

		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = 3;
		context.strokeStyle = '#1a1b1f';
	}

	async function hydrateExistingSignature() {
		const signaturePath = signatureRecord.signaturePath?.trim();

		if (!signaturePath) {
			return;
		}

		if (isAbsoluteHttpUrl(signaturePath)) {
			resolvedSignatureUrl = signaturePath;
			return;
		}

		isResolvingSignature = true;

		try {
			const supabase = createSupabaseBrowserClient();
			const { data, error } = await supabase.storage
				.from(WILL_CALL_SIGNATURE_BUCKET)
				.createSignedUrl(signaturePath, WILL_CALL_SIGNATURE_URL_TTL_SECONDS);

			if (error) {
				throw error;
			}

			resolvedSignatureUrl = data.signedUrl;
		} catch (error) {
			uploadError =
				error instanceof Error ? error.message : 'Unable to load the saved signature preview.';
		} finally {
			isResolvingSignature = false;
		}
	}

	function getCanvasPoint(event: PointerEvent): Point | null {
		if (!canvasElement) {
			return null;
		}

		const rect = canvasElement.getBoundingClientRect();
		const widthScale = rect.width === 0 ? 1 : canvasElement.width / rect.width;
		const heightScale = rect.height === 0 ? 1 : canvasElement.height / rect.height;

		return {
			x: (event.clientX - rect.left) * widthScale,
			y: (event.clientY - rect.top) * heightScale
		};
	}

	function beginStroke(event: PointerEvent) {
		if (!canvasElement || isViewOnly) {
			return;
		}

		const context = canvasElement.getContext('2d');
		const point = getCanvasPoint(event);

		if (!context || !point) {
			return;
		}

		event.preventDefault();
		isDrawing = true;
		lastPoint = point;
		context.beginPath();
		context.moveTo(point.x, point.y);
	}

	function continueStroke(event: PointerEvent) {
		if (!isDrawing || !canvasElement || !lastPoint) {
			return;
		}

		const context = canvasElement.getContext('2d');
		const point = getCanvasPoint(event);

		if (!context || !point) {
			return;
		}

		event.preventDefault();
		hasSignatureStroke = true;
		context.lineTo(point.x, point.y);
		context.stroke();
		lastPoint = point;
	}

	function endStroke() {
		isDrawing = false;
		lastPoint = null;
	}

	function clearSignature() {
		if (!canvasElement) {
			return;
		}

		const context = canvasElement.getContext('2d');

		if (!context) {
			return;
		}

		context.clearRect(0, 0, canvasElement.width, canvasElement.height);
		hasSignatureStroke = false;
		uploadError = null;
	}

	function exportSignatureBlob(): Promise<Blob> {
		return new Promise((resolve, reject) => {
			if (!canvasElement) {
				reject(new Error('Signature pad is not available.'));
				return;
			}

			canvasElement.toBlob((blob) => {
				if (!blob) {
					reject(new Error('Signature is empty.'));
					return;
				}

				resolve(blob);
			}, 'image/png');
		});
	}

	async function handleUpload() {
		if (isUploading || isViewOnly) {
			return;
		}

		uploadError = null;
		const trimmedReceivedBy = receivedBy.trim();

		if (!trimmedReceivedBy) {
			uploadError = receivedByRequiredMessage;
			void focusReceivedBy();
			return;
		}

		if (!hasSignatureStroke) {
			uploadError = 'Signature is empty.';
			return;
		}

		isUploading = true;
		let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;
		let uploadedSignaturePath: string | null = null;

		try {
			const signatureBlob = await exportSignatureBlob();
			supabaseClient = createSupabaseBrowserClient();
			const signaturePath = buildWillCallSignatureStoragePath(dropSheetId);
			const { data, error } = await supabaseClient.storage
				.from(WILL_CALL_SIGNATURE_BUCKET)
				.upload(signaturePath, signatureBlob, {
					contentType: 'image/png',
					upsert: false
				});

			if (error) {
				throw error;
			}

			uploadedSignaturePath = data.path;

			await uploadWillCallSignature({
				dropSheetId,
				signaturePath: uploadedSignaturePath,
				receivedBy: trimmedReceivedBy
			});

			let refreshError: unknown = null;
			try {
				await onUploaded();
			} catch (error) {
				refreshError = error;
			}

			onClose();

			if (refreshError) {
				console.error('Will call signature refresh failed after upload.', refreshError);
			}
		} catch (error) {
			if (uploadedSignaturePath && supabaseClient) {
				const { error: cleanupError } = await supabaseClient.storage
					.from(WILL_CALL_SIGNATURE_BUCKET)
					.remove([uploadedSignaturePath]);

				if (cleanupError) {
					console.error('Will call signature cleanup failed after DST persistence error.', cleanupError);
				}
			}

			uploadError =
				error instanceof Error ? error.message : 'Unable to upload the signature right now.';
		} finally {
			isUploading = false;
		}
	}
</script>

<div
	data-testid="will-call-signature-modal-backdrop"
	class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
>
	<div
		data-testid="will-call-signature-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="will-call-signature-title"
		class="h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white/96 p-4 shadow-[0_40px_120px_-52px_rgba(15,23,42,0.48)] ring-1 ring-white/80 sm:p-5"
	>
		<div class="flex h-full min-h-0 flex-col rounded-[1.75rem] bg-surface-container-low p-5 sm:p-6">
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1">
					<p class="ui-label text-[10px] text-on-surface-variant">Will Call</p>
					<h2
						id="will-call-signature-title"
						class="text-2xl font-bold tracking-tight text-slate-950"
					>
						Customer signature
					</h2>
					<p class="text-sm leading-6 text-on-surface-variant">
						{#if isViewOnly}
							This signature is already captured and locked for review.
						{:else}
							Capture the pickup signature, upload it to Supabase, and save the stable path back to
							DST.
						{/if}
					</p>
				</div>

				<button
					type="button"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[var(--shadow-soft)] transition hover:text-slate-900"
					aria-label="Close will call signature modal"
					onclick={onClose}
				>
					<X class="size-5" />
				</button>
			</div>

			<div class="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
				<div class="space-y-4">
					<div class="rounded-[1.5rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
						<label class="ui-label px-1 text-xs" for="will-call-received-by">Received By</label>
						<input
							id="will-call-received-by"
							bind:this={inputElement}
							bind:value={receivedBy}
							type="text"
							class="mt-2 h-14 w-full rounded-[1.25rem] bg-surface-high px-4 text-lg font-semibold tracking-tight text-slate-950 outline-none ring-1 ring-transparent transition focus:ring-[color:var(--ring)] read-only:text-slate-600"
							placeholder="Received By"
							readonly={isViewOnly}
							disabled={isUploading}
						/>
					</div>

					<div class="rounded-[1.5rem] bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100">
						<div class="flex items-center justify-between gap-3">
							<p class="ui-label text-[10px] text-on-surface-variant">
								{isViewOnly ? 'Saved Signature' : 'Draw Signature'}
							</p>

							{#if !isViewOnly}
								<button
									type="button"
									class="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-surface-container"
									onclick={clearSignature}
									disabled={isUploading}
								>
									<Eraser class="size-4" />
									Clear
								</button>
							{/if}
						</div>

						<div class="mt-3 overflow-hidden rounded-[1.5rem] ring-1 ring-slate-200">
							{#if isViewOnly}
								{#if isResolvingSignature}
									<div class="flex h-[20rem] items-center justify-center bg-surface-high">
										<LoaderCircle class="size-7 animate-spin text-primary" />
									</div>
								{:else if resolvedSignatureUrl}
									<img
										src={resolvedSignatureUrl}
										alt="Will call signature preview"
										class="h-[20rem] w-full bg-white object-contain"
									/>
								{:else}
									<div class="flex h-[20rem] items-center justify-center bg-surface-high px-6 text-center text-sm text-slate-500">
										The saved signature preview is unavailable right now.
									</div>
								{/if}
							{:else}
								<canvas
									bind:this={canvasElement}
									data-testid="will-call-signature-canvas"
									width="960"
									height="360"
									class="h-[20rem] w-full touch-none bg-white"
									onpointerdown={beginStroke}
									onpointermove={continueStroke}
									onpointerup={endStroke}
									onpointerleave={endStroke}
								></canvas>
							{/if}
						</div>
					</div>

					{#if uploadError}
						<div class="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
							<p class="font-semibold">Signature unavailable</p>
							<p class="mt-1 leading-6">{uploadError}</p>
						</div>
					{/if}
				</div>
			</div>

			{#if !isViewOnly}
				<div class="mt-5 flex justify-end">
					<button
						type="button"
						class="ui-primary-gradient inline-flex min-h-12 items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
						disabled={isUploading}
						onclick={handleUpload}
					>
						{#if isUploading}
							<LoaderCircle class="size-4 animate-spin" />
						{:else}
							<Upload class="size-4" />
						{/if}
						Upload Signature
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
