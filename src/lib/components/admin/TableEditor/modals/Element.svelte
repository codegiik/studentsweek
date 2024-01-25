<script lang="ts">
	import Fa from 'svelte-fa';
	import { closeModal } from 'svelte-modals';
	import type { TableEditorSchema } from '$lib/interfaces';
	import { faSave } from '@fortawesome/free-solid-svg-icons';

	export let isOpen: boolean;
	export let element: any;
	export let modalType: 'edit' | 'create';
	export let schema: TableEditorSchema;
	export let callback: (id: string, e: typeof element) => void;

	const setElementField = (key: string, value: any) => (element[key] = value);

	const save = () => {
		if (modalType === 'edit') callback(element.id, element);
		closeModal();
	};
</script>

{#if isOpen}
	<div role="dialog" class="modal-content">
		<h1>Aggiungi un Elemento</h1>
		{#each Object.keys(element) as key}
			<p class="label">
				{schema[key].name}:
			</p>
			{#if schema[key].render?.modal}
				<svelte:component
					this={schema[key].render.modal}
					data={schema[key].render.data}
					{...schema[key].render.buildProps(element[key])}
					callback={(v) => setElementField(key, v)}
				/>
			{:else if schema[key].type === 'number'}
				<input
					class="input input-bordered"
					type="number"
					bind:value={element[key]}
					{...schema[key].inputOptions}
				/>
			{:else if schema[key].type === 'enum'}
				<select bind:value={element[key]}>
					{#each Object.entries(schema[key].enumOptions) as [value, key]}
						<option {value}>{key}</option>
					{/each}
				</select>
			{:else}
				<input
					class:pointer-events-none={schema[key].editable === false}
					class="input input-bordered"
					placeholder={schema[key].name}
					bind:value={element[key]}
					{...schema[key].inputOptions}
				/>
			{/if}
		{/each}
		<div class="divider" />
		<button class="btn btn-primary btn-icons" on:click={save}>Salva <Fa icon={faSave} /></button>
	</div>
{/if}

<style lang="postcss">
	.modal-content {
		@apply grid grid-cols-1 max-w-[500px] gap-2 text-center;
	}
</style>
