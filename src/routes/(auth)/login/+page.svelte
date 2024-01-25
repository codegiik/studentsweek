<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/firebase';
	import { goto } from '$app/navigation';

	import Logo from '$lib/components/Logo.svelte';
	import ErrorBox from '$lib/components/ErrorBox.svelte';
	import { type UIError, AuthMethod } from '$lib/interfaces';
	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte';
	import MicrosoftIcon from '$lib/components/icons/MicrosoftIcon.svelte';

	import { checkValidEmail } from '$lib/utils';
	import {
		getRedirectResult,
		GoogleAuthProvider,
		OAuthProvider,
		signInWithEmailAndPassword,
		signInWithPopup
	} from 'firebase/auth';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	let authMethod: AuthMethod = AuthMethod.EmailAndPassword;
	let requestedMethod: string | null = $page.url.searchParams.get('method');
	let loginError: UIError | null = null;

	let password = '';
	let email = '';

	if (requestedMethod && Object.values(AuthMethod).includes(requestedMethod as AuthMethod)) {
		authMethod = requestedMethod as AuthMethod;
	}

	const changeAuthMethod = (newMethod: AuthMethod) => {
		$page.url.searchParams.set('method', newMethod);
		goto(`?${$page.url.searchParams.toString()}`);
		authMethod = newMethod;
	};

	const handleGoogleLogin = async () => {
		const provider = new GoogleAuthProvider();
		auth.useDeviceLanguage();
		await signInWithPopup(auth, provider);
	};

	const handleMicrosoftLogin = async () => {
		const provider = new OAuthProvider('microsoft.com');
		auth.useDeviceLanguage();
		await signInWithPopup(auth, provider);
	};

	const handleLogin = () => {
		toast.promise(
			new Promise<void>((resolve, reject) => {
				if (!checkValidEmail(email)) {
					loginError = { code: 'auth/invalid-email' };
					return reject();
				}

				return signInWithEmailAndPassword(auth, email, password)
					.then(() => resolve())
					.catch((err) => {
						loginError = err;
						reject();
					});
			}),
			{
				loading: 'Accedendo...',
				success: 'Accesso effettuato con successo!',
				error: 'Qualcosa è andato storto!'
			}
		);
	};

	onMount(() => {
		getRedirectResult(auth)
			.then((result) => {
				if (result) {
					OAuthProvider.credentialFromResult(result);
				}
			})
			.catch((error) => {
				loginError = error;
			});
	});
</script>

<form on:submit|preventDefault={handleLogin} class="auth-box">
	<h3 class="auth-logo">StudentsWeek</h3>
	<p class="auth-desc">Effettua l'accesso selezionando il metodo indicato dalla scuola.</p>
	<hr />
	{#if loginError}
		<ErrorBox error={loginError} />
	{/if}
	{#if authMethod == AuthMethod.EmailAndPassword}
		<input
			type="text"
			placeholder="E-mail"
			class="auth-usr input input-bordered"
			bind:value={email}
		/>
		<input
			type="password"
			placeholder="Password"
			class="auth-pass input input-bordered"
			bind:value={password}
		/>
		<input type="submit" value="Accedi" class="btn btn-primary" />
		<hr />
		<p class="auth-or">oppure</p>
		<button
			class="auth-switch-method btn btn-ghost btn-icons"
			on:click|preventDefault={() => changeAuthMethod(AuthMethod.InstitutionalAccount)}
		>
			<GoogleIcon />
			<MicrosoftIcon />
			Account Istituzionale
		</button>
	{:else}
		<button
			class="auth-switch-method btn btn-ghost btn-icons"
			on:click|preventDefault={handleGoogleLogin}
		>
			<GoogleIcon />
			Accedi con Google
		</button>
		<button
			class="auth-switch-method btn btn-ghost btn-icons"
			on:click|preventDefault={handleMicrosoftLogin}
		>
			<MicrosoftIcon />
			Accedi con Microsoft
		</button>
		<hr />
		<p class="auth-or">oppure</p>
		<button
			class="auth-switch-method btn btn-ghost btn-icons"
			on:click|preventDefault={() => changeAuthMethod(AuthMethod.EmailAndPassword)}
		>
			<Logo iconBackground={false} withText={false} />
			Accedi Tramite Credenziali
		</button>
	{/if}
	<a href="/register" class="auth-reg"> Passa alla registrazione. </a>
</form>

<style lang="postcss">
	.auth-box {
		@apply flex flex-col gap-2 items-center bg-base-200;
		@apply text-base-content;
		@apply w-full max-w-[400px];
		@apply border-2 border-accent rounded-lg px-5 py-8;
		box-shadow: 0 3px 0 hsl(var(--a));

		.auth-logo {
			@apply font-bold font-title text-4xl;
		}

		.auth-desc {
			@apply w-[80%] opacity-50;
		}

		.auth-or {
			@apply -mt-8 bg-base-200 text-accent-focus italic px-3;
		}

		.auth-switch-method {
			@apply w-full;
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
	}
</style>
