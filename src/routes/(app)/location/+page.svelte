<script lang="ts">
	import type { PageProps } from './$types';
	import { CheckCircle2, Database, Factory, FlaskConical, Wrench } from '@lucide/svelte';

	const targets = ['Canton', 'Freeport', 'Sandbox'] as const;
	const targetMeta = {
		Canton: {
			icon: Factory,
			description: 'Route this session to the Canton warehouse database.',
			badge: 'Warehouse'
		},
		Freeport: {
			icon: Database,
			description: 'Route this session to the Freeport warehouse database.',
			badge: 'Warehouse'
		},
		Sandbox: {
			icon: FlaskConical,
			description: 'Use the sandbox target for isolated validation and verification.',
			badge: 'Validation'
		}
	} as const;

	let { data, form }: PageProps = $props();
</script>

<section class="space-y-8">
	{#if form?.message}
		<div class="rounded-[8px] bg-[rgba(190,30,45,0.08)] px-4 py-3 text-sm text-[rgb(128,25,35)]">
			{form.message}
		</div>
	{/if}

	<form method="POST" class="grid gap-6 lg:grid-cols-3">
		{#each targets as target (target)}
			{@const selected = data.currentTarget === target || data.activeTarget === target}
			{@const meta = targetMeta[target]}
			{@const Icon = meta.icon}
			<button
				class={[
					'ui-card group p-6 text-left transition duration-200 hover:-translate-y-0.5',
					selected
						? 'bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] text-white shadow-[var(--shadow-primary)]'
						: 'bg-white text-[var(--text-strong)] hover:bg-[var(--surface-card)]'
				]}
				name="target"
				type="submit"
				value={target}
			>
				<div class="flex items-start justify-between gap-4">
					<div class={[
						'flex h-14 w-14 items-center justify-center rounded-[16px] transition-colors',
						selected ? 'bg-white/16 text-white' : 'bg-[var(--surface-low)] text-[#0058bc]'
					]}>
						<Icon class="size-6" />
					</div>
					<div class={[
						'rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em]',
						selected ? 'bg-white/16 text-white/84' : 'bg-[var(--surface-low)] text-[var(--text-subtle)]'
					]}>
						{meta.badge}
					</div>
				</div>
				<div class="mt-6 space-y-3">
					<span class={[
						'block text-[0.76rem] font-semibold uppercase tracking-[0.22em]',
						selected ? 'text-white/72' : 'text-[var(--text-subtle)]'
					]}>
						Target
					</span>
					<span class="block text-[1.7rem] font-semibold tracking-[-0.03em]">{target}</span>
					<p class={[
						'text-sm leading-6',
						selected ? 'text-white/82' : 'text-[var(--text-muted)]'
					]}>
						{meta.description}
					</p>
				</div>
				{#if selected}
					<div class="mt-6 inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-sm font-medium text-white">
						<CheckCircle2 class="size-4" />
						Active target
					</div>
				{/if}
			</button>
		{/each}
	</form>

	<div class="ui-panel flex items-start gap-4 p-6 text-[var(--text-muted)]">
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[#0058bc] shadow-[var(--shadow-soft)]">
			<Wrench class="size-5" />
		</div>
		<div class="space-y-2">
			<p class="ui-label">Sandbox</p>
			<p class="text-sm leading-7">
				Use Sandbox for testing, development, and bug discovery. It is the safe lane for
				validation work when you do not want to point the session at a live warehouse
				database.
			</p>
		</div>
	</div>
</section>
