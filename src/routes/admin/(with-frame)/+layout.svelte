<script lang="ts">
	import Fa from 'svelte-fa';
	import '$styles/global.css';
	import { currentUser } from '$lib/user';
	import { env } from '$env/dynamic/public';
	import Collapse from '$lib/components/Collapse.svelte';
	import {
		faBook,
		faDoorClosed,
		faDoorOpen,
		faHome,
		faUsers
	} from '@fortawesome/free-solid-svg-icons';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { getDefaultPropic } from '$lib/utils';

	const { profile, school } = currentUser;

	const nav = {
		Generali: [
			{
				name: 'Home',
				icon: faHome,
				href: '/admin'
			}
		],
		Studenti: [
			{
				name: 'Lista Studenti',
				icon: faUsers,
				href: '/admin/users'
			}
		],
		Corsi: [
			{
				name: 'Lista Corsi',
				icon: faBook,
				href: '/admin/courses'
			}
		]
	};

	const handleLogout = () => {
		currentUser.logout().then(() => {
			goto('/login');
			toast.success('Sei uscito dal tuo account');
		});
	};
</script>

<div class="wrapper">
	<div class="admin-sidebar">
		<h2 class="logo">StudentsWeek</h2>
		<img src="/images/logo_long.svg" alt="======>" class="pencil" />
		<h4>Pannello Admin</h4>
		<nav class="admin-nav">
			{#each Object.entries(nav) as [title, value]}
				<Collapse class="admin-nav-collapse" open={true}>
					<p slot="title">{title}</p>

					<div class="display-content admin-nav-sublinks" slot="content">
						{#each value as link}
							<a href={link.href} class="admin-nav-sublink">
								{#if link.icon}
									<Fa icon={link.icon} />
								{/if}
								<span>
									{link.name}
								</span>
							</a>
						{/each}
					</div>
				</Collapse>
			{/each}
		</nav>
		{#if $profile && $school}
			<div class="admin-user">
				<img class="admin-user-avatar" src={$school?.logo ?? getDefaultPropic($school?.name)} />
				<div class="admin-user-info">
					<span class="admin-user-school">{$school.name}</span>
					<span class="admin-user-email">{$profile.email}</span>
				</div>
			</div>
			<button class="btn btn-ghost btn-icons" on:click|preventDefault={handleLogout}
				>Logout
				<Fa icon={faDoorOpen} />
			</button>
			<hr class="admin-user-dash" />
		{/if}
	</div>
	<div class="admin-content">
		<slot />
	</div>
</div>

<style lang="postcss">
	.wrapper {
		@apply h-full flex;
	}

	.admin-sidebar {
		@apply px-4 pb-4 pt-6 max-w-[15vw] min-w-[300px] flex flex-col;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0) 57.39%, rgba(0, 0, 0, 0.2) 91.57%), #058000;

		.logo {
			@apply text-white font-semibold;
		}

		.pencil {
			@apply w-44 h-auto;
		}

		.admin-nav {
			@apply flex flex-col rounded-lg overflow-hidden;

			:global(.admin-nav-collapse) {
				@apply text-white border-t-2 border-green-900;

				&:first-child {
					@apply border-t-0;
				}

				:global(.sw-collapse-title) {
					@apply font-semibold text-lg font-title bg-neutral bg-opacity-60 min-h-[1rem] p-3;
				}

				:global(.sw-collapse-content) {
					@apply font-semibold text-lg font-title bg-neutral bg-opacity-40;
				}
			}

			.admin-nav-sublinks {
				@apply p-3;

				.admin-nav-sublink {
					@apply flex items-center w-full gap-2;

					span {
						@apply flex-1;
					}
				}
			}
		}

		h4 {
			@apply text-white text-sm mt-4 text-opacity-75;
		}

		.admin-user {
			@apply mt-auto flex gap-2 mb-4;

			.admin-user-avatar {
				@apply w-12 h-12 rounded-full object-cover mr-1;
			}

			.admin-user-info {
				@apply flex flex-col justify-center gap-1;

				.admin-user-school,
				.admin-user-email {
					@apply text-white tracking-wide;
				}

				.admin-user-school {
					@apply font-title;
				}

				.admin-user-email {
					@apply text-xs font-light;
				}
			}
		}

		.admin-user-dash {
			@apply border-2 border-dashed -ml-4 opacity-50 mt-4;
		}
	}

	.admin-content {
		@apply px-9 py-6 flex-1;
	}
</style>
