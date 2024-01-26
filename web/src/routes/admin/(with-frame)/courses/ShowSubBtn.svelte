<script lang="ts">
	import { faUsers } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { openModal } from 'svelte-modals';
	import CourseSubs from './CourseSubs.svelte';

	export let value: any = {};

	const handleShowSubs = () => {
		if (!value || !value.id) return;

		openModal(CourseSubs, {
			course: value
		});
	};
</script>

<button class="btn btn-primary btn-icons" on:click={handleShowSubs}>
	<Fa icon={faUsers} />
	Iscrizioni
</button>
