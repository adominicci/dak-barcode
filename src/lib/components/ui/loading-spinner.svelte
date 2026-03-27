<script lang="ts">
	type SpinnerSize = 'sm' | 'md' | 'lg';

	let {
		class: className = '',
		decorative = false,
		label = 'Loading',
		size = 'md',
		...rest
	}: {
		class?: string;
		decorative?: boolean;
		label?: string;
		size?: SpinnerSize;
		[key: string]: unknown;
	} = $props();

	const shellSizes = {
		sm: 'size-4',
		md: 'size-6',
		lg: 'size-8'
	} satisfies Record<SpinnerSize, string>;

	const ringSizes = {
		sm: 'inset-[24%] border-[1.75px]',
		md: 'inset-[20%] border-[2px]',
		lg: 'inset-[18%] border-[2.5px]'
	} satisfies Record<SpinnerSize, string>;
</script>

<span
	{...rest}
	role={decorative ? undefined : 'status'}
	aria-label={decorative ? undefined : label}
	aria-hidden={decorative ? 'true' : undefined}
	class={[
		'relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_10px_30px_-18px_rgba(0,88,188,0.75)]',
		shellSizes[size],
		className
	]}
>
	<span class="absolute inset-[14%] rounded-full border border-primary/15"></span>
	<span
		class={[
			'absolute animate-spin rounded-full border-transparent border-t-current border-r-current',
			ringSizes[size]
		]}
	></span>
</span>
