<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster richColors position="top-center" />
{@render children()}
