<script lang="ts">
	import type { CourseSubscription } from '$lib/interfaces';
	import { currentUser } from '$lib/user';
	import { Timecode } from '$lib/utils';
	import { courseStore } from './courses';

	import EventCard from './EventCard.svelte';

	const { school } = currentUser;

	export let subscription: CourseSubscription | null;

	const course = courseStore.courseByPath(subscription?.course.path);

	const subTimecode = new Timecode(subscription?.timecode ?? '0:0,0');
</script>

{#if subscription && course}
	<EventCard
		loading={!$course}
		event={{
			description: $course?.desc,
			id: $course?._.id ?? '#',
			name: $course?.name ?? 'Corso Invalido',
			emoji: $course?.emoji ?? '🤔',
			extra: `${$course?.room ?? 'Sala sconosciuta'} | ${subTimecode.time(
				$school?.timeUnit ?? 60,
				$school?.startTime
			)}`
		}}
	/>
{/if}
