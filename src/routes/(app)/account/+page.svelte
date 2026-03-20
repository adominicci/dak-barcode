<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { CircleAlert, KeyRound, ShieldCheck } from '@lucide/svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
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

<section class="grid gap-6 xl:grid-cols-[1.08fr_0.72fr]">
	<Card.Root class="rounded-[2rem] border-0 bg-[rgba(255,255,255,0.86)] py-0 shadow-[0_30px_90px_-56px_rgba(17,35,63,0.58)] ring-0 backdrop-blur-xl">
		<Card.Header class="space-y-3 px-6 pb-0 pt-6 lg:px-8 lg:pt-8">
			<p class="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
				Account controls
			</p>
			<Card.Title class="font-serif text-4xl tracking-[-0.03em] text-slate-950">
				Change password
			</Card.Title>
			<Card.Description class="max-w-2xl text-sm leading-7 text-slate-600">
				Re-authenticate with your current password, then set the next one for
				<span class="font-medium text-slate-800"> {data.userEmail ?? 'this account'}</span>.
			</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-5 px-6 pb-6 pt-6 lg:px-8 lg:pb-8">
			{#if form?.message}
				<Alert
					variant={form.success ? 'default' : 'destructive'}
					class={form.success
						? 'rounded-[1.6rem] border-transparent bg-[rgba(0,88,188,0.07)] px-4 py-3 text-slate-700 shadow-[inset_0_0_0_1px_rgba(0,88,188,0.08)]'
						: 'rounded-[1.6rem] border-transparent bg-[rgba(190,30,45,0.08)] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(190,30,45,0.08)]'}
				>
					{#if form.success}
						<ShieldCheck class="size-4 text-[#0058bc]" />
						<AlertTitle class="font-medium text-slate-900">Password updated</AlertTitle>
						<AlertDescription class="text-slate-600">{form.message}</AlertDescription>
					{:else}
						<CircleAlert class="size-4" />
						<AlertTitle class="font-medium">Password update blocked</AlertTitle>
						<AlertDescription>{form.message}</AlertDescription>
					{/if}
				</Alert>
			{/if}

			<form
				method="POST"
				action="?/changePassword"
				class="grid gap-5"
				aria-label="Change password form"
				use:enhance={enhanceForm}
			>
				<div class="space-y-2.5">
					<Label class="text-sm font-medium text-slate-700" for="current-password">
						Current password
					</Label>
					<Input
						id="current-password"
						class="h-12 rounded-[1.35rem] border-transparent bg-[rgba(244,243,248,0.96)] px-4 text-[0.95rem] shadow-[inset_0_-1px_0_rgba(0,88,188,0.12)] focus-visible:border-transparent focus-visible:ring-[rgba(0,88,188,0.26)]"
						type="password"
						name="currentPassword"
						autocomplete="current-password"
						placeholder="Current password"
					/>
				</div>

				<div class="grid gap-5 sm:grid-cols-2">
					<div class="space-y-2.5">
						<Label class="text-sm font-medium text-slate-700" for="account-password">
							New password
						</Label>
						<Input
							id="account-password"
							class="h-12 rounded-[1.35rem] border-transparent bg-[rgba(244,243,248,0.96)] px-4 text-[0.95rem] shadow-[inset_0_-1px_0_rgba(0,88,188,0.12)] focus-visible:border-transparent focus-visible:ring-[rgba(0,88,188,0.26)]"
							type="password"
							name="password"
							autocomplete="new-password"
							placeholder="New password"
						/>
					</div>

					<div class="space-y-2.5">
						<Label class="text-sm font-medium text-slate-700" for="account-confirm-password">
							Confirm password
						</Label>
						<Input
							id="account-confirm-password"
							class="h-12 rounded-[1.35rem] border-transparent bg-[rgba(244,243,248,0.96)] px-4 text-[0.95rem] shadow-[inset_0_-1px_0_rgba(0,88,188,0.12)] focus-visible:border-transparent focus-visible:ring-[rgba(0,88,188,0.26)]"
							type="password"
							name="confirmPassword"
							autocomplete="new-password"
							placeholder="Confirm password"
						/>
					</div>
				</div>

				<div class="flex justify-end">
					<Button
						class="h-12 rounded-full border-0 bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(0,88,188,0.9)] hover:brightness-[1.03]"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Updating password...' : 'Save new password'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root class="rounded-[2rem] border-0 bg-[linear-gradient(180deg,rgba(0,88,188,0.08)_0%,rgba(255,255,255,0.9)_100%)] py-0 shadow-[0_30px_90px_-60px_rgba(17,35,63,0.5)] ring-0">
		<Card.Header class="space-y-3 px-6 pb-0 pt-6">
			<p class="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
				Session note
			</p>
			<Card.Title class="text-xl font-semibold tracking-[0.01em] text-slate-950">
				Shared-device safe by default
			</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4 px-6 pb-6 pt-6">
			<div class="rounded-[1.5rem] bg-white/70 p-4">
				<p class="flex items-start gap-3 text-sm leading-7 text-slate-600">
					<KeyRound class="mt-1 size-4 shrink-0 text-[#0058bc]" />
					Password updates stay in-session. Use the header sign-out action whenever the iPad
					changes hands.
				</p>
			</div>
			<div class="rounded-[1.5rem] bg-white/70 p-4">
				<p class="flex items-start gap-3 text-sm leading-7 text-slate-600">
					<ShieldCheck class="mt-1 size-4 shrink-0 text-[#0058bc]" />
					Fresh logins still route through the same profile gate and warehouse or admin target
					rules.
				</p>
			</div>
		</Card.Content>
	</Card.Root>
</section>
