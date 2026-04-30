<script lang="ts">
	import { ScanBarcode } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		id,
		label,
		value = $bindable(''),
		placeholder,
		testId,
		disabled = false,
		inputmode = 'text',
		onKeydown,
		onInputElement = null
	}: {
		id: string;
		label: string;
		value?: string;
		placeholder: string;
		testId: string;
		disabled?: boolean;
		inputmode?: 'text' | 'numeric';
		onKeydown: (event: KeyboardEvent) => void | Promise<void>;
		onInputElement?: ((element: HTMLInputElement | null) => void) | null;
	} = $props();

	let inputElement = $state<HTMLInputElement | null>(null);

	onMount(() => {
		onInputElement?.(inputElement);
		return () => {
			onInputElement?.(null);
		};
	});
</script>

<div class="space-y-2" data-testid={testId}>
	<label class="ui-label px-1" for={id}>{label}</label>
	<div class="relative">
		<ScanBarcode class="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ds-blue-500" />
		<input
			{id}
			data-testid={`${testId}-input`}
			type="text"
			bind:value
			bind:this={inputElement}
			{placeholder}
			{disabled}
			{inputmode}
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			onkeydown={onKeydown}
			class="ds-scan-input h-14 w-full pl-14 pr-4 text-base font-medium transition placeholder:text-ds-gray-600/65 disabled:cursor-not-allowed disabled:opacity-60"
		/>
	</div>
</div>
