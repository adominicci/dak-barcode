<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		CalendarDays,
		ChevronRight,
		Grid2x2,
		LogOut,
		MapPin,
		Plus,
		Truck,
		UserRoundPlus
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import OperationalActionCard from '$lib/components/workflow/operational-action-card.svelte';
	import TargetBadge from '$lib/components/workflow/target-badge.svelte';
	import WillCallScanModal from '$lib/components/workflow/will-call-scan-modal.svelte';
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
		action: 'link' | 'will-call';
	};

	let { data }: PageProps = $props();
	let isWillCallModalOpen = $state(false);

	const actions: HomeCard[] = [
		{
			name: 'Staging',
			detail: 'Organize outgoing inventory',
			icon: Grid2x2,
			href: '/staging',
			testId: 'home-card-staging',
			variant: 'default',
			action: 'link'
		},
		{
			name: 'Loading',
			detail: 'Scan items onto trailers',
			icon: Truck,
			href: '/dropsheets',
			testId: 'home-card-loading',
			variant: 'default',
			action: 'link'
		},
		{
			name: 'Will Call',
			detail: 'Customer pickups and direct load',
			icon: MapPin,
			href: null,
			testId: 'home-card-will-call',
			variant: 'default',
			action: 'will-call'
		},
		{
			name: 'Add Loader',
			detail: 'Assign personnel to bay',
			icon: UserRoundPlus,
			href: '/loaders',
			testId: 'home-card-add-loader',
			variant: 'utility',
			action: 'link'
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

	async function handleWillCallResolved(dropSheetId: number, loadNumber: string) {
		const searchParams = new URLSearchParams({
			loadNumber,
			deliveryNumber: loadNumber,
			driverName: 'WILL CALL',
			willcall: 'true',
			returnTo: '/home'
		});

		await goto(resolve(`/select-category/${dropSheetId}?${searchParams.toString()}`));
	}
</script>

<section class="ds-page-shell min-h-dvh overflow-hidden">
	<div class="flex min-h-dvh w-full flex-col">
		<header
			data-testid="home-topbar"
			class="ds-topbar flex items-center justify-between px-6"
		>
			<div class="flex items-center gap-4">
				<button
					type="button"
					disabled
					class="flex size-12 items-center justify-center rounded-[var(--ds-radius-control)] bg-ds-gray-100 text-ds-gray-600 disabled:opacity-60"
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
						href={resolve('/location?returnTo=%2Fhome')}
						class="hidden h-10 items-center justify-center rounded-[var(--ds-radius-control)] border border-ds-gray-300 bg-white px-4 text-sm font-semibold text-ds-gray-900 transition hover:bg-ds-blue-50 sm:inline-flex"
					>
						Change target
					</a>
				{/if}
				<form method="POST" action="/logout" data-testid="home-sign-out-form">
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="h-10 rounded-[var(--ds-radius-control)] border-transparent bg-red-50 px-4 text-sm font-semibold whitespace-nowrap text-ds-red-500 hover:bg-red-100"
					>
						<LogOut class="size-4" />
						Sign out
					</Button>
				</form>
				<div class="flex size-9 items-center justify-center rounded-full bg-ds-blue-500 text-xs font-bold text-white">
					{getUserInitials(data.displayName, data.userEmail)}
				</div>
			</div>
		</header>

		<div class="ds-page-content flex flex-1 items-center">
			<div
				data-testid="home-card-grid"
				class="grid w-full grid-cols-1 gap-5 md:grid-cols-2"
			>
				{#each actions as action (action.name)}
					{@const Icon = action.icon}
					{@const isWillCall = action.action === 'will-call'}
					<OperationalActionCard
						name={action.name}
						detail={action.detail}
						icon={Icon}
						trailingIcon={action.variant === 'utility' ? Plus : ChevronRight}
						href={isWillCall ? null : withHomeReturnTo(action.href as HomeActionHref)}
						testId={action.testId}
						variant={action.variant}
						onclick={isWillCall
							? () => {
									isWillCallModalOpen = true;
								}
							: null}
					/>
				{/each}
			</div>
		</div>
	</div>
</section>

{#if isWillCallModalOpen}
	<WillCallScanModal
		onClose={() => {
			isWillCallModalOpen = false;
		}}
		onResolved={handleWillCallResolved}
	/>
{/if}
