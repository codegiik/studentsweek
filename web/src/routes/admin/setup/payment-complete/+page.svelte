<script lang="ts">
	import { onMount } from 'svelte';
	import type { School } from '$lib/interfaces';

	import { firestore } from '$lib/firebase';
	import { doc, onSnapshot } from 'firebase/firestore';

	import { Jellyfish } from 'svelte-loading-spinners';

	import type { PageData } from './$types';
	import Fa from 'svelte-fa';
	import { faArrowRight, faCheck, faClose, faCross } from '@fortawesome/free-solid-svg-icons';
	export let data: PageData;

	let loading = true;
	let paid: boolean | undefined;
	let error: boolean | undefined;

	onMount(() => {
		if (!data.schoolId || !data.success) {
			error = true;
			loading = false;
			return;
		}

		const unsub = onSnapshot(doc(firestore, 'schools', data.schoolId), (doc) => {
			if (!doc.exists()) return;

			paid = (doc.data() as School).paid;

			if (paid === true && unsub) {
				loading = false;
				unsub();
			}

			setTimeout(() => {
				if (!paid) {
					error = true;
					loading = false;
					if (unsub) unsub();
				}
			}, 60000);
		});
	});
</script>

<div class="loading-wrapper">
	{#if loading === true}
		<Jellyfish size="200" color="#07BE00" />
		<h3>Sei quasi alla fine!</h3>
		<p class="desc text-center max-w-[300px]">
			La tua richiesta è stata presa in carico, attendi che il sistema processi il pagamento.
		</p>
	{:else if !loading && error === true}
		<div class="error-icon cartoonize cart-error">
			<Fa icon={faClose} size="lg" scale={5} color="#fff" />
		</div>
		<h3>Oh, qualcosa è andato storto.</h3>
		<p class="desc text-center max-w-[300px]">
			Non è stato possibile processare il pagamento. Controlla che il pagamento sia stato effettuato
			e riprova. Se il problema persiste, contatta il supporto clienti.
		</p>
	{:else}
		<div class="success-icon cartoonize cart-success">
			<Fa icon={faCheck} size="lg" scale={5} color="#fff" />
		</div>
		<h3>Complimenti 🎉!</h3>
		<p class="desc text-center max-w-[300px]">
			Hai completato con successo il processo di setup della scuola! Procedi verso il pannello admin
			per aggiungere i corsi e modificare le opzioni.
		</p>
		<a href="/admin" class="link link-info w-icon mt-2">
			Vai al Pannello Admin
			<Fa icon={faArrowRight} />
		</a>
	{/if}
</div>

<style lang="postcss">
	.loading-wrapper {
		@apply flex flex-col items-center justify-center h-full;
	}

	.error-icon {
		@apply h-48 w-48 bg-red-400 rounded-full flex items-center justify-center mb-4;
	}

	.success-icon {
		@apply h-48 w-48 bg-green-400 rounded-full flex items-center justify-center mb-4;
	}
</style>
