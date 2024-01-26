<script lang="ts">
	import type { School, SetupExtra } from '$lib/interfaces';
	import type { SvelteComponent } from 'svelte';

	import {
		payload as payloadStore,
		errors as errorsStore,
		extra as extraStore
	} from '$lib/components/admin/setup/setup-store';

	import Stage1 from '$lib/components/admin/setup/Stage1.svelte';
	import Stage2 from '$lib/components/admin/setup/Stage2.svelte';
	import Stage3 from '$lib/components/admin/setup/Stage3.svelte';
	import Stage4 from '$lib/components/admin/setup/Stage4.svelte';
	import Stage5 from '$lib/components/admin/setup/Stage5.svelte';
	import Stage6 from '$lib/components/admin/setup/Stage6.svelte';
	import FinalizePayment from '$lib/components/admin/setup/FinalizePayment.svelte';

	let stage = 0;
	const stages: typeof SvelteComponent[] = [
		Stage1,
		Stage2,
		Stage3,
		Stage4,
		Stage5,
		Stage6,
		FinalizePayment
	];

	let extra: SetupExtra;
	let payload: Partial<School>;
	let errors: Record<string, string>;

	extraStore.subscribe((e) => (extra = e));
	errorsStore.subscribe((e) => (errors = e));
	payloadStore.subscribe((p) => (payload = p));

	const errorChecks = [
		[
			{
				key: 'name',
				condition: () =>
					payload.name ? payload.name.length < 3 || payload.name.length > 50 : true,
				error: 'La lunghezza del nome deve essere tra i 3 e i 50 caratteri.'
			},
			{
				key: 'introDescription',
				condition: () => payload.introDescription && payload.introDescription.length > 500,
				error: 'La lunghezza della descrizione deve essere al massimo 250 caratteri.'
			}
		],
		[
			{
				key: 'classes',
				condition: () => payload.classes && payload.classes.length == 0,
				error: "E' necessaria almeno una classe."
			},
			{
				key: 'classes',
				condition: () =>
					payload.classes &&
					payload.classes.some((className) => className.length == 0 || className.length > 50),
				error: "La lunghezza del nome delle classi deve essere tra l'1 e i 50 caratteri."
			},
			{
				key: 'classes',
				condition: () =>
					payload.classes && payload.classes.length !== new Set(payload.classes).size,
				error: 'I nomi delle classi devono essere univoci!'
			},
			{
				key: 'currentStudents',
				condition: () => extra.classNumbers && extra.classNumbers.some((num) => num <= 0),
				error: 'Il numero di studenti deve essere maggiore o uguale a 1 per ciascuna classe.'
			}
		],
		[
			{
				key: 'classesFilterType',
				condition: () => extra.wantsFilter && !payload.classesFilterType,
				error: 'Tipo di filtro classi non specificato!'
			},
			{
				key: 'classesFilter',
				condition: () =>
					payload.classesFilterType &&
					(!payload.classesFilter || (payload.classesFilter && payload.classesFilter.length === 0)),
				error: 'La lista di classi non può essere vuota!'
			}
		],
		[
			{
				key: 'timeUnit',
				condition: () => payload.timeUnit && (payload.timeUnit < 0 || payload.timeUnit > 23 * 60),
				error: 'Unità di tempo non valida.'
			},
			{
				key: 'rules',
				condition: () =>
					!payload.days || !payload.rules || payload.days.length == 0 || payload.rules.length === 0,
				error: 'Nessun orario specificato.'
			}
		],
		[
			{
				key: 'classes-length',
				condition: () => payload.locations && payload.locations.some((l) => l.classes.length === 0),
				error: 'Ogni sede deve avere almeno una classe.'
			},
			{
				key: 'classes',
				condition: () => {
					if (!payload.locations || !payload.classes) return true;

					let master: string[] = [];
					payload.locations.forEach((l) => (master = master.concat(l.classes)));

					return JSON.stringify(master.sort()) !== JSON.stringify(payload.classes.sort());
				},
				error: 'Il numero di classi per sede non è uguale a quello totale'
			}
		],
		[
			{
				key: 'not-chosen',
				condition: () => !extra.selectedAuth,
				error: 'Nessuna opzione selezionata.'
			},
			{
				key: 'domain',
				condition: () =>
					payload.domain &&
					(payload.domain.length < 3 ||
						payload.domain.length > 40 ||
						!payload.domain.match(/([\w-]+\.)+[\w-]{2,4}$/g)),
				error: 'Dominio non valido.'
			}
		]
	];

	const checkErrors = () => {
		if (!errorChecks[stage]) return;

		errors = {};
		let condition;
		errorChecks[stage].forEach((check) => {
			condition = check.condition();
			if (condition === true) errors[check.key] = check.error;
		});
		errorsStore.set(errors);

		if (process.env.NODE_ENV === 'development') {
			console.log('Payload', payload, 'Errors', errors);
		}
	};

	const nextStage = () => {
		checkErrors();
		if (Object.keys(errors).length > 0) return;
		stage++;
	};

	const prevStage = () => {
		stage--;
		extraStore.update((e) => ({
			...e,
			canProceed: true
		}));
	};
</script>

<div class="topbar">
	<div class="progress-wrapper">
		<div class="progress-bar" style="width: {(stage * 100) / stages.length}%" />
	</div>
	<p class="desc">
		Ti mancano {stages.length - stage - 1} passi alla completamento della configurazione
	</p>
</div>
<div class="wrapper">
	<form action="/api/process-payment" method="POST" class="form-box cartoonize cart-accent">
		{#if stage > 0}
			<div class="form-back" on:click={prevStage} on:keypress={prevStage}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="w-7 h-7"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
					/>
				</svg>
			</div>
		{/if}
		<svelte:component this={stages[stage]} />
		{#if Object.keys(errors).length > 0}
			<ul>
				{#each Object.values(errors) as error}
					<li>{error}</li>
				{/each}
			</ul>
		{/if}
		{#if stage != stages.length - 1}
			<input
				on:click|preventDefault={nextStage}
				type="submit"
				class="btn btn-primary"
				class:btn-disabled={!extra.canProceed}
				value="Prosegui"
			/>
		{:else}
			<input
				type="submit"
				class="btn btn-primary"
				class:opacity-50={!extra.canProceed}
				class:cursor-not-allowed={!extra.canProceed}
				value="Invia"
			/>
			<input id="payload" name="payload" type="hidden" value={JSON.stringify(payload)} />
		{/if}
	</form>
</div>

<style lang="postcss">
	.wrapper {
		@apply flex justify-center items-center h-full;
	}

	.form-box {
		@apply relative grid grid-cols-1 max-w-[500px] w-full items-center gap-3 bg-base-200;
		@apply rounded-lg px-5 py-6 mx-4;
	}

	.form-back {
		@apply absolute top-6 left-4 text-gray-500 cursor-pointer;
	}

	ul {
		@apply text-red-500 px-8;
		list-style-type: disc;
	}

	:global(.obligatory-field) {
		@apply text-red-500;
	}

	.topbar {
		@apply absolute inset-x-0 top-0;

		.desc {
			@apply ml-4 mt-2;
		}

		.progress-wrapper {
			@apply relative h-2 bg-accent;

			.progress-bar {
				@apply absolute inset-y-0 left-0 bg-secondary transition-all border-r-4 border-primary-focus;
			}
		}
	}
</style>
