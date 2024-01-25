<script lang="ts">
	import Modal from './Modal.svelte';
	import SearchBox from '../tools/SearchBox.svelte';
	import type { MultiProp, TableEditorProp } from '$lib/interfaces';

	export let selected: any[];
	export let close: () => void;
	export let schema: TableEditorProp<any, MultiProp>;
	export let callback: (newSelected: any[]) => void;

	const handleClick = (key: string) => {
		if (selected.includes(key)) selected = selected.filter((el) => el != key);
		else selected = [...selected, key];
	};

	let renderedData = schema.multiOptions.data;
	const filter = (query: string) => {
		if (!query) {
			renderedData = schema.multiOptions.data;
			return;
		}

		if (Array.isArray(schema.multiOptions.data)) {
			renderedData = schema.multiOptions.data.filter((el) => el.includes(query));
		} else {
			renderedData = Object.fromEntries(
				Object.keys(schema.multiOptions.data)
					.filter((k) => (schema.multiOptions.data as Record<string, any>)[k].includes(query))
					.map((k) => [k, (schema.multiOptions.data as Record<string, any>)[k]])
			);
		}
	};

	const save = () => {
		callback(selected);
		close();
	};
</script>

<Modal {close}>
	<SearchBox label="Filtra: " callback={filter} />
	{#if Array.isArray(renderedData)}
		<div class="flex flex-col">
			{#each renderedData as el}
				<div class="flex justify-between" on:click|capture={() => handleClick(el)}>
					<span>{el}</span>
					<input type="checkbox" checked={selected.includes(el)} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col">
			{#each Object.entries(renderedData) as [key, value]}
				<div class="flex justify-between" on:click|capture={() => handleClick(key)}>
					<span>{value}</span>
					<input type="checkbox" checked={selected.includes(key)} />
				</div>
			{/each}
		</div>
	{/if}
	<button on:click={save}>Salva</button>
</Modal>
