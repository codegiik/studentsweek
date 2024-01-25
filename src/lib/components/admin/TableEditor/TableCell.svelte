<script lang="ts">
	import TableEditorMulti from './TableMulti.svelte';
	export let key: string;
	export let data: any;
	export let index: number;
	export let queue: Record<string, any>;
	export let selected: number[];
	export let mode: 'normal' | 'bulk';
	export let schema: TableEditorSchema;
	export let setData: (newData: any) => void;
	export let options: TableEditorOptions | undefined;
	export let startBatchUpdate: (newQueue: Record<string, any>) => void;
	import type { CallbacksHandler, TableEditorOptions, TableEditorSchema } from '$lib/interfaces';

	const handleInputChange = (e: Event, key: string) => {
		let value: any = (e.target as HTMLInputElement).value;
		const callbackConditions = options?.save && options?.callbacksHandler;
		const identifierKey = (options?.callbacksHandler as CallbacksHandler).identifierKey;

		if (schema[key].type == 'number') value = Number(value);

		if (mode == 'bulk') {
			selected.forEach((s) => {
				data[s][key] = value;
			});
			setData(data);

			if (callbackConditions) {
				selected.forEach(
					(i) =>
						(queue[data[i][identifierKey]] = {
							...queue[data[i][identifierKey]],
							[key]: value
						})
				);

				if (options?.save?.type === 'auto') startBatchUpdate(queue);
			}
		} else if (mode == 'normal') {
			if (callbackConditions) {
				queue[data[index][identifierKey]] = {
					...queue[data[index][identifierKey]],
					[key]: value
				};

				if (options?.save?.type === 'auto') startBatchUpdate(queue);
			}
		}
	};
</script>

<td>
	{#if schema[key].editable === false}
		{data[index][key]}
	{:else if schema[key].render?.table}
		<svelte:component
			this={schema[key].render?.table}
			value={data[index]}
			data={schema[key].render?.data}
			callback={(value) => handleInputChange({ target: { value } }, key)}
		/>
	{:else if schema[key].type === 'number'}
		<input
			type="number"
			bind:value={data[index][key]}
			on:input={(e) => handleInputChange(e, key)}
			{...schema[key].inputOptions}
		/>
	{:else if schema[key].type === 'enum'}
		<select
			bind:value={data[index][key]}
			on:change={(e) => handleInputChange(e, key)}
			{...schema[key].inputOptions}
		>
			{#each Object.entries(schema[key].enumOptions) as [optKey, optValue]}
				<option value={optKey}>{optValue}</option>
			{/each}
		</select>
	{:else if schema[key].type === 'multi'}
		<TableEditorMulti
			schema={schema[key]}
			data={data[index][key]}
			callback={(value) => handleInputChange({ target: { value } }, key)}
		/>
	{:else}
		<input
			bind:value={data[index][key]}
			on:input={(e) => handleInputChange(e, key)}
			{...schema[key].inputOptions}
		/>
	{/if}
</td>

<style lang="scss">
	input {
		@apply outline-none;
		background: inherit;
	}
</style>
