<script lang="ts">
	import { ScanBarcode, ChevronDown, MapPin, Info } from '@lucide/svelte';
</script>

<div class="space-y-8">
	<!-- Scan & Filters (reference: staging-strict-v4) -->
	<section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
		<div class="lg:col-span-6 space-y-2">
			<label class="ui-label text-xs px-1" for="scan-input">Scan Barcode</label>
			<div class="relative">
				<ScanBarcode class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary" />
				<input
					id="scan-input"
					type="text"
					placeholder="Scan or type item barcode..."
					class="w-full h-16 pl-14 pr-6 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary transition-all text-lg placeholder:text-on-surface-variant/50"
				/>
			</div>
		</div>
		<div class="lg:col-span-3 space-y-2">
			<label class="ui-label text-xs px-1">Department</label>
			<button class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors">
				<span>Select Department</span>
				<ChevronDown class="size-5 text-on-surface-variant" />
			</button>
		</div>
		<div class="lg:col-span-3 space-y-2">
			<label class="ui-label text-xs px-1">Location</label>
			<button class="w-full h-16 flex items-center justify-between px-6 bg-surface-container-low rounded-2xl text-on-surface font-semibold hover:bg-surface-container-high transition-colors">
				<span>Select Location</span>
				<MapPin class="size-5 text-on-surface-variant" />
			</button>
		</div>
	</section>

	<!-- Data panel with table (reference: staging-strict-v4) -->
	<div class="bg-surface-container-low rounded-[2rem] p-8 min-h-[400px] flex flex-col">
		<!-- Context indicator -->
		<div class="flex items-center gap-3 mb-8 text-on-surface-variant/60">
			<Info class="size-5" />
			<span class="text-lg font-medium">No Location</span>
		</div>

		<!-- Table -->
		<div class="flex-grow">
			<!-- Table header -->
			<div class="grid grid-cols-5 px-6 py-4 text-[13px] font-bold tracking-widest uppercase text-on-surface-variant/70">
				<div>Part Number</div>
				<div>Description</div>
				<div class="text-center">Quantity</div>
				<div>Order Number</div>
				<div>Location</div>
			</div>

			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-16 text-on-surface-variant/50">
				<ScanBarcode class="size-10 mb-4" />
				<p class="text-lg font-medium">Scan a barcode to begin staging items</p>
			</div>
		</div>
	</div>
</div>
