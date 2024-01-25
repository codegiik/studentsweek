<script>
	import { browser } from '$app/environment';

	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';

	import Logo from './Logo.svelte';

	const PUBLIC_DATE_START = '2022-12-10T18:00:00.000Z';

	let counter = Date.parse(PUBLIC_DATE_START) - Date.now();

	let seconds = Math.floor(counter / 1000) % 60;
	let minutes = Math.floor(counter / 60000) % 60;
	let hours = Math.floor(counter / 3600000);

	onMount(() => {
		const interval = setInterval(() => {
			counter = Date.parse(PUBLIC_DATE_START) - Date.now();
			seconds = Math.floor(counter / 1000) % 60;
			minutes = Math.floor(counter / 60000) % 60;
			hours = Math.floor(counter / 3600000);

			if (counter <= 0) goto('/');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>StudentsWeek - Per una settimana dello studente zero sbatti!</title>
</svelte:head>
<div class="wrapper">
	<Logo />
	<p class="motto">Per una settimana dello studente zero sbatti!</p>
	<hr />
	<p class="desc">
		Attualmente la piattaforma è in manutenzione. Per maggiori informazioni potete contattarci su
		Telegram a
		<a href="https://t.me/studentsweek_bot">@studentsweek_bot</a> oppure via e-mail a
		<a href="mailto:info@codegiik.com">info@codegiik.com</a>.
	</p>

	<!-- <FlipClock /> -->
</div>

<style lang="postcss">
	.wrapper {
		@apply h-full flex flex-col justify-center items-center text-center;

		.motto {
			@apply font-light font-title italic opacity-50;
		}

		hr {
			@apply w-1/2 max-w-[300px] min-w-[100px] my-5;
		}

		.desc {
			@apply w-1/2 min-w-[300px] font-light;

			a {
				@apply underline decoration-dotted underline-offset-4 italic text-blue-600;
			}
		}

		.flip {
			@apply flex gap-2;

			.tile {
				@apply relative w-16 h-16 flex-1 drop-shadow-sm;

				.segment {
					@apply absolute inset-0 font-title text-2xl flex justify-center items-center;
					@apply bg-base-200 rounded-lg font-bold border-2 text-neutral;
				}

				.flip-label {
					@apply absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-xs text-neutral font-light;
					@apply uppercase tracking-widest;
				}
			}
		}

		h4 {
			@apply my-2;
		}
	}

	@keyframes flip {
		0% {
			transform: rotateX(0deg);
		}
		100% {
			transform: rotateX(180deg);
		}
	}
</style>
