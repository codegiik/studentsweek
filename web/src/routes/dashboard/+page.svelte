<script lang="ts">
	import { getConfigValue } from '$lib/firebase';
	import { openModal } from 'svelte-modals';
	import { currentUser } from '$lib/user';
	import { onMount } from 'svelte';
	import CourseSelector from './CourseSelector.svelte';
	import SubscriptionCard from './SubscriptionCard.svelte';
	import { getDayName } from '$lib/utils';

	const { school, user, subscriptions, profile, subscriptionsByDay } = currentUser;

	const isUserStillAvaliable = ($profileStore: any) => {
		if (!$profileStore) return false;
		return $profileStore?.rules?.reduce((value: number, prec: number) => value + prec) !== 0;
	};

	let dash_desc: string;

	onMount(async () => {
		dash_desc = (await getConfigValue('dash_desc')).asString();
	});

	const handleNewSubscription = () => {
		openModal(CourseSelector);
	};
</script>

<h1>
	👋
	{$user?.displayName ? `Hey ${$user.displayName}` : 'Bentornato'}
</h1>
{#if $school}
	{#if $school?.introDescription}
		<p class="desc">{$school.introDescription}</p>
	{/if}
	{#if isUserStillAvaliable($profile)}
		<div
			on:click={handleNewSubscription}
			class="subscribe btn btn-primary btn-icons w-full my-2"
			on:keypress={({ key }) => (key == 'N' ? handleNewSubscription() : null)}
		>
			Iscriviti ad un corso
		</div>
		<div class="divider">LE TUE ISCRIZIONI</div>
	{/if}
	<main class="subs">
		{#if Object.keys($subscriptionsByDay).length === 0}
			<div class="w-full oh-no">
				<img src="/images/oh-no-face.svg" alt="Oh No!" />
				<h4>Oh No!</h4>
				<p class="desc">
					Attualmente non sei iscritto ancora a nessun corso. Clicca il pulsante soprastante per
					eseguire la tua prima iscrizione.
				</p>
			</div>
		{/if}
		{#each Object.keys($subscriptionsByDay) as day}
			<h4>{$school ? getDayName($school.days[Number(day)]) : null}</h4>
			{#each $subscriptionsByDay[Number(day)] || [] as subscription}
				{#key subscription.timecode}
					<SubscriptionCard {subscription} />
				{/key}
			{/each}
		{/each}
	</main>
{/if}

<style lang="postcss">
	.desc {
		@apply font-light text-neutral text-opacity-75;
	}

	.subs {
		@apply grid grid-cols-1 gap-2 mb-10;
	}

	h4 {
		@apply mt-2;
	}

	.oh-no {
		@apply flex flex-col justify-center items-center w-full my-10 opacity-50;

		img {
			@apply h-[200px] my-2 grayscale;
		}

		h4 {
			@apply my-3;
		}

		p {
			@apply min-w-[250px] w-1/2 text-center;
		}
	}
</style>
