<script lang="ts">
	import { getConfigValue } from '$lib/firebase';

	import { onMount } from 'svelte';

	let hero_bg: string;

	onMount(async () => {
		hero_bg = (await getConfigValue('hero_bg')).asString();
	});
</script>

<section id="hero">
	<div class="hero-contents">
		<h2>StudentsWeek</h2>
		<p>Organizza la tua settimana dello studente con un semplice click</p>
		<p>
			Corsi, studenti, iscrizioni, multiple sedi, professori, aule, tutto gestibile da una semplice
			interfaccia grafica.
		</p>
	</div>
	<img src={hero_bg} class="hero-bg" alt="Hero Background" />
</section>
<footer class="footer footer-center p-4 bg-base-300 text-base-content font-title">
	<div>
		<p>
			Copyright © {new Date().getFullYear()} - All right reserved by Antonio Trapanese and Giuseppe Pascale
		</p>
	</div>
</footer>

<style lang="postcss">
	#hero {
		@apply grid grid-cols-1 grid-rows-2 h-[calc(100vh-92px)] items-end;

		.hero-contents {
			@apply mb-10 w-[90%] mx-auto max-w-7xl;

			p {
				@apply font-light text-lg md:max-w-2xl;
			}

			h2 {
				@apply font-title font-bold text-5xl mb-2;
			}
		}

		.hero-bg {
			@apply w-full object-cover h-full;
		}
	}
</style>
