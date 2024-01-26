<script lang="ts">
	import { onMount } from 'svelte';
	import { firestore } from '$lib/firebase';
	import type { FirebaseError } from 'firebase/app';
	import { deleteDoc, docToData, getDocs } from '$lib/utils';
	import {
		type TableEditorSchema,
		type TableEditorOptions,
		type User,
		FirebaseCallbacksHandler
	} from '$lib/interfaces';
	import TableEditor from '$lib/components/admin/TableEditor/TableEditor.svelte';
	import {
		doc,
		limit,
		orderBy,
		QueryDocumentSnapshot,
		setDoc,
		startAfter,
		where,
		type DocumentData
	} from 'firebase/firestore';
	import { currentUser } from '$lib/user';

	export let data: any;
	const defaultRenders: string[] = ['name', 'class', 'email'];
	let initiallyRenderedKeys = data.columns ? data.columns.split(',') : defaultRenders;
	if (initiallyRenderedKeys.length < 3) initiallyRenderedKeys = defaultRenders;

	const { school } = currentUser;

	let users: User[];
	let error: FirebaseError | undefined;
	let usersDocs: QueryDocumentSnapshot<DocumentData>[];

	onMount(async () => {
		school.subscribe(async (value) => {
			if (!value) return;

			if (options && !value.domain) options.buttons = { ...options.buttons, create: {} };

			const queryConstraints = [where('school', '==', value._.ref)];
			if (options.paging?.pageSize) queryConstraints.push(limit(options.paging.pageSize * 2));

			await getDocs<User>('users', {
				queryConstraints,
				returnDocs: true
			})
				.then((u) => {
					usersDocs = u as QueryDocumentSnapshot<DocumentData>[];
					users = u.map((snapshot) => docToData(snapshot));
				})
				.catch((err) => (error = err));

			options.callbacksHandler = new FirebaseCallbacksHandler<User>({
				data: users,
				path: 'users',
				identifierKey: 'id',
				setData: (newData) => (users = newData)
			});
		});
	});

	const schema: TableEditorSchema<User> = {
		email: {
			name: 'Email',
			type: 'string',
			sort: true
		},
		role: {
			name: 'Ruolo',
			type: 'enum',
			enumOptions: {
				admin: 'Amministratore',
				student: 'Studente'
			}
		},
		class: {
			name: 'Classe',
			type: 'string',
			sort: true
		},
		rules: {
			name: 'Regole',
			type: 'multi',
			multiOptions: {
				max: 7,
				data: [1, 2, 3, 4, 5, 6, 7]
			}
		},
		loc: {
			name: 'Sede',
			type: 'enum',
			enumOptions: {}
		},
		createdAt: {
			name: 'Data Creazione',
			type: 'string',
			sort: true,
			editable: false
		}
	};

	const callbacks = {
		deleteUser: async (element: User) => {
			users = users.filter((c) => c.id !== element.id);
			await deleteDoc('users', element.id);
			return true;
		},
		createUser: async (newUser: User) => {
			alert(newUser);
		},
		editUser: async (id: string, newData: User) => {
			await setDoc(doc(firestore, 'users', id), newData, { merge: true });
		},
		editUsers: async (queue: Record<string, User>) => {
			Object.entries(queue).forEach(async ([id, user]) => await callbacks.editUser(id, user));
		}
	};

	const options: TableEditorOptions = {
		updateIdentifierKey: 'id',
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
			pageSize: 20,
			fetchCallback: async () => {
				const lastEl = usersDocs[usersDocs.length - 1];
				const constraints = [orderBy('name'), startAfter(lastEl)];

				if (options.paging) constraints.push(limit(options.paging.pageSize));

				return getDocs<User>('users', {
					returnDocs: true,
					queryConstraints: constraints
				});
			},
			setData: ({ newData }: { newData?: QueryDocumentSnapshot<DocumentData>[] }) => {
				if (newData) {
					usersDocs = [...usersDocs, ...newData];
					users = [...users, ...newData.map((snapshot) => docToData(snapshot))] as User[];
				}
			}
		},
		buttons: {
			delete: {
				identifierKey: 'name'
			},
			edit: {}
		}
	};
</script>

<h1>Studenti</h1>
<div class="divider" />
{#if users === undefined}
	<p>Loading...</p>
{:else if error}
	<p class="text-red-500">{error.message}...</p>
{:else}
	<TableEditor {schema} {options} data={users} class="users-table" />
{/if}

<style lang="postcss">
</style>
