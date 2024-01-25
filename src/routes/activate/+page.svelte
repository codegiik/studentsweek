<script lang="ts">
	import { goto } from '$app/navigation';

	import ErrorBox from '$lib/components/ErrorBox.svelte';
	import type { School, UIError } from '$lib/interfaces';
	import { AuthMethod } from '$lib/interfaces';
	import { currentUser } from '$lib/user';
	import type { ActionData } from './$types';

	export let data: {
		authMethod: AuthMethod;
		error?: UIError;
		school?: Partial<School>;
	};
	export let form: ActionData & {
		error: UIError;
	};

	const handleSignOut = () => {
		currentUser.logout().then(() => {
			goto('/login');
		});
	};
</script>

<section id="activation">
	<form class="activation-box" method="POST">
		<h3 class="activation-logo">StudentsWeek</h3>
		<p class="activation-desc">
			Congratulazioni 🎉 Ti sei registrato correttamente al portale. Ora devi però attivare il tuo
			account secondo i dati comunicati dalla scuola.
		</p>
		<hr />
		{#if form?.error || data?.error}
			<ErrorBox error={form?.error || data?.error} />
		{/if}
		{#if data?.authMethod === AuthMethod.EmailAndPassword}
			<input
				type="text"
				class="input input-bordered"
				placeholder="Codice Univoco"
				name="code"
				id="code"
			/>
		{:else if data?.authMethod === AuthMethod.InstitutionalAccount && data?.school}
			<p class="label w-full">Seleziona la tua classe:</p>
			<select name="class" id="class" class="select select-bordered w-full">
				{#each data?.school?.classes ?? [] as schoolClass}
					<option value={schoolClass}>{schoolClass}</option>
				{/each}
			</select>
		{/if}
		<input
			type="submit"
			class="btn btn-primary"
			value="Attiva"
			class:btn-disabled={Boolean(data?.error)}
		/>
	</form>
	<a class="desc help-link" on:click={handleSignOut}>Hai sbagliato account? Effettua il Log Out</a>
	<a class="desc help-link" href="/admin/setup">Vuoi registrare la tua scuola? Clicca Qui!</a>
</section>

<style lang="postcss">
	#activation {
		@apply h-full w-full flex flex-col items-center justify-center gap-2 px-3 text-center;

		.activation-box {
			@apply flex flex-col gap-2 items-center bg-base-200;
			@apply text-base-content;
			@apply w-full max-w-[400px];
			@apply border-2 border-accent rounded-lg px-5 py-8;
			box-shadow: 0 3px 0 hsl(var(--a));

			.activation-logo {
				@apply font-bold font-title text-4xl;
			}

			.activation-desc {
				@apply w-full opacity-50;
			}

			.activation-or {
				@apply -mt-8 bg-base-200 text-accent-focus italic px-3;
			}

			.activation-switch-method {
				@apply w-full;
			}

			hr {
				@apply w-full my-3;
			}

			input {
				@apply w-full;
			}

			.activation-reg {
				@apply mt-3 italic opacity-50 underline decoration-dotted underline-offset-4 hover:opacity-90;
			}
		}

		.help-link {
			@apply underline decoration-dotted underline-offset-4 italic text-neutral hover:text-neutral-focus cursor-pointer;
		}
	}
</style>
