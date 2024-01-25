<script lang="ts">
	import { page } from '$app/stores';

	import Logo from '$lib/components/Logo.svelte';
	import { currentUser } from '$lib/user';
	import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons/faRightFromBracket';
	import Fa from 'svelte-fa';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	const { propic } = currentUser;

	export let links: {
		href: string;
		name: string;
		icon: any;
		collapse?: boolean;
	}[] = [];

	const handleLogout = () => {
		currentUser.logout().then(() => {
			goto('/login');
			toast.success('Sei uscito dal tuo account');
		});
	};
</script>

<div class="top-bar-wrapper">
	<div class="top-bar">
		<Logo iconBackground={false} small hideOnMobile />
		<nav class="top-bar-nav">
			{#each links as link}
				<a
					href={link.href}
					class="btn btn-icons btn-slim"
					class:btn-ghost={$page.url.pathname != link.href}
					class:still={$page.url.pathname == link.href}
					class:btn-primary={$page.url.pathname == link.href}
					class:btn-icons-mobile={typeof link?.collapse != 'undefined' ? link.collapse : true}
				>
					<Fa icon={link.icon} />
					<span>
						{link.name}
					</span>
				</a>
			{/each}
		</nav>

		<img src={$propic} alt="Avatar" class="top-bar-propic" />
		<a
			class="btn btn-error btn-icons btn-icons-mobile btn-slim"
			href="/logout"
			on:click|preventDefault={handleLogout}
		>
			<Fa icon={faRightFromBracket} />
			<span>Esci</span>
		</a>
	</div>
</div>
<div class="placeholder" />

<style lang="postcss">
	.top-bar-wrapper {
		@apply pt-2 pb-4 md:pt-4 bg-base-200 md:pb-2 px-4;
		@apply border-t-2 md:border-b-2 md:border-t-0 border-accent;
		@apply fixed bottom-0 md:bottom-auto md:top-0 inset-x-0;

		.top-bar {
			@apply w-full max-w-7xl flex items-center mx-auto gap-2;

			.top-bar-nav {
				@apply flex gap-2 ml-5 mr-auto;
			}

			.top-bar-propic {
				@apply w-10 h-10 mask mask-squircle;
			}
		}
	}

	.placeholder {
		@apply w-full h-20 hidden md:block;
	}
</style>
