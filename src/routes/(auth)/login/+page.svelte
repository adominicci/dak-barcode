<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowRight, CircleAlert, ShieldCheck } from '@lucide/svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import FixedDomainEmailField from '$lib/components/auth/fixed-domain-email-field.svelte';
	import { syncFixedDomainEmailFormData } from '$lib/components/auth/fixed-domain-form';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
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
		<p class="ui-label">Account access</p>
		<h2 class="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-[var(--text-strong)]">
			Welcome Back
		</h2>
		<p class="text-sm leading-7 text-[var(--text-muted)]">
			Sign in to access your account.
		</p>
	</div>

	{#if data.notice}
		<Alert class="auth-control border-transparent bg-[rgba(0,88,188,0.07)] px-4 py-3 text-[var(--text-muted)] shadow-[inset_0_0_0_1px_rgba(0,88,188,0.08)]">
			<ShieldCheck class="size-4 text-[#0058bc]" />
			<AlertTitle class="font-medium text-[var(--text-strong)]">Session updated</AlertTitle>
			<AlertDescription class="text-[var(--text-muted)]">{data.notice}</AlertDescription>
		</Alert>
	{/if}

	{#if form?.message}
		<Alert
			variant="destructive"
			class="auth-control border-transparent bg-[rgba(190,30,45,0.08)] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(190,30,45,0.08)]"
		>
			<CircleAlert class="size-4" />
			<AlertTitle class="font-medium">Unable to sign in</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form method="POST" class="space-y-5" aria-label="Sign in form" use:enhance={enhanceForm}>
		<FixedDomainEmailField
			id="login-email"
			username={form?.email ?? ''}
			placeholder="andresd"
		/>

		<div class="space-y-2.5">
			<Label class="text-sm font-medium text-[var(--text-muted)]" for="login-password">Password</Label>
			<Input
				id="login-password"
				class="auth-control h-13 border-transparent bg-[var(--surface-low)] px-4 text-[0.98rem] shadow-none focus-visible:border-transparent focus-visible:bg-white focus-visible:ring-[rgba(0,88,188,0.18)]"
				type="password"
				name="password"
				autocomplete="current-password"
				placeholder="Temporary password"
			/>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 pt-2">
			<a
				class="text-sm font-medium text-[var(--text-muted)] underline-offset-4 transition hover:text-[#0058bc] hover:underline"
				href={resolve('/forgot-password')}
			>
				Forgot password?
			</a>
			<Button
				class="auth-control ui-primary h-12 border-0 px-6 text-sm font-semibold text-white hover:brightness-[1.03]"
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Signing in...' : 'Continue'}
				<ArrowRight class="size-4" />
			</Button>
		</div>
	</form>
</section>
