<script lang="ts">
	import { faGauge } from '@fortawesome/free-solid-svg-icons/faGauge';
	import TopBar from './TopBar.svelte';
	import { currentUser } from '$lib/user';
	import { courseStore } from './courses';
	import { onMount } from 'svelte';

	onMount(() => {
		const unsub = currentUser.school.subscribe((value) => {
			if (value) courseStore.school.set(value._.ref);
		});

		const unsub2 = currentUser.location.subscribe((value) => {
			if (value) courseStore.location.set(value._.id);
		});

		return () => {
			unsub();
			unsub2();
		};
	});

	const TOPBAR_LINKS = [
		{
			href: '/dashboard',
			name: 'Cruscotto',
			icon: faGauge
		}
	];
</script>

<TopBar links={TOPBAR_LINKS} />
<div class="content">
	<slot />
</div>

<style lang="postcss">
	.content {
		@apply w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-10;
	}
</style>
