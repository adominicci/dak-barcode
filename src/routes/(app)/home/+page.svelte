<script lang="ts">
	import { page } from '$app/state';
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

	type IconComponent = typeof Grid2x2;

	type HomeCard = {
		name: string;
		detail: string;
		icon: IconComponent;
		testId: string;
		variant: 'default' | 'utility';
		disabled?: boolean;
	};

	const actions: HomeCard[] = [
		{
			name: 'Staging',
			detail: 'Organize outgoing inventory',
			icon: Grid2x2,
			testId: 'home-card-staging',
			variant: 'default'
		},
		{
			name: 'Loading',
			detail: 'Scan items onto trailers',
			icon: Truck,
			testId: 'home-card-loading',
			variant: 'default'
		},
		{
			name: 'Will Call',
			detail: 'Customer pickups and direct load',
			icon: MapPin,
			testId: 'home-card-will-call',
			variant: 'default',
			disabled: true
		},
		{
			name: 'Add Loader',
			detail: 'Assign personnel to bay',
			icon: UserRoundPlus,
			testId: 'home-card-add-loader',
			variant: 'utility'
		}
	];

	const homeDateLabel = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	}).format(new Date());

	function getUserInitials(displayName: string | null | undefined, userEmail: string | null | undefined) {
		const source = displayName?.trim() || userEmail?.split('@')[0]?.replace(/[._-]+/g, ' ') || 'DST User';
		const parts = source
			.split(/\s+/)
			.map((part) => part.trim())
			.filter(Boolean);

		if (parts.length === 0) {
			return 'DU';
		}

		return parts
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}
</script>

<section class="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,88,188,0.09),transparent_34%),linear-gradient(180deg,#fbfbff_0%,#f7f6fb_45%,#f5f3fa_100%)] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
	<div class="pointer-events-none absolute inset-x-0 top-[-12rem] h-[28rem] bg-[radial-gradient(circle,rgba(0,112,235,0.10)_0%,rgba(0,112,235,0)_70%)] blur-3xl"></div>
	<div class="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[rgba(0,88,188,0.06)] blur-3xl"></div>

	<div class="relative mx-auto flex min-h-dvh w-full max-w-[118rem] flex-col">
		<header
			data-testid="home-topbar"
			class="flex flex-wrap items-center justify-between gap-4 rounded-[1.9rem] border border-white/80 bg-white/86 px-5 py-4 shadow-[0_20px_70px_-42px_rgba(18,37,68,0.38)] backdrop-blur-xl"
		>
			<div class="flex items-center gap-3 sm:gap-5">
				<button
					type="button"
					class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-low)] text-slate-800 transition-transform duration-200 hover:-translate-y-0.5"
					aria-label="Back"
				>
					<ArrowLeft class="size-5" />
				</button>
				<div class="space-y-1">
					<p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
						Operations home
					</p>
					<h1
						data-testid="home-title"
						class="text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]"
					>
						Stage &amp; Load Module
					</h1>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600">
				<div class="hidden items-center gap-2 rounded-full bg-[var(--surface-low)] px-4 py-2.5 sm:flex">
					<CalendarDays class="size-4 text-[#0058bc]" />
					<span class="font-medium">{homeDateLabel}</span>
				</div>
				<div class="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0058bc_0%,#0070eb_100%)] text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(0,88,188,0.72)]">
					{getUserInitials(page.data?.displayName, page.data?.userEmail)}
				</div>
			</div>
		</header>

		<div class="flex flex-1 items-center justify-center py-12 sm:py-16">
			<div
				data-testid="home-card-grid"
				class="grid w-full max-w-6xl gap-6 md:grid-cols-2 xl:gap-7"
			>
				{#each actions as action (action.name)}
					{@const Icon = action.icon}
					<button
						data-testid={action.testId}
						type="button"
						disabled={action.disabled}
						aria-disabled={action.disabled ? 'true' : undefined}
						class={[
							'group relative flex min-h-[12.75rem] items-center justify-between gap-6 overflow-hidden rounded-[2rem] px-7 py-7 text-left transition duration-300',
							action.variant === 'utility'
								? 'border-2 border-dashed border-[#98bcf0] bg-[rgba(0,88,188,0.08)] shadow-[0_24px_65px_-50px_rgba(0,88,188,0.42)] hover:border-[#78a7e6] hover:bg-[rgba(0,88,188,0.12)]'
								: action.disabled
									? 'border border-white/90 bg-white/82 text-slate-700 opacity-85 shadow-[0_26px_80px_-52px_rgba(16,35,62,0.24)]'
									: 'border border-white/90 bg-white/94 text-slate-900 shadow-[0_30px_85px_-54px_rgba(16,35,62,0.26)] hover:-translate-y-0.5 hover:shadow-[0_34px_90px_-50px_rgba(16,35,62,0.30)]'
						]}
					>
						<div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]"></div>
						<div class="relative flex items-center gap-6">
							<div
								class={[
									'flex h-16 w-16 items-center justify-center rounded-[1.35rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
									action.variant === 'utility'
										? 'bg-[linear-gradient(135deg,#0058bc_0%,#0a74eb_100%)] text-white'
										: 'bg-[rgba(0,88,188,0.06)] text-[#0058bc]'
								]}
							>
								<Icon class="size-7" />
							</div>
							<div class="space-y-2">
								<h2
									class={[
										'text-[1.95rem] font-semibold tracking-[-0.05em]',
										action.variant === 'utility' ? 'text-[#0058bc]' : 'text-current'
									]}
								>
									{action.name}
								</h2>
								<p
									class={[
										'text-base leading-7',
										action.variant === 'utility'
											? 'text-[#5087cf]'
											: action.disabled
												? 'text-slate-500'
												: 'text-slate-600'
									]}
								>
									{action.detail}
								</p>
							</div>
						</div>

						<div class="relative flex items-center justify-center">
							{#if action.variant === 'utility'}
								<Plus class="size-8 text-[#7ca8e7]" />
							{:else}
								<ChevronRight class="size-8 text-slate-300" />
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>
