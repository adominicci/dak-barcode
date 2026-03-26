<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, CircleAlert, MailCheck } from '@lucide/svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import FixedDomainEmailField from '$lib/components/auth/fixed-domain-email-field.svelte';
	import { syncFixedDomainEmailFormData } from '$lib/components/auth/fixed-domain-form';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let isSubmitting = $state(false);

	const enhanceForm: SubmitFunction = ({ formElement, formData }) => {
		syncFixedDomainEmailFormData(formElement, formData);
		isSubmitting = true;

		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	};
</script>

<section class="space-y-6">
	<div class="space-y-3">
		<h2 class="font-display text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-[var(--text-strong)]">
			Forgot password
		</h2>
		<p class="text-sm leading-7 text-[var(--text-muted)]">
			Enter your email to receive a recovery code
		</p>
	</div>

	{#if form?.message}
		<Alert
			variant="destructive"
			class="auth-control border-transparent bg-[rgba(190,30,45,0.08)] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(190,30,45,0.08)]"
		>
			<CircleAlert class="size-4" />
			<AlertTitle class="font-medium">Request blocked</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form
		method="POST"
		class="space-y-5"
		aria-label="Forgot password form"
		use:enhance={enhanceForm}
	>
		<FixedDomainEmailField
			id="recovery-email"
			username={form?.email ?? ''}
			placeholder="andresd"
		/>

		<Button
			class="auth-control ui-primary h-12 w-full border-0 text-sm font-semibold text-white hover:brightness-[1.03]"
			type="submit"
			disabled={isSubmitting}
		>
			{isSubmitting ? 'Sending code...' : 'Send verification code'}
			<MailCheck class="size-4" />
		</Button>
	</form>

	<a
		class="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition hover:text-[#0058bc]"
		href={resolve('/login')}
	>
		<ArrowLeft class="size-4" />
		Back to sign in
	</a>
</section>
