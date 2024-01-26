<script lang="ts" context="module">
	export interface Event {
		id: string;
		name: string;
		emoji?: string;
		description?: string;
		extra?: string;
		organizer?: Profile;
	}
</script>

<script lang="ts">
	import type { Profile } from '$lib/interfaces';
	import { stringToHsl } from '$lib/utils';

	export let loading = false;
	export let event: Event | undefined;
</script>

<div
	class="event-card"
	style={event
		? `--c-cd: ${stringToHsl(event.name, 70)}; --c-cs: ${stringToHsl(
				event.name
		  )}; --c-cdd: ${stringToHsl(event.name, 60)};`
		: ''}
	class:shimmer-wrapper={loading}
	on:click
	on:keypress
>
	{#if loading}
		<div class="shimmer" />
	{:else if event}
		<div class="event-card-info">
			<h3>{event.name}</h3>
			{#if event.description}
				<p class="desc">{event.description}</p>
			{/if}
			{#if event.extra}
				<p class="extra">{event.extra}</p>
			{/if}
		</div>

		<div class="event-card-emoji">
			{event.emoji}
		</div>
	{/if}
</div>

<style lang="postcss">
	.event-card {
		@apply w-full border-4 border-b-0 rounded-lg min-h-[150px] bg-base-200 my-2;
		@apply grid grid-cols-3 grid-rows-1 cursor-pointer;
		box-shadow: 0 8px 0 var(--c-cdd);
		border-color: var(--c-cd);
		transition: all 0.2s cubic-bezier(0.86, 0, 0.07, 1);

		&.shimmer-wrapper {
			@apply border-accent relative;
			box-shadow: 0 8px 0 hsl(var(--af));

			&:hover {
				transform: inherit;
				box-shadow: 0 8px 0 hsl(var(--af));
			}

			.shimmer {
				@apply inset-0 absolute;
			}
		}

		&:hover {
			transform: translateY(4px);
			box-shadow: 0 4px 0 var(--c-cdd);
		}

		.event-card-info {
			@apply col-span-2 flex justify-center flex-col pl-6 pr-4 py-6;

			h3 {
				@apply truncate w-full;
			}

			.desc {
				@apply font-title text-neutral text-opacity-75 w-full;
			}

			.extra {
				@apply mt-2 font-light opacity-75 tracking-wide w-full;
			}
		}

		.event-card-emoji {
			@apply ml-auto w-full max-w-[300px] text-7xl md:text-8xl items-center justify-center flex;
			background: linear-gradient(90deg, var(--c-cd) 0%, var(--c-cs) 100%);
			border-radius: 0 4px 4px 0;
		}
	}
</style>
