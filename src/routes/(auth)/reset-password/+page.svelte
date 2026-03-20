<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, BadgeCheck, CircleAlert, ShieldEllipsis } from '@lucide/svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let isSubmitting = $state(false);

	const enhanceForm: SubmitFunction = () => {
		isSubmitting = true;

		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	};
</script>

<section class="space-y-6">
	<div class="space-y-4">
		<p class="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-slate-500">Recovery</p>
		<h2 class="font-serif text-5xl leading-none tracking-[-0.03em] text-slate-950">
			Reset password
		</h2>
		<p class="max-w-lg text-sm leading-7 text-slate-600">
			Verify the emailed recovery code, then lock in a new password without leaving the app.
		</p>
	</div>

	{#if data.sent}
		<Alert class="rounded-xl border-transparent bg-[rgba(0,88,188,0.07)] px-4 py-3 text-slate-700 shadow-[inset_0_0_0_1px_rgba(0,88,188,0.08)]">
			<BadgeCheck class="size-4 text-[#0058bc]" />
			<AlertTitle class="font-medium text-slate-900">Recovery code sent</AlertTitle>
			<AlertDescription class="text-slate-600">
				Check your inbox for the code from Supabase, then confirm it here.
			</AlertDescription>
		</Alert>
	{/if}

	{#if form?.message}
		<Alert
			variant="destructive"
			class="rounded-xl border-transparent bg-[rgba(190,30,45,0.08)] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(190,30,45,0.08)]"
		>
			<CircleAlert class="size-4" />
			<AlertTitle class="font-medium">Reset blocked</AlertTitle>
			<AlertDescription>{form.message}</AlertDescription>
		</Alert>
	{/if}

	<form
		method="POST"
		class="grid gap-5"
		aria-label="Reset password form"
		use:enhance={enhanceForm}
	>
		<div class="space-y-2.5">
			<Label class="text-sm font-medium text-slate-700" for="reset-email">Email</Label>
			<Input
				id="reset-email"
				class="h-12 rounded-lg border border-slate-200 bg-[rgba(248,249,252,0.9)] px-4 text-[0.95rem] shadow-none focus-visible:border-[#0058bc] focus-visible:ring-[rgba(0,88,188,0.18)]"
				type="email"
				name="email"
				autocomplete="email"
				value={form?.email ?? data.email}
				placeholder="you@dakotasteelandtrim.com"
			/>
		</div>

		<div class="space-y-2.5">
			<Label class="text-sm font-medium text-slate-700" for="reset-code">Verification code</Label>
			<Input
				id="reset-code"
				class="h-12 rounded-lg border border-slate-200 bg-[rgba(248,249,252,0.9)] px-4 font-medium tracking-[0.28em] text-[0.95rem] shadow-none focus-visible:border-[#0058bc] focus-visible:ring-[rgba(0,88,188,0.18)]"
				type="text"
				name="code"
				inputmode="numeric"
				autocomplete="one-time-code"
				value={form?.code ?? ''}
				placeholder="123456"
			/>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div class="space-y-2.5">
				<Label class="text-sm font-medium text-slate-700" for="reset-password">New password</Label>
				<Input
					id="reset-password"
					class="h-12 rounded-lg border border-slate-200 bg-[rgba(248,249,252,0.9)] px-4 text-[0.95rem] shadow-none focus-visible:border-[#0058bc] focus-visible:ring-[rgba(0,88,188,0.18)]"
					type="password"
					name="password"
					autocomplete="new-password"
					placeholder="New password"
				/>
			</div>

			<div class="space-y-2.5">
				<Label class="text-sm font-medium text-slate-700" for="reset-confirm-password">
					Confirm password
				</Label>
				<Input
					id="reset-confirm-password"
					class="h-12 rounded-lg border border-slate-200 bg-[rgba(248,249,252,0.9)] px-4 text-[0.95rem] shadow-none focus-visible:border-[#0058bc] focus-visible:ring-[rgba(0,88,188,0.18)]"
					type="password"
					name="confirmPassword"
					autocomplete="new-password"
					placeholder="Confirm password"
				/>
			</div>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-4">
			<p class="flex items-start gap-2 text-sm leading-6 text-slate-500">
				<ShieldEllipsis class="mt-1 size-4 shrink-0 text-[#0058bc]" />
				The recovery session signs out after the password change completes.
			</p>
			<Button
				class="h-12 rounded-lg border-0 bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(0,88,188,0.9)] hover:brightness-[1.03]"
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Updating password...' : 'Update password'}
			</Button>
		</div>
	</form>

	<a
		class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
		href={resolve('/login')}
	>
		<ArrowLeft class="size-4" />
		Back to sign in
	</a>
</section>
