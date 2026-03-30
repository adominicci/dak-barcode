<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		CalendarDays,
		ChevronRight,
		Grid2x2,
		MapPin,
		Plus,
		Truck,
		UserRoundPlus
	} from '@lucide/svelte';
	import TargetBadge from '$lib/components/workflow/target-badge.svelte';
	import type { PageProps } from './$types';

	type IconComponent = typeof Grid2x2;
	type HomeActionHref = '/staging' | '/dropsheets' | '/loaders';

	type HomeCard = {
		name: string;
		detail: string;
		icon: IconComponent;
		href: HomeActionHref | null;
		testId: string;
		variant: 'default' | 'utility';
		disabled?: boolean;
	};

	let { data }: PageProps = $props();

	const actions: HomeCard[] = [
		{
			name: 'Staging',
			detail: 'Organize outgoing inventory',
			icon: Grid2x2,
			href: '/staging',
			testId: 'home-card-staging',
			variant: 'default'
		},
		{
			name: 'Loading',
			detail: 'Scan items onto trailers',
			icon: Truck,
			href: '/dropsheets',
			testId: 'home-card-loading',
			variant: 'default'
		},
		{
			name: 'Will Call',
			detail: 'Customer pickups and direct load',
			icon: MapPin,
			href: null,
			testId: 'home-card-will-call',
			variant: 'default',
			disabled: true
		},
		{
			name: 'Add Loader',
			detail: 'Assign personnel to bay',
			icon: UserRoundPlus,
			href: '/loaders',
			testId: 'home-card-add-loader',
			variant: 'utility'
		}
	];

	const homeDateLabel = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	}).format(new Date());

	function withHomeReturnTo(pathname: string): string {
		const searchParams = new URLSearchParams({
			returnTo: '/home'
		});

		return resolve(`${pathname}?${searchParams.toString()}` as any);
	}

	function getUserInitials(displayName: string | null | undefined, userEmail: string | null | undefined) {
		const source = displayName?.trim() || userEmail?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'DST User';
		const parts = source.split(/\s+/).map((p) => p.trim()).filter(Boolean);
		if (parts.length === 0) return 'DU';
		return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
	}
</script>

<section class="relative min-h-dvh overflow-hidden bg-surface px-4 pb-16 pt-4 sm:px-6 lg:px-8">
	<!-- Decorative background blurs matching reference -->
	<div class="pointer-events-none fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] z-[-1]"></div>
	<div class="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] z-[-1]"></div>

	<div class="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
		<!-- Glass header matching module-selector reference -->
		<header
			data-testid="home-topbar"
			class="glass-header flex items-center justify-between rounded-2xl border-b border-slate-100 px-6 py-4 shadow-sm"
		>
			<div class="flex items-center gap-4">
				<button
					type="button"
					disabled
					class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-slate-500"
					aria-label="Back"
				>
					<ArrowLeft class="size-5" />
				</button>
				<h1
					data-testid="home-title"
					class="text-xl font-bold text-slate-900 tracking-tight"
				>
					Stage &amp; Load Module
				</h1>
			</div>

			<div class="flex items-center gap-4">
				<TargetBadge
					target={data.activeTarget}
					testId="home-active-target"
					wrapperClass="hidden sm:flex"
				/>
				<div class="hidden md:flex items-center gap-2 text-slate-500 font-medium">
					<CalendarDays class="size-4" />
					<span class="text-sm">{homeDateLabel}</span>
				</div>
					{#if data.isAdmin}
						<a
							href={withHomeReturnTo('/location')}
							class="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-surface-container-low px-4 text-sm font-semibold text-slate-700 transition hover:bg-surface-container"
						>
							Change target
					</a>
				{/if}
				<div class="w-10 h-10 rounded-full industrial-gradient flex items-center justify-center text-xs font-bold text-white shadow-md">
					{getUserInitials(data.displayName, data.userEmail)}
				</div>
			</div>
		</header>

		<!-- Centered card grid matching module-selector reference -->
		<div class="flex flex-1 items-center justify-center py-12">
			<div
				data-testid="home-card-grid"
				class="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				{#each actions as action (action.name)}
					{@const Icon = action.icon}
					{@const isUtility = action.variant === 'utility'}
					{@const isDisabled = action.disabled}

					{#if isDisabled}
						<button
							data-testid={action.testId}
							type="button"
							disabled
							aria-disabled="true"
							class="ui-primary-soft group flex w-full cursor-not-allowed items-center justify-between rounded-[2rem] border border-[rgba(0,88,188,0.12)] p-8 transition-all duration-300 opacity-85"
						>
							<div class="flex items-center gap-6">
								<div
									data-testid={`${action.testId}-icon`}
									class="ui-primary-soft flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(0,88,188,0.08)]"
								>
									<Icon class="size-7" />
								</div>
								<div class="text-left">
									<span class="block text-2xl font-bold tracking-tight text-on-surface">{action.name}</span>
									<span class="text-on-surface-variant text-sm font-medium">{action.detail}</span>
								</div>
							</div>
							<ChevronRight class="size-6 text-slate-300" />
						</button>
					{:else if isUtility}
						<a
							data-testid={action.testId}
							href={withHomeReturnTo(action.href as HomeActionHref)}
							class="ui-primary-gradient group flex w-full items-center justify-between rounded-[2rem] border-2 border-dashed border-white/25 p-8 text-white transition-all duration-300 hover:brightness-[1.03] active:scale-95"
						>
							<div class="flex items-center gap-6">
								<div
									data-testid={`${action.testId}-icon`}
									class="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/18 bg-white/18 text-white"
								>
									<Icon class="size-7" />
								</div>
								<div class="text-left">
									<span class="block text-2xl font-bold tracking-tight text-white">{action.name}</span>
									<span class="text-sm font-medium text-white/78">{action.detail}</span>
								</div>
							</div>
							<Plus class="size-6 text-white/72" />
						</a>
					{:else}
						<a
							data-testid={action.testId}
							href={withHomeReturnTo(action.href as HomeActionHref)}
							class="ui-primary-gradient group flex w-full items-center justify-between rounded-[2rem] p-8 text-white transition-all duration-300 hover:brightness-[1.03] active:scale-95"
						>
							<div class="flex items-center gap-6">
								<div
									data-testid={`${action.testId}-icon`}
									class="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/18 bg-white/18 text-white transition-colors duration-300 group-hover:bg-white/22"
								>
									<Icon class="size-7" />
								</div>
								<div class="text-left">
									<span class="block text-2xl font-bold tracking-tight text-white">{action.name}</span>
									<span class="text-sm font-medium text-white/78">{action.detail}</span>
								</div>
							</div>
							<ChevronRight class="size-6 text-white/72 transition-colors" />
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</section>
