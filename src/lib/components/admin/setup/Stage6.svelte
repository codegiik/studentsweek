<script lang="ts">
	import type { School } from '$lib/interfaces';
	import {
		extra as extraStore,
		errors as errorsStore,
		payload as payloadStore
	} from '$lib/components/admin/setup/setup-store';

	let payload: Partial<School>;
	let errors: Record<string, string>;
	errorsStore.subscribe((e) => (errors = e));
	payloadStore.subscribe((p) => (payload = p));

	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte';
	import MicrosoftIcon from '$lib/components/icons/MicrosoftIcon.svelte';
	import Fa from 'svelte-fa';
	import { faUser } from '@fortawesome/free-solid-svg-icons';

	let selected: 'domain' | 'email';

	const setSelected = (key: 'domain' | 'email') => {
		selected = key;
		if (selected === 'email')
			payloadStore.update((p) => {
				if (p.domain) delete p.domain;
				return p;
			});
	};

	$: extraStore.update((e) => {
		e.selectedAuth = selected;
		e.canProceed = selected === 'email' || (payload.domain && selected === 'domain') || false;
		return e;
	});
</script>

<h2 class="text-center">Metodo Di Autenticazione</h2>
<p class="desc text-center">
	Seleziona il metodo di autenticazione che vuoi utilizzare per gli utenti. Puoi scegliere tra
	autenticazione con email o con dominio.
</p>
<hr />
<div class="grid grid-cols-2 gap-2">
	<div
		class="btn btn-ghost btn-icons"
		class:selected={selected === 'domain'}
		on:click={() => setSelected('domain')}
	>
		<GoogleIcon />
		<MicrosoftIcon />
		Account Istituzionale
	</div>
	<div
		class="btn btn-ghost btn-icons"
		class:selected={selected === 'email'}
		on:click={() => setSelected('email')}
	>
		<Fa icon={faUser} />
		Credenziali Utente
	</div>
</div>
{#if selected === 'domain'}
	<p class="desc text-center">
		Scegliendo il metodo di autenticazione con dominio, gli utenti potranno accedere al sistema
		utilizzando le credenziali del proprio account istituzionale.
	</p>
	<snap class="label">Inserisci il dominio dell'account istituzionale:</snap>
	<div
		class="domain-field"
		class:!border-red-500={errors.domain}
		class:text-red-500={errors.domain}
	>
		<span> @ </span>
		<input
			type="text"
			placeholder="scuola.edu.it"
			bind:value={payload.domain}
			class:!border-red-500={errors.domain}
		/>
	</div>
{:else if selected == 'email'}
	<p class="desc text-center">
		La piattaforma genererà un codice univoco per ogni studente. Lo studente potrà utilizzare questo
		codice durante il processo di registrazione.
	</p>
{/if}

<style lang="postcss">
	.domain-field {
		@apply flex items-center justify-center;
		@apply border-accent border-2 rounded-md font-title;

		span {
			@apply px-4;
		}

		input {
			@apply p-2 flex-1;
			@apply border-l-2 border-accent outline-none;
		}
	}

	.selected {
		@apply bg-accent;
	}
</style>
