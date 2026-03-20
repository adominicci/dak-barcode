<section class="space-y-4">
	<p class="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Recovery</p>
	<h2 class="text-3xl font-semibold tracking-tight">Forgot password</h2>
	<p class="max-w-prose text-sm leading-6 text-muted-foreground">
		This shell will host the code-based reset request flow: submit your email, receive the
		Supabase verification code, and continue in-app.
	</p>

	<form class="mt-8 space-y-4" aria-label="Forgot password form">
		<label class="block space-y-2">
			<span class="text-sm font-medium">Email</span>
			<input
				class="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary"
				type="email"
				name="email"
				placeholder="you@dakotasteelandtrim.com"
			/>
		</label>

		<button
			class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
			type="button"
		>
			Send verification code
		</button>
	</form>
</section>
