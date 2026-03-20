<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<section class="space-y-4">
	<p class="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Access</p>
	<h2 class="text-3xl font-semibold tracking-tight">Sign in</h2>
	<p class="max-w-prose text-sm leading-6 text-muted-foreground">
		Use your Supabase email and password to enter the barcode module. Password reset and
		profile gating will be wired in the next milestone.
	</p>

	<form class="mt-8 space-y-4" aria-label="Sign in form">
		<label class="block space-y-2">
			<span class="text-sm font-medium">Email</span>
			<input
				class="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary"
				type="email"
				name="email"
				placeholder="you@dakotasteelandtrim.com"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium">Password</span>
			<input
				class="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary"
				type="password"
				name="password"
				placeholder="Temporary password"
			/>
		</label>

		<div class="flex flex-wrap items-center justify-between gap-3 pt-2">
			<a
				class="text-sm text-muted-foreground underline-offset-4 hover:underline"
				href={resolve('/forgot-password')}
			>
				Forgot password?
			</a>
			<button
				class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
				type="button"
			>
				Continue
			</button>
		</div>
	</form>
</section>
