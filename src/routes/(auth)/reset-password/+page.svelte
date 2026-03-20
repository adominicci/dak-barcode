<section class="space-y-4">
	<p class="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Recovery</p>
	<h2 class="text-3xl font-semibold tracking-tight">Reset password</h2>
	<p class="max-w-prose text-sm leading-6 text-muted-foreground">
		This page will verify the emailed code and allow the user to set a new password without
		leaving the app.
	</p>

	<form class="mt-8 grid gap-4" aria-label="Reset password form">
		<label class="block space-y-2">
			<span class="text-sm font-medium">Verification code</span>
			<input
				class="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm tracking-[0.3em] outline-none ring-0 transition focus:border-primary"
				type="text"
				name="token"
				placeholder="123456"
			/>
		</label>

		<label class="block space-y-2">
			<span class="text-sm font-medium">New password</span>
			<input
				class="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary"
				type="password"
				name="new-password"
				placeholder="New password"
			/>
		</label>

		<button
			class="justify-self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
			type="button"
		>
			Update password
		</button>
	</form>
</section>
