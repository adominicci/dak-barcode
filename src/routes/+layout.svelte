<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { Toaster } from 'svelte-sonner';
	import { getPageTitle } from '$lib/workflow/page-title';

	let { children } = $props();
	const documentTitle = $derived(
		getPageTitle(page.url.pathname, page.data as { loadNumber?: string | null })
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{documentTitle}</title>
</svelte:head>
<Toaster richColors position="top-center" />
{@render children()}
