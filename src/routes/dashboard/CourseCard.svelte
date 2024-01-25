<script lang="ts">
	import type { Course } from '$lib/interfaces';
	import type { SpecialDocumentRef } from '$lib/user';

	import EventCard from './EventCard.svelte';

	export let course: SpecialDocumentRef<Course> | null;
</script>

{#if course}
	<EventCard
		loading={!course}
		event={{
			id: course._.id,
			name: course?.name ?? 'Corso Invalido',
			emoji: course?.emoji ?? '🤔',
			description: course?.desc
		}}
		on:click
		on:keypress
	/>
{/if}
