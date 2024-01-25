<script lang="ts">
	import { onMount } from 'svelte';
	import { getLastIndex } from '$lib/utils';
	import type { School } from '$lib/interfaces';
	import LocationModal from './LocationModal.svelte';
	import { payload as payloadStore } from '$lib/components/admin/setup/setup-store';
	import { openModal } from 'svelte-modals';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import Fa from 'svelte-fa';
	import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

	let payload: Partial<School>;
	payloadStore.subscribe((p) => (payload = p));

	onMount(() => {
		if (payload.locations && payload.locations.length === 0 && payload.rules && payload.classes) {
			payloadStore.set({
				...payload,
				locations: [
					{
						name: 'Centrale',
						rules: payload.rules,
						classes: payload.classes
					}
				]
			});
		}
	});

	const addCard = () => {
		payloadStore.update((p) => {
			if (!p.locations || !p.rules || !p.classes) return p;

			return {
				...p,
				locations: [
					...(p.locations || []),
					{
						name: `Nuova Sede (${getLastIndex(
							p.locations.map((l) => l.name),
							/Nuova Sede \(\d{1,}\)/g
						)})`,
						rules: p.rules,
						classes: p.classes
					}
				]
			};
		});
	};

	const editLocation = (index: number) => {
		openModal(LocationModal, {
			locationIndex: index
		});
	};

	const openRemoveLocation = (index: number) => {
		if (!payload || !payload.locations) return;

		openModal(ConfirmModal, {
			message: "Siete sicuri di voler eliminare l'elemento " + payload.locations[index].name + '?',
			callback: () => {
				if (!payload.locations) return;
				payload.locations = payload.locations.filter(
					(l) => payload.locations && l.name !== payload.locations[index].name
				);

				payloadStore.set(payload);
			}
		});
	};
</script>

<h2 class="text-center">Sedi</h2>
<p class="desc text-center">
	Inserisci le sedi della tua scuola per gestire corsi in diverse sedi. In questo modo gli studenti
	potranno solo visualizzare ed iscriversi ai corsi della sede di cui fanno parte.
</p>
<hr />
{#if payload.locations}
	<div class="cards-list">
		{#each payload.locations as location, i}
			<div class="card">
				<input type="text" bind:value={location.name} />
				<span class="desc">
					Orari: {location.rules.length} <br />
					Classi: {location.classes.length}
				</span>
				<div class="buttons">
					<div class="btn btn-secondary" on:click={() => editLocation(i)}>Modifica</div>
					{#if payload.locations.length > 1}
						<div class="btn btn-icons remove-card btn-error" on:click={() => openRemoveLocation(i)}>
							<Fa icon={faTrash} />
							Elimina
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<div class="btn btn-icon btn-primary" on:click={addCard}>
			<Fa icon={faPlus} />
		</div>
	</div>
{/if}

<style lang="postcss">
	.cards-list {
		@apply flex items-center gap-3 overflow-x-auto max-w-[450px];

		&::-webkit-scrollbar {
			@apply hidden;
		}
	}

	.card {
		@apply flex flex-col gap-4 bg-base-100;
		@apply p-4 w-[300px] shrink-0 border-2 border-accent rounded-lg;

		input {
			@apply bg-base-100 font-title font-semibold text-xl;
		}
	}

	.buttons {
		@apply flex gap-3;

		* {
			@apply flex-1;
		}
	}

	.remove-card,
	.add-card {
		@apply items-center justify-center;
	}
</style>
