<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import logo from '$lib/assets/logo.png';

	let { children } = $props();
</script>

<div class="auth-page min-h-dvh overflow-hidden text-foreground">
	<div class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-start gap-4 px-4 py-5 lg:gap-5 lg:px-8 lg:py-6">
		<section class="flex w-full justify-center pt-0 text-center">
			<div class="space-y-1.5">
				<img
					src={logo}
					alt="Dakota Steel & Trim"
					class="mx-auto h-auto w-[min(24rem,70vw)]"
				/>
				<h1 class="font-display text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold leading-none tracking-[-0.03em] text-[#0058bc]">
					Scanning
				</h1>
			</div>
		</section>

		<main class="flex w-full flex-1 items-start justify-center py-0">
			<Card.Root class="auth-card w-full max-w-[34rem] border-0 bg-white py-0 ring-1 ring-[var(--auth-card-ring)]">
				<Card.Content class="px-6 py-6 sm:px-8 sm:py-8">
					{@render children()}
				</Card.Content>
			</Card.Root>
		</main>
	</div>
</div>
