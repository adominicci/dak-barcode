<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { Check, Minus } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let {
		checked = $bindable(false),
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CheckboxPrimitive.RootProps = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	bind:ref
	data-slot="checkbox"
	class={cn(
		'peer inline-flex size-5 shrink-0 items-center justify-center rounded-[0.45rem] border border-slate-300 bg-white text-primary shadow-sm transition-all outline-none data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=unchecked]:bg-white data-[state=unchecked]:text-transparent focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<span class="flex items-center justify-center">
			{#if indeterminate}
				<Minus class="size-3.5" />
			{:else if checked}
				<Check class="size-3.5" />
			{/if}
		</span>
	{/snippet}
</CheckboxPrimitive.Root>

