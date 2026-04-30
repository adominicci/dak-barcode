<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';

	type IconComponent = Component<{ class?: string }>;

	let {
		name,
		detail,
		icon,
		trailingIcon = null,
		href = null,
		testId,
		onclick = null,
		variant = 'default'
	}: {
		name: string;
		detail: string;
		icon: IconComponent;
		trailingIcon?: IconComponent | null;
		href?: string | null;
		testId: string;
		onclick?: (() => void) | null;
		variant?: 'default' | 'utility';
	} = $props();

	const Icon = $derived(icon);
	const TrailingIcon = $derived(trailingIcon);
	const resolvedHref = $derived(href?.startsWith('/') ? resolve(href as any) : href);
	const cardClass = $derived([
		'ds-action-card group flex w-full items-center justify-between gap-4 px-5 py-4 text-left',
		variant === 'utility' && 'border border-dashed border-white/35'
	]);
</script>

{#snippet cardContent()}
	<div class="flex min-w-0 items-center gap-4">
		<span
			data-testid={`${testId}-icon`}
			class="ds-action-card-icon flex shrink-0 items-center justify-center"
		>
			<Icon class="size-[22px]" />
		</span>
		<span class="min-w-0">
			<span class="block truncate text-lg font-semibold leading-6 text-white">{name}</span>
			<span class="mt-0.5 block truncate text-sm font-normal leading-5 text-white/85">{detail}</span>
		</span>
	</div>

	{#if TrailingIcon}
		<TrailingIcon class="size-6 shrink-0 text-white/80" />
	{/if}
{/snippet}

{#if href}
	<a data-testid={testId} class={cardClass} href={resolvedHref}>
		{@render cardContent()}
	</a>
{:else}
	<button data-testid={testId} type="button" class={cardClass} {onclick}>
		{@render cardContent()}
	</button>
{/if}
