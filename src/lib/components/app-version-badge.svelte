<script lang="ts">
	import { APP_RELEASE_HISTORY, APP_VERSION } from '$lib/app-version';
	import WorkflowModalShell from '$lib/components/workflow/workflow-modal-shell.svelte';

	let {
		testId = 'app-version-badge',
		wrapperClass = '',
		buttonClass = ''
	}: {
		testId?: string;
		wrapperClass?: string;
		buttonClass?: string;
	} = $props();

	let isHistoryOpen = $state(false);
</script>

<div class={`inline-flex shrink-0 ${wrapperClass}`}>
	<button
		type="button"
		data-testid={testId}
		class={`inline-flex h-7 items-center justify-center rounded-full border border-ds-blue-500/20 bg-ds-blue-50 px-2.5 text-xs font-bold leading-none text-ds-blue-600 transition hover:border-ds-blue-500/40 hover:bg-white focus-visible:ring-3 focus-visible:ring-[rgba(21,101,192,0.22)] focus-visible:outline-none ${buttonClass}`}
		aria-label={`Open version history for ${APP_VERSION}`}
		aria-haspopup="dialog"
		aria-expanded={isHistoryOpen}
		onclick={() => {
			isHistoryOpen = true;
		}}
	>
		{APP_VERSION}
	</button>
</div>

{#if isHistoryOpen}
	<WorkflowModalShell
		title="Stage & Load versions"
		description={`Current version: ${APP_VERSION}`}
		testId={`${testId}-history-modal`}
		panelClass="max-w-xl text-left"
		onClose={() => {
			isHistoryOpen = false;
		}}
	>
		<div class="space-y-4">
			{#each APP_RELEASE_HISTORY as release (release.version)}
				<article class="rounded-[var(--ds-radius-card)] border border-ds-gray-300 bg-white p-4">
					<div class="flex flex-wrap items-baseline justify-between gap-2">
						<div>
							<p class="text-xs font-bold tracking-[0.08em] text-ds-blue-600 uppercase">
								{release.version}
							</p>
							<h3 class="mt-1 text-base font-bold text-ds-gray-900">{release.title}</h3>
						</div>
						<p class="text-sm font-semibold text-ds-gray-600">{release.date}</p>
					</div>
					<ul class="mt-3 space-y-2 text-sm leading-5 text-ds-gray-600">
						{#each release.changes as change (change)}
							<li class="flex gap-2">
								<span class="mt-2 size-1.5 shrink-0 rounded-full bg-ds-blue-500"></span>
								<span>{change}</span>
							</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>
	</WorkflowModalShell>
{/if}
