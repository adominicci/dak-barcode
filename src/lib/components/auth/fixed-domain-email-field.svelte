<script lang="ts">
	import { Input } from '$lib/components/ui/input';

	const FIXED_EMAIL_DOMAIN = '@dakotasteelandtrim.com';

	type Props = {
		id: string;
		username?: string;
		label?: string;
		placeholder?: string;
	};

	let {
		id,
		username = $bindable(''),
		label = 'Email',
		placeholder = 'username'
	}: Props = $props();

	const extractUsername = (value: string) =>
		value.trim().replace(/@dakotasteelandtrim\.com$/i, '').trim();

	let visibleUsername = $state(extractUsername(username));

	$effect(() => {
		const submittedUsername = extractUsername(username);

		if (submittedUsername && submittedUsername !== visibleUsername) {
			visibleUsername = submittedUsername;
		}
	});

	const handleVisibleInput = (event: Event) => {
		const { value } = event.currentTarget as HTMLInputElement;
		const nextUsername = extractUsername(value);

		visibleUsername = nextUsername;
		username = nextUsername;
	};

	const handleAutofillBridgeInput = (event: Event) => {
		const { value } = event.currentTarget as HTMLInputElement;
		const nextUsername = extractUsername(value);

		if (!nextUsername) {
			return;
		}

		visibleUsername = nextUsername;
		username = nextUsername;
	};

	const normalizedUsername = $derived(extractUsername(visibleUsername));
	const fullEmail = $derived(normalizedUsername ? `${normalizedUsername}${FIXED_EMAIL_DOMAIN}` : '');
</script>

<div class="space-y-2.5">
	<label class="text-sm font-medium text-[var(--text-muted)]" for={id}>{label}</label>
	<div
		class="auth-control flex h-13 items-center overflow-hidden border border-transparent bg-[var(--surface-low)] shadow-none focus-within:bg-white focus-within:ring-4 focus-within:ring-[rgba(0,88,188,0.18)]"
	>
		<Input
			id={id}
			class="h-full flex-1 border-0 bg-transparent px-4 text-[0.98rem] shadow-none focus-visible:ring-0"
			type="text"
			name="username"
			autocomplete="off"
			autocapitalize="none"
			spellcheck={false}
			{placeholder}
			value={visibleUsername}
			oninput={handleVisibleInput}
		/>
		<div
			class="flex h-full shrink-0 items-center border-l border-[rgba(96,112,137,0.14)] bg-[rgba(96,112,137,0.06)] px-4 text-sm font-medium text-[var(--text-muted)]"
			aria-hidden="true"
		>
			{FIXED_EMAIL_DOMAIN}
		</div>
	</div>
	<input
		class="sr-only"
		type="email"
		name="email"
		autocomplete="username"
		tabindex="-1"
		aria-hidden="true"
		value={fullEmail}
		oninput={handleAutofillBridgeInput}
		onchange={handleAutofillBridgeInput}
	/>
</div>
