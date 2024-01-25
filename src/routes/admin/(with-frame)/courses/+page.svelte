<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$lib/user';
	import type { FirebaseError } from 'firebase/app';
	import { docToData, getDocs, TimetableRule } from '$lib/utils';
	import {
		type TableEditorSchema,
		type Course,
		type TableEditorOptions,
		FirebaseCallbacksHandler
	} from '$lib/interfaces';
	import TableEditor from '$lib/components/admin/TableEditor/TableEditor.svelte';
	import {
		limit,
		orderBy,
		QueryDocumentSnapshot,
		startAfter,
		Timestamp,
		where,
		type DocumentData
	} from 'firebase/firestore';
	import CourseEditor from './CourseEditor.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ShowSubsBtn from './ShowSubBtn.svelte';

	const { school } = currentUser;

	export let data: any;
	const defaultRenders = ['name', 'emoji', 'limit', 'showsubs'];
	let initiallyRenderedKeys = data.columns ? data.columns.split(',') : defaultRenders;
	if (initiallyRenderedKeys.length < 3) initiallyRenderedKeys = defaultRenders;

	let loading = true;
	let courses: Course[] = [];
	let error: FirebaseError | undefined;
	let coursesDocs: QueryDocumentSnapshot<DocumentData>[];

	onMount(() => {
		const unsubscribe = school.subscribe(async (s) => {
			if (!s) return;

			const queryConstraints = [where('school', '==', s._.ref)];
			if (options.paging?.pageSize) queryConstraints.push(limit(options.paging.pageSize * 2));
			await getDocs<Course>('courses', {
				queryConstraints,
				returnDocs: true
			})
				.then((c) => {
					coursesDocs = c as QueryDocumentSnapshot<DocumentData>[];
					courses = c.map((snapshot) => docToData(snapshot));
					loading = false;
				})
				.catch((err) => (error = err));

			options.callbacksHandler = new FirebaseCallbacksHandler<Course>({
				data: courses,
				path: 'courses',
				identifierKey: 'id',
				setData: (newData) => (courses = newData)
			});
		});

		return () => {
			unsubscribe();
		};
	});

	const schema: TableEditorSchema<Course> = {
		id: {
			name: 'ID',
			type: 'string',
			editable: false,
			sort: true
		},
		emoji: {
			name: 'Emoji',
			type: 'string',
			inputOptions: {
				minLength: 1,
				maxLength: 1
			}
		},
		name: {
			name: 'Nome',
			type: 'string',
			sort: true
		},
		limit: {
			name: 'Limite',
			type: 'number',
			sort: true,
			inputOptions: {
				min: 2
			}
		},
		room: {
			name: 'Stanza',
			type: 'string'
		},
		rules: {
			name: 'Regole',
			default: []
		},
		showsubs: {
			name: 'Mostra iscritti',
			render: {
				table: ShowSubsBtn
			}
		}
		// org: {
		// 	name: 'Organizzatori',
		// 	type: 'multi',
		// 	sort: true,
		// 	multiOptions: {
		// 		data: ['Giuseppe', 'Antonio'],
		// 		displayMax: 1
		// 	}
		// }
	};

	const options: TableEditorOptions = {
		save: {
			type: 'auto',
			timeout: 3000
		},
		renderedHandler: {
			initiallyRenderedKeys
		},
		search: {
			timeout: 2000,
			searchKey: 'name'
		},
		paging: {
			type: 'incremental',
			pageSize: 50,
			fetchCallback: async () => {
				const lastEl = coursesDocs[coursesDocs.length - 1];
				const constraints = [orderBy('name'), startAfter(lastEl)];

				if (options.paging) constraints.push(limit(options.paging.pageSize));

				return getDocs<Course>('courses', {
					returnDocs: true,
					queryConstraints: constraints
				});
			},
			setData: ({ newData }: { newData?: QueryDocumentSnapshot<DocumentData>[] }) => {
				if (newData) {
					coursesDocs = [...coursesDocs, ...newData];
					newData.forEach((snapshot) => courses.push(docToData(snapshot)));
				}
			}
		},
		buttons: {
			delete: {
				component: ConfirmModal,
				componentProps: {
					message: 'Sei sicuro di voler eliminare questo corso?'
				}
			},
			edit: {
				component: CourseEditor,
				componentProps: {
					onSubmit: (course: Course) => {
						const { id, ...data } = course;
						options?.callbacksHandler?.editEntity(id, data);
					}
				}
			},
			create: {
				component: CourseEditor,
				componentProps: {
					onSubmit: (course: Course) => {
						if (!$school) return;
						course.school = $school._.ref;
						options?.callbacksHandler?.createEntity(course);
					}
				}
			}
		}
	};
</script>

<h1>Corsi</h1>
<div class="divider" />

{#if loading}
	<p>Loading...</p>
{:else if error}
	<p class="text-red-500">{error.message}...</p>
{:else}
	<TableEditor {schema} {options} data={courses} class="courses-table" />
{/if}

<style lang="postcss">
</style>
