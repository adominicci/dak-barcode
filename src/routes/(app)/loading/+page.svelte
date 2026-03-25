<script lang="ts">
	import { ClipboardList } from '@lucide/svelte';
	import { page } from '$app/state';

	const loadingContext = $derived({
		dropsheetId: page.url.searchParams.get('dropsheetId'),
		locationId: page.url.searchParams.get('locationId'),
		loaderSessionId: page.url.searchParams.get('loaderSessionId')
	});
</script>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h2 class="text-3xl font-bold tracking-tight text-slate-950">Loading</h2>
		<p class="mt-2 text-sm text-on-surface-variant">
			Dropsheet, location, and loader session received from category handoff.
		</p>
	</div>

	<!-- Context panel (matches staging data surface style) -->
	<div class="bg-surface-container-low rounded-[2rem] p-8 min-h-[400px]">
		<!-- Handoff payload -->
		<div class="flex items-center gap-3 mb-8">
			<div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
				<ClipboardList class="size-5" />
			</div>
			<div>
				<p class="ui-label text-xs">Handoff payload</p>
				<h3 class="text-lg font-bold tracking-tight text-slate-950">Ready for scanning</h3>
			</div>
		</div>

		<div class="grid gap-4 sm:grid-cols-3 mb-12">
			<div class="bg-white rounded-2xl p-6 shadow-sm">
				<p class="ui-label text-xs">Dropsheet</p>
				<p class="mt-2 text-3xl font-bold tracking-tight text-slate-950">
					{loadingContext.dropsheetId ?? '---'}
				</p>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm">
				<p class="ui-label text-xs">Location</p>
				<p class="mt-2 text-3xl font-bold tracking-tight text-slate-950">
					{loadingContext.locationId ?? '---'}
				</p>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm">
				<p class="ui-label text-xs">Loader session</p>
				<p class="mt-2 text-3xl font-bold tracking-tight text-slate-950">
					{loadingContext.loaderSessionId ?? '---'}
				</p>
			</div>
		</div>

		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-12 text-on-surface-variant/50">
			<p class="text-lg font-medium">Loading workflow will be available in the next milestone</p>
		</div>
	</div>
</div>
