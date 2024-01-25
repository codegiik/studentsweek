<script lang="ts">
	import currentUser from '$lib/user';
	const { user, school } = currentUser;
</script>

<h1>
	👋 Bentornato {$user?.displayName ?? ''}
</h1>
<p class="desc my-2">
	Questo è il pannello admin, qui puoi gestire i tuoi dati e le impostazioni della settimana dello
	studente.
</p>

<div class="underconstruction">
	<img src="/images/blurry.png" alt="Blurry" />
	<h2>🚧 In Costruzione 🚧</h2>
	<p class="desc">Questo pannello è ancora in costruzione, non è ancora possibile utilizzarlo.</p>
</div>

<style lang="postcss">
	.underconstruction {
		@apply h-[85vh] w-full flex flex-col items-center justify-center text-center relative text-white overflow-hidden;

		img {
			@apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl;
			z-index: 0;
		}

		h2 {
			z-index: 2;
		}

		p {
			@apply max-w-[300px] text-white;
		}
	}
</style>
