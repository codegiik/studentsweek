<script lang="ts">
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '$lib/firebase';
	import toast from 'svelte-french-toast';
	import { passwordStrength } from 'check-password-strength';
	import { checkValidEmail } from '$lib/utils';
	import ErrorBox from '$lib/components/ErrorBox.svelte';

	let password = '';
	let confirmPassword = '';
	let email = '';
	let currentPasswordStrength: string | undefined = undefined;
	let validPassword: boolean | undefined = undefined;
	let validEmail: boolean | undefined = undefined;
	let registrationError:
		| {
				code: string;
		  }
		| undefined = undefined;

	const checkEmail = () => {
		validEmail = checkValidEmail(email);
	};

	const checkPasswords = () => {
		currentPasswordStrength = (passwordStrength(password).value as string)
			.toLowerCase()
			.replaceAll(' ', '-');
		if (password != confirmPassword && confirmPassword != '') validPassword = false;
		else if (confirmPassword != '') validPassword = true;
	};

	const strengthToPercentage = (passStr: string | unknown) => {
		switch (passStr) {
			case 'too-weak':
				return 25;
			case 'weak':
				return 50;
			case 'medium':
				return 75;
			case 'strong':
				return 100;
			default:
				return 0;
		}
	};

	const handleRegistration = () => {
		toast.promise(
			new Promise<void>((resolve, reject) => {
				if (!validPassword || !validEmail) {
					registrationError = {
						code: 'auth/invalid-auth-or-email'
					};
					return reject(registrationError);
				}

				return createUserWithEmailAndPassword(auth, email, password)
					.then((userCredentials) => {
						console.log('User Credentials', userCredentials);
						registrationError = undefined;
						resolve();
					})
					.catch((err) => {
						registrationError = err;
						reject(err);
					});
			}),
			{
				loading: "Registrando l'account...",
				success: 'Account Registrato con Successo',
				error: 'Qualcosa è andato storto'
			}
		);
	};
</script>

<form
	on:submit|preventDefault={handleRegistration}
	class="auth-box"
	class:errored={Boolean(registrationError)}
>
	<h3 class="auth-logo">StudentsWeek</h3>
	<p class="auth-desc">
		Utilizza questa pagina ed i dati provveduti dalla scuola per eseguire la registrazione al
		portale.
	</p>
	<hr />
	{#if registrationError}
		<ErrorBox error={registrationError} />
	{/if}
	<input
		type="text"
		placeholder="E-mail"
		class="auth-usr input input-bordered"
		bind:value={email}
		on:input={checkEmail}
	/>
	{#if validEmail === false}
		<span class="auth-helper">Inserisci un'email corretta</span>
	{/if}
	<input
		type="password"
		placeholder="Password"
		class="auth-pass input input-bordered"
		bind:value={password}
		on:input={checkPasswords}
	/>
	{#if currentPasswordStrength}
		<div class="auth-pass-str">
			<div
				class={`pass-${currentPasswordStrength} auth-pass-str-bar`}
				style={`width: ${strengthToPercentage(currentPasswordStrength)}%`}
			/>
		</div>

		<span class="auth-helper">
			{#if currentPasswordStrength == 'too-weak'}
				Troppo Debole
			{:else if currentPasswordStrength == 'weak'}
				Debole
			{:else if currentPasswordStrength == 'medium'}
				Media
			{:else if currentPasswordStrength == 'strong'}
				Difficile
			{/if}
		</span>
	{/if}
	<input
		type="password"
		placeholder="Conferma Password"
		class="auth-pass input input-bordered"
		bind:value={confirmPassword}
		on:input={checkPasswords}
	/>
	{#if validPassword === false}
		<span class="auth-helper">Le password inserite non coincidono</span>
	{/if}
	<input
		type="submit"
		value="Registrati"
		class="btn btn-primary"
		class:btn-disabled={!validPassword || !validEmail}
	/>
	<a href="/login" class="auth-reg"> Passa alla pagina d'accesso. </a>
</form>

<style lang="postcss">
	.auth-box {
		@apply flex flex-col gap-2 items-center bg-base-200;
		@apply text-base-content;
		@apply w-full max-w-[400px];
		@apply border-2 border-accent rounded-lg px-5 py-8;
		box-shadow: 0 3px 0 hsl(var(--a));

		.auth-error {
			@apply border-2 bg-error text-error-content border-red-600;
			@apply p-2 rounded-lg;

			.auth-error-title {
				@apply block font-title font-bold mb-1 text-lg flex gap-2 items-center justify-center;
			}
		}

		.auth-logo {
			@apply font-bold font-title text-4xl;
		}

		.auth-desc {
			@apply opacity-50;
		}

		.auth-pass-str {
			@apply w-full h-3 bg-base-100 border-2 border-accent rounded-xl relative overflow-hidden;

			.auth-pass-str-bar {
				@apply absolute inset-y-0 left-0 rounded-xl;
				transition: width 0.5s cubic-bezier(0.41, 0.58, 0.38, 1.15);

				&.pass-too-weak {
					@apply bg-red-400;
				}

				&.pass-weak {
					@apply bg-orange-400;
				}

				&.pass-medium {
					@apply bg-yellow-400;
				}

				&.pass-strong {
					@apply bg-green-400;
				}
			}
		}

		.auth-helper {
			@apply text-xs text-left w-full -mt-2 italic opacity-50;
		}

		hr {
			@apply w-full my-3;
		}

		input {
			@apply w-full;
		}

		.auth-reg {
			@apply mt-3 italic opacity-50 underline decoration-dotted underline-offset-4 hover:opacity-90;
		}

		&.errored {
			.auth-helper {
				@apply text-red-600 font-normal;
			}
		}
	}
</style>
