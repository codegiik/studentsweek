<script lang="ts">
	import DatePicker from './DatePicker.svelte';
	import ClassesPicker from './ClassesPicker.svelte';
	import { onMount } from 'svelte/internal';
	import { payload as payloadStore } from '$lib/components/admin/setup/setup-store';
	import type { School, SchoolLocation } from '$lib/interfaces';
	import { toBinary } from '$lib/utils';
	import { closeModal } from 'svelte-modals';

	export let locationIndex: number;
	export let currentTab = 'classes';
	export let isOpen: boolean;

	let rules: number[] | undefined;
	let location: SchoolLocation | undefined;
	let payload: Partial<School>;
	payloadStore.subscribe((p) => {
		payload = p;
		if (payload.locations) location = payload.locations[locationIndex];
	});

	$: if (payload.locations && payload.locations[locationIndex]) {
		location = payload.locations[locationIndex];

		payloadStore.update((p) => {
			if (!p.locations || !payload.locations) return p;
			p.locations[locationIndex] = payload.locations[locationIndex];
			return p;
		});
	}

	const setData = ({ rules }: { rules: number[] }) => {
		payloadStore.update((p) => {
			if (!p.locations) return p;
			p.locations[locationIndex].rules = rules;
			return p;
		});
	};

	const getRestricted = () => {
		if (!payload.rules) return;
		return Object.values(payload.rules).map((_, i) => {
			if (!payload.numberOfHours || !payload.rules) return [0];
			return toBinary(payload.numberOfHours, payload.rules, i, { inverted: true });
		});
	};
	let restricted: number[][] | undefined;
	$: restricted = getRestricted();

	onMount(() => {
		rules = location && location.rules.length > 0 ? location.rules : payload.rules;
	});
</script>

{#if isOpen && location}
	<div class="modal-content">
		<h2>{location.name || 'Sede senza nome'}</h2>
		<p class="desc">
			Controlla le impostazioni riguardante questa location attraverso le opzioni sottostanti.
		</p>
		<div class="divider" />
		<p class="label">Nome della Sede:</p>
		<input type="text" bind:value={location.name} class="input input-bordered w-full" />
		<p class="label">Seleziona le Classi che fanno parte di questa Sede:</p>
		<ClassesPicker {locationIndex} />
		{#if rules && payload.days}
			<p class="label">Modifica l'orario della sede se necessario:</p>
			<DatePicker
				{rules}
				{setData}
				{restricted}
				days={payload.days}
				canEditDays={false}
				class="location-calendar"
			/>
		{/if}
		<div class="divider" />
		<button class="btn btn-primary w-full" on:click={closeModal}>Applica</button>
	</div>
{/if}

<style lang="postcss">
	.location-name {
		@apply text-[40px] outline-none border-gray-400 border-b-2 px-2;
		@apply focus:border-primary hover:border-primary;
	}

	.tab-switcher {
		@apply flex items-center justify-center;

		& > div {
			@apply hover:border-primary;
			@apply py-2 px-8 border-primary/[0.3] border-b-2 cursor-pointer;
		}
	}

	.tab-content {
		@apply flex flex-col items-center justify-center gap-3;

		h1 {
			@apply text-center !mx-20;
		}
	}

	:global(.location-modal) {
		@apply !h-auto px-8 py-6 flex flex-col gap-3;
	}

	:global(.location-calendar .days > div),
	:global(.location-calendar .hour > div) {
		@apply !py-4;
	}
</style>
