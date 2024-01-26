<script lang="ts">
	import { getLastIndex } from '$lib/utils';
	import type { School, SetupExtra } from '$lib/interfaces';

	import {
		payload as payloadStore,
		extra as extraStore
	} from '$lib/components/admin/setup/setup-store';
	import Fa from 'svelte-fa';
	import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

	let extra: SetupExtra;
	let payload: Partial<School>;
	extraStore.subscribe((e) => (extra = e));
	payloadStore.subscribe((p) => (payload = p));

	const calculateStudents = (classNums: number[]) => {
		let sum = 0;
		classNums.forEach((num) => (sum += num));
		payloadStore.update((payload) => {
			payload.currentStudents = sum;
			return payload;
		});
	};

	$: calculateStudents(extra.classNumbers);

	const addClass = () => {
		if (!payload.classes) return;
		payload.classes = [
			...payload.classes,
			`Classe Senza Nome (${getLastIndex(payload.classes, /Classe Senza Nome \(\d{1,}\)/g)})`
		];
		extra.classNumbers.push(1);
		payloadStore.set(payload);
		extraStore.set(extra);
	};

	const removeClass = (index: number) => {
		if (!payload.classes) return;
		payload.classes = payload.classes.filter((_, i) => i != index);
		extra.classNumbers = extra.classNumbers.filter((_, i) => i != index);
		payloadStore.set(payload);
		extraStore.set(extra);
	};

	$: extraStore.update((extra) => {
		extra.canProceed = payload.classes && payload.classes.length > 0;
		return extra;
	});

	$: if (payload.classes) {
		payloadStore.update((p) => ({
			...p,
			locations: [],
			classesFilter: []
		}));
	}
</script>

<h2>Le Classi</h2>
<p class="desc text-center">
	Organizza la tua scuola nelle varie classi. Puoi aggiungere o rimuovere classi utilizzando i
	pulsanti sottostanti. Specifica il numero di studenti per ogni classe così da tenere sotto
	controllo le registrazioni.
</p>
<hr />
{#if payload.classes}
	<div class="classes">
		{#each payload.classes as _className, i}
			<div class="class-row">
				<span class="class-n">{i + 1}.</span>
				<input bind:value={payload.classes[i]} class="class-name" />
				<input type="number" min={1} bind:value={extra.classNumbers[i]} class="class-number" />
				<div class="remove-class" on:click={() => removeClass(i)}>
					<Fa icon={faTrash} />
				</div>
			</div>
		{/each}
	</div>
{/if}
<div class="btn btn-primary btn-icons" on:click={addClass}>
	Aggiungi una Classe
	<Fa icon={faPlus} />
</div>
<hr />

<style lang="postcss">
	h2 {
		@apply text-center;
	}

	.classes {
		@apply grid grid-cols-1 max-h-[32vh] overflow-y-auto gap-2;
	}

	.class-row {
		@apply flex border-2 border-accent rounded-xl overflow-hidden;

		input {
			@apply focus:outline-none;
		}

		.class-n {
			@apply w-12 py-3 font-bold font-title text-neutral bg-accent tracking-widest text-lg text-center;
		}

		.class-name {
			@apply flex-1 px-4 font-title bg-base-200;
		}

		.class-number {
			@apply w-16 text-center bg-base-200 border-l-2 font-light;
		}

		.remove-class {
			@apply cursor-pointer w-10 py-3 flex items-center justify-center;
			@apply bg-error text-error-content;
		}
	}
</style>
