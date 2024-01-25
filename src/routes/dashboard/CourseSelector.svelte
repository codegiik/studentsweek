<script lang="ts">
	import Fa from 'svelte-fa';
	import Fuzzy from 'svelte-fuzzy';
	import { faXmark, faBackward, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import { closeModal } from 'svelte-modals';
	import { courseStore } from './courses';
	import { currentUser, type SpecialDocumentRef } from '$lib/user';
	import { avaliable, collideRules } from '$lib/utils';
	import EventCard from './EventCard.svelte';
	import type { Course } from '$lib/interfaces';
	import CourseCard from './CourseCard.svelte';
	import HourPicker from '$lib/components/HourPicker.svelte';
	import toast from 'svelte-french-toast';

	const { user, profile } = currentUser;

	let loading = true;
	let avaliableCourses: SpecialDocumentRef<Course>[] = [];
	let query = '';

	let selected: SpecialDocumentRef<Course> | null = null;

	let result: any[] = [];

	courseStore.courses.subscribe((courses) => {
		const unsubscribe = profile.subscribe((value) => {
			loading = true;
			if (!courses || !value) return;
			avaliableCourses = courses.filter((course) =>
				avaliable(collideRules(value.rules, course.rules))
			);
			loading = false;
		});

		return unsubscribe;
	});

	const straightOutValue = (value: { text: string }[] | string | undefined): string => {
		if (Array.isArray(value)) return value.reduce((prev, curr) => prev + curr.text, '');
		if (value) return value;
		return '';
	};

	const straightOutCourse = (course: SpecialDocumentRef<Course>): SpecialDocumentRef<Course> => ({
		...course,
		name: straightOutValue(course?.name),
		desc: straightOutValue(course?.desc),
		emoji: straightOutValue(course?.emoji)
	});

	const handleCourseSubscription = (d: number, h: [number, number]) => {
		if (!selected) return;

		closeModal();
		toast.promise(
			new Promise((resolve, reject) =>
				$user?.getIdToken().then((token) => {
					fetch('/api/subscribe', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							c: selected?._.id,
							d,
							h,
							at: token
						})
					})
						.then((res) => res.json())
						.then((res) => {
							if (res.message != 'Success') reject(res.message);
							else {
								resolve(res.message);
								if (currentUser.rawProfile != 'missing' && currentUser.rawProfile)
									currentUser.rawProfile = {
										...currentUser.rawProfile,
										rules: res.rules
									};
							}
						})
						.catch((e) => reject(e));
				})
			),
			{
				loading: 'Iscrizione in corso...',
				success: 'Iscrizione avvenuta con successo!',
				error: "Errore durante l'iscrizione"
			}
		);
	};

	export let isOpen: boolean;
</script>

<Fuzzy {query} data={avaliableCourses} options={{ keys: ['name', 'emoji', 'desc'] }} bind:result />
{#if isOpen}
	<div role="dialog" class="modal-content">
		<div class="modal-close" on:click={closeModal} on:keypress={closeModal}>
			<Fa icon={faXmark} />
		</div>
		{#if selected}
			<h2 class="title-icons">
				<span class="back" on:click={() => (selected = null)} on:keypress={() => (selected = null)}>
					<Fa icon={faArrowLeft} size="xs" />
				</span>
				{selected.name}
			</h2>
			<p class="desc">
				{selected.desc}
			</p>
			<div class="divider" />

			<HourPicker
				callback={handleCourseSubscription}
				rules={collideRules($profile?.rules, selected?.rules)}
				unit={selected.unit ?? 1}
			/>
		{:else}
			<h2>Seleziona un Corso</h2>
			<p class="desc">
				Scegli uno dei corsi dalla lista sottostante. Segui la procedura per effettuare
				l'iscrizione.
			</p>
			<div class="divider" />
			<input
				type="text"
				bind:value={query}
				placeholder="Cerca un corso"
				class="input input-bordered w-full"
			/>
			{#if loading}
				<div class="loading">
					<EventCard loading={true} event={undefined} />
				</div>
			{:else if avaliableCourses}
				<div class="list">
					{#if query != ''}
						{#each result as course}
							<CourseCard
								course={straightOutCourse(course)}
								on:click={() => {
									selected = straightOutCourse(course);
								}}
							/>
						{/each}
					{:else}
						{#each avaliableCourses as course}
							<CourseCard
								{course}
								on:click={() => {
									selected = course;
								}}
							/>
						{/each}
					{/if}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style lang="postcss">
	.back {
		@apply flex items-center justify-center cursor-pointer;
	}

	.list {
		@apply grid grid-cols-1 gap-1;
	}
</style>
