<script lang="ts">
	import Logo from '../Logo.svelte';
	import NavbarLink from './NavbarLink.svelte';

	const LINKS = [
		{
			name: 'Home',
			href: '/',
			class: 'hidden sm:block'
		},
		{
			name: 'Iscrivi la Scuola',
			href: '/register',
			class: 'btn btn-accent opacity-80'
		},
		{
			name: 'Login',
			href: '/login',
			class: 'btn btn-secondary'
		}
	];
</script>

<div class="navbar">
	<Logo class="navbar-logo" hideOnMobile={true} />
	<nav class="navbar-nav-primary">
		{#each LINKS as link}
			<NavbarLink href={link.href} class={link.class}>
				{link.name}
			</NavbarLink>
		{/each}
	</nav>
</div>

<style lang="postcss">
	.navbar {
		@apply flex items-center justify-center mx-auto pt-5;
		@apply w-[90%] max-w-7xl;

		.navbar-nav-primary {
			@apply ml-auto gap-4 flex;
		}
	}
</style>
