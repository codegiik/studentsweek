<script lang="ts">
	import '$styles/global.css';
	import { remoteConfig } from '$lib/firebase';
	import { fetchAndActivate, type RemoteConfig } from 'firebase/remote-config';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-french-toast';
	import { Modals, closeModal } from 'svelte-modals';
	import WorkInProgress from '$lib/components/WorkInProgress.svelte';

	export let data: {
		under_maintenance?: boolean;
	};

	onMount(() => {
		fetchAndActivate(remoteConfig as RemoteConfig)
			.then((...data) => console.log('Remote Config Activated!'))
			.catch((e) => console.log('err', e));
	});
</script>

{#if data?.under_maintenance}
	<WorkInProgress />
{:else}
	<head>
		<title>StudentsWeek - Il portale per la settimana dello studente</title>
	</head>
	<Toaster />
	<Modals>
		<div
			slot="backdrop"
			class="backdrop"
			on:click={closeModal}
			on:keydown={({ key }) => (key === 'Escape' ? closeModal() : null)}
		/>
	</Modals>
	<slot />
{/if}
<svelte:window on:keydown={({ key }) => (key === 'Escape' ? closeModal() : null)} />

<style>
	.backdrop {
		position: fixed;
		z-index: 99;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}
</style>
