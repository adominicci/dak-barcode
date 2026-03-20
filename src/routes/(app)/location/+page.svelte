<script lang="ts">
	import type { PageProps } from './$types';

	const targets = ['Canton', 'Freeport', 'Sandbox'] as const;

	let { data, form }: PageProps = $props();
</script>

<section class="space-y-6">
	<div class="rounded-[2rem] bg-[rgba(255,255,255,0.8)] p-6 shadow-[0_32px_90px_-52px_rgba(17,35,63,0.55)] backdrop-blur-2xl lg:p-8">
		<div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
			<div class="space-y-4">
				<p class="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">
					Admin target selector
				</p>
				<h2 class="max-w-xl text-3xl font-semibold tracking-[0.01em] text-slate-950 lg:text-4xl">
					Choose the backend lane for this session.
				</h2>
				<p class="max-w-2xl text-sm leading-7 text-slate-600">
					Operators stay warehouse-locked through their profile. Admins can pivot between the
					live warehouse databases and the sandbox lane from this page, then return safely to
					Home.
				</p>

				{#if form?.message}
					<div class="rounded-[1.35rem] bg-[rgba(190,30,45,0.08)] px-4 py-3 text-sm text-[rgb(128,25,35)]">
						{form.message}
					</div>
				{/if}
			</div>

			<aside class="rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(17,35,63,0.96)_0%,rgba(26,51,88,0.96)_100%)] p-5 text-white shadow-[0_24px_64px_-44px_rgba(17,35,63,0.9)]">
				<p class="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
					Current session
				</p>
				<p class="mt-3 text-3xl font-semibold tracking-[0.01em]">
					{data.currentTarget ?? data.activeTarget ?? 'Not selected'}
				</p>
				<p class="mt-3 text-sm leading-6 text-slate-300">
					The selection is stored in a short-lived secure session cookie so server-side proxy
					helpers can resolve the correct target on every request.
				</p>
			</aside>
		</div>
	</div>

	<form method="POST" class="grid gap-4 md:grid-cols-3">
		{#each targets as target (target)}
			<button
				class={[
					'group rounded-[1.8rem] px-5 py-6 text-left shadow-[0_24px_70px_-52px_rgba(17,35,63,0.5)] transition duration-200',
					data.currentTarget === target || data.activeTarget === target
						? 'bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] text-white'
						: 'bg-[rgba(255,255,255,0.84)] text-slate-900 hover:-translate-y-0.5 hover:bg-white'
				]}
				name="target"
				type="submit"
				value={target}
			>
				<span
					class={[
						'text-[0.68rem] font-semibold uppercase tracking-[0.32em]',
						data.currentTarget === target || data.activeTarget === target
							? 'text-sky-100'
							: 'text-slate-500'
					]}
				>
					Target
				</span>
				<span class="mt-3 block text-2xl font-semibold tracking-[0.01em]">{target}</span>
				<span
					class={[
						'mt-4 block text-sm leading-6',
						data.currentTarget === target || data.activeTarget === target
							? 'text-sky-50'
							: 'text-slate-600'
					]}
				>
					{target === 'Sandbox'
						? 'Use the sandbox database mapping for isolated validation.'
						: `Route the session to the ${target} warehouse database.`}
				</span>
			</button>
		{/each}
	</form>
</section>
