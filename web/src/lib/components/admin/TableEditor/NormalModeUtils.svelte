<script lang="ts">
	import { onMount } from 'svelte';
	import Collapse from '$lib/components/Collapse.svelte';
	import SearchBox from './tools/SearchBox.svelte';
	import type { TableEditorSchema } from '$lib/interfaces';
	import { addQueryParams, getQueryParams } from '$lib/utils';

	export let schema: TableEditorSchema;
	export let search:
		| {
				timeout?: number;
				searchKey: string;
				setFilterConditions: (_: ((el: any) => void) | null) => void;
		  }
		| undefined;
	export let renderedOptions:
		| {
				rendered: string[];
				setRendered: (newRendered: string[]) => void;
		  }
		| undefined;
	export let modals:
		| {
				hasCreateButton: boolean;
				openCreateModal: () => void;
		  }
		| undefined;
	export let activateBulkMode: () => void;

	const handleRenderedKey = (key: string) => {
		if (!renderedOptions) return;
		let { rendered, setRendered } = renderedOptions;
		if (rendered.includes(key)) rendered = rendered.filter((k) => k !== key);
		else rendered = Object.keys(schema).filter((k: string) => k === key || rendered.includes(k));
		setRendered(rendered);
		addQueryParams('cols', rendered.join(','));
	};

	let initialQuery: string;
	onMount(() => {
		let q = getQueryParams('q');
		if (search && q) {
			initialQuery = q;
			searchData(q);
		} else initialQuery = '';
	});

	const searchData = (query: string) => {
		if (!search) return;

		let { searchKey, setFilterConditions } = search;
		if (query == '') setFilterConditions(null);

		setFilterConditions(
			(el: any) => el[searchKey] && el[searchKey].toLowerCase().includes(query.toLowerCase())
		);
		addQueryParams('q', query);
	};
</script>

<div class="normal-utils">
	{#if renderedOptions}
		<Collapse>
			<p slot="title">Seleziona Campi Visibili</p>
			<div class="flex justify-between px-6 py-2" slot="content">
				{#each Object.keys(schema) as key}
					<div
						class="cursor-pointer flex gap-2 items-center font-light"
						on:click={() => handleRenderedKey(key)}
					>
						{#if renderedOptions.rendered.includes(key)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-4 h-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-4 h-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
								/>
							</svg>
						{/if}
						{schema[key].name}
					</div>
				{/each}
			</div>
		</Collapse>
	{/if}
	<div class="buttons-wrapper">
		{#if modals?.hasCreateButton}
			<button class="btn btn-primary" on:click={modals.openCreateModal}>Crea</button>
		{/if}
		<button class="btn btn-secondary" on:click={activateBulkMode}>Modalità Bulk</button>
		{#if search && initialQuery !== undefined}
			<SearchBox
				inputProps={{ placeholder: 'Cerca...', type: 'text', class: 'input input-bordered' }}
				{initialQuery}
				callback={searchData}
				class="table-editor-filter"
				timeoutDuration={search.timeout}
			/>
		{/if}
	</div>
</div>

<style lang="postcss">
	:global(.normal-utils .sw-collapse) {
		:global(.sw-collapse-title) {
			@apply font-light bg-base-200 px-6 py-3 rounded-md border-2 border-accent;
		}
	}

	.buttons-wrapper {
		@apply flex w-full my-4 gap-2;

		:global(.table-editor-filter) {
			@apply ml-auto;
		}
	}
</style>
