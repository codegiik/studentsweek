<script lang="ts">
	import { goto } from '$app/navigation';

	import { currentUser } from '$lib/user';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	const { user } = currentUser;

	onMount(() => {
		const unsubscribe = currentUser.profile.subscribe((profile) => {
			if (profile == 'missing' || (profile?.email && !profile?.rules && profile.role != 'admin')) {
				toast.success('Attiva il tuo account prima di continuare');
				setTimeout(() => {
					goto('/activate');
				}, 500);
			} else if (profile?.role == 'admin') {
				toast.success('Benvenuto' + ($user?.displayName ? ' ' + $user?.displayName : ''));
				setTimeout(() => {
					goto('/admin');
				}, 500);
			} else if (profile) {
				toast.success('Benvenuto' + ($user?.displayName ? ' ' + $user?.displayName : ''));
				setTimeout(() => {
					goto('/dashboard');
				}, 500);
			}
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<section id="auth">
	<slot />
	<a href="/help" class="help">Stai riscontrando problemi nell'accesso?</a>
</section>

<style lang="postcss">
	#auth {
		@apply h-full w-full flex flex-col items-center justify-center gap-2 px-3 text-center;

		.help {
			@apply my-2 opacity-30;
		}
	}
</style>
