<script lang="ts">
	import type { School } from '$lib/interfaces';

	import {
		payload as payloadStore,
		extra as extraStore,
		errors as errorsStore
	} from '$lib/components/admin/setup/setup-store';

	let wantsFilter = true;

	const filterTypes = {
		whitelist: 'Whitelist',
		blacklist: 'Blacklist'
	};

	let payload: Partial<School>;
	payloadStore.subscribe((p) => (payload = p));

	const addClass = (className: string) => {
		if (payload.classesFilter === undefined) payload.classesFilter = [];
		if (!payload.classesFilter.includes(className)) {
			payloadStore.update((p) => ({
				...p,
				classesFilter: [...(p.classesFilter || []), className]
			}));
		} else {
			payloadStore.update((p) => ({
				...p,
				classesFilter: p.classesFilter ? p.classesFilter.filter((name) => name !== className) : []
			}));
		}
	};

	$: extraStore.update((extra) => {
		extra.wantsFilter = wantsFilter;
		extra.canProceed = wantsFilter
			? payload.classesFilterType && payload.classesFilter && payload.classesFilter.length > 0
			: true;
		if (!wantsFilter) {
			delete payload.classesFilter;
			delete payload.classesFilterType;
			payloadStore.set(payload);
			errorsStore.set({});
		}
		return extra;
	});
</script>

<h2>Filtro delle Classi</h2>
<p class="desc text-center">
	Seleziona le classi che possono partecipare alla settimana dello studente. Se non hai bisogno di
	questa funzionalità puoi anche scegliere di non utilizzare il filtro tramite l'opzione che segue.
</p>
<hr />
<div class="input-box">
	<span> Desideri utilizzare un filtro per classi? </span>
	<input type="checkbox" bind:checked={wantsFilter} />
</div>
<div class="class-filter" class:inactive={!wantsFilter}>
	<div class="filter-type">
		<span class="label"> Tipo di Filtro: </span>
		<select bind:value={payload.classesFilterType} class="select select-bordered w-full font-title">
			{#each Object.entries(filterTypes) as [value, key]}
				<option {value}>{key}</option>
			{/each}
		</select>
	</div>
	{#if payload.classes}
		<div class="filtered-list">
			{#each payload.classes as className}
				<div on:click={() => addClass(className)}>
					{className}
					<input
						type="checkbox"
						checked={payload.classesFilter?.includes(className) || false}
						class="toggle"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	h2 {
		@apply text-center;
	}

	.class-filter {
		@apply grid grid-cols-1 gap-3;

		&.inactive {
			@apply opacity-50 pointer-events-none;
		}
	}

	.filtered-list {
		@apply max-h-[40vh] overflow-y-auto;

		div {
			@apply flex justify-between items-center p-4 hover:bg-base-300 cursor-pointer font-light rounded-md font-title;
		}
	}
</style>
