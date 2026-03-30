<script lang="ts">
	import { MapPin } from '@lucide/svelte';

	let {
		target,
		testId,
		wrapperClass = ''
	}: {
		target: string | null;
		testId?: string;
		wrapperClass?: string;
	} = $props();

	const hasTarget = $derived(target !== null && target.trim().length > 0);
	const badgeClasses = $derived(
		hasTarget
			? 'ui-primary-gradient text-white'
			: 'bg-surface-container-low text-slate-900'
	);
	const iconClasses = $derived(hasTarget ? 'text-white' : 'text-primary');
	const textClasses = $derived(hasTarget ? 'text-white' : 'text-slate-900');
</script>

<div
	data-testid={testId}
	class={`flex items-center gap-2 rounded-full px-4 py-2 ${badgeClasses} ${wrapperClass}`}
>
	<MapPin class={`size-4 ${iconClasses}`} />
	<span class={`text-sm font-semibold ${textClasses}`}>{target ?? 'Target required'}</span>
</div>
