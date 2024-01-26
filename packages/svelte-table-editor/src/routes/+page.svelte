<script lang="ts">
	import * as components from '$lib';
	import type { TableEditorOptions, TableEditorSchema } from '$lib/interfaces';
	import type { SvelteComponentDev } from 'svelte/internal';
	import { writable } from 'svelte/store';

	const schema: TableEditorSchema = {
		id: {
			name: 'ID',
			sort: true,
			editable: false
		},
		name: {
			name: 'Nome',
			sort: true
		},
		surname: {
			name: 'Cognome',
			sort: true
		},
		test: {
			name: 'Test',
			sort: true,
			type: 'select',
			selectOptions: {
				a: 'A',
				b: 'B',
				c: 'C'
			}
		}
	};
	const options: TableEditorOptions = {
		paging: {
			pageSize: 4,
			pageThreshold: 3,
			callback: (page: number) => {
				console.log('page', page);
			}
		},
		callbacks: {
			editBulk: (indeces, changes) => console.log(indeces, changes),
			edit: async (index: number, el) => console.log(index, $data[index], el),
			create: (el) => console.log(el),
			timeout: 5000
		},
		search: {
			searchKey: 'name',
			searchThreshold: 1,
			callback: (search) => console.log('search', search)
		}
	};
	let data = writable([
		{
			id: 1,
			name: 'test',
			test: 'a'
		},

		{
			id: 2,
			name: 'test2'
		},
		{
			id: 3,
			name: 'test3'
		},
		{
			id: 4,
			name: 'test3'
		},
		{
			id: 5,
			name: 'test3'
		},
		{
			id: 6,
			name: 'test3'
		}
	]);

	const testing: {
		component: typeof SvelteComponentDev;
		props?: any;
	}[] = [
		{
			component: components.TableEditor,
			props: {
				data,
				schema,
				options
			}
		}
	];
</script>

{#each testing as { component, props = { } }}
	<svelte:component this={component} {...props} />
{/each}
