<script lang="ts">
	import { firestore } from '$lib/firebase';

	import type { Course, CourseSubscription } from '$lib/interfaces';
	import currentUser from '$lib/user';
	import { getDayName, Timecode } from '$lib/utils';
	import { faTrash } from '@fortawesome/free-solid-svg-icons';
	import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import toast from 'svelte-french-toast';

	export let isOpen: boolean;

	export let course: Course;

	const { school, user } = currentUser;

	interface CustomCourseSubscription extends CourseSubscription {
		id: string;
	}

	let subscriptions: Record<string, CustomCourseSubscription[]> = {};

	const fetchSubscriptions = async () => {
		const subsSnap = await getDocs(
			query(
				collection(firestore, 'subs'),
				where('course', '==', doc(firestore, 'courses', course.id))
			)
		);

		(
			await Promise.all(
				subsSnap.docs.map(async (doc) => {
					const data = doc.data();

					const userSnap = await getDoc(data.user);

					return {
						...data,
						id: doc.id,
						user: userSnap.data()
					} as CustomCourseSubscription;
				})
			)
		)
			.sort((a, b) => Timecode.hours(a.timecode)[0] - Timecode.hours(b.timecode)[0])
			.forEach((sub) => {
				const day = Timecode.day(sub.timecode);
				if (!subscriptions[day]) subscriptions[day] = [];
				subscriptions[day].push(sub);
			});
	};

	const unsub = async (id: string) => {
		const at = await $user?.getIdToken();
		return fetch('/api/unsubscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				s: id,
				at
			})
		}).then((r) => r.json());
	};

	$: console.log('subs', subscriptions);

	const handleUnsubscription = (id: string) => {
		unsub(id)
			.then((r) => {
				if (r?.success) {
					toast.success('Iscrizione Rimossa');

					setTimeout(() => {
						subscriptions = {};
						fetchSubscriptions();
					}, 1000);
				} else {
					toast.error('Errore');
				}
			})
			.catch((e) => {
				console.error(e);
			});
	};

	onMount(() => {
		fetchSubscriptions();
	});
</script>

{#if isOpen}
	<div class="modal-content">
		<h2>Iscrizioni</h2>
		<p class="desc">Ecco le iscrizioni al corso {course?.name}</p>
		<div class="divider" />
		{#if subscriptions && $school}
			{#each Object.keys(subscriptions) as day, i}
				<h4>{getDayName($school.days[Number(day)])}</h4>
				<div class="subs">
					{#each subscriptions[day] as sub}
						<div class="sub">
							<p>{sub.user.email} | {sub?.user?.class ?? 'Non definita'}</p>
							<span>
								{Timecode.time(sub.timecode, $school.timeUnit, $school.startTime)}

								<span class="btn btn-error btn-icons" on:click={() => handleUnsubscription(sub.id)}>
									<Fa icon={faTrash} />
								</span>
							</span>
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
{/if}

<style lang="postcss">
	.modal-content {
		.sub {
			@apply flex justify-between items-center w-full my-2;

			span {
				@apply font-light;
			}

			p {
				@apply font-title font-semibold;
			}
		}
	}
</style>
