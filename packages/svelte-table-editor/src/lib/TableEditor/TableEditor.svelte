<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { TableEditor, type TableEditorOptions, type TableEditorSchema } from '$lib/interfaces';

	type T = $$Generic;
	export let data: Writable<(T & Record<string, any>)[]>;
	export let schema: TableEditorSchema;
	export let options: TableEditorOptions;

	const table = new TableEditor(schema, data, options);

	const updateData = ({ event, key, i }: { event?: Event; key: string; i: number }) => {
		let value;

		if (event) {
			const target = event.target as HTMLInputElement;
			value = target.value;

			if (schema[key].type === 'number') {
				value = Number(value);
			}
		}

		if (table.mode === 'normal') table.updateData(i, key, value);
		else table.updateDataBulk(key, value);
	};

	const switchSelected = (e: MouseEvent | KeyboardEvent, index: number) => {
		if (table.mode === 'normal' || !$selected) return;
		if (e.shiftKey) {
			let min = Math.min(...Array.from($selected));
			let arrLen = Math.abs(min - index) + 1;

			if (arrLen === 0) return;

			min = Math.min(min, index);
			let indices: number[] = Array(arrLen)
				.fill(0)
				.map((_, i) => i + min);

			table.addSelected(indices);

			return;
		}

		table.switchSelected(index);
	};

	const switchMode = (mode: 'bulk' | 'normal') => {
		if (Object.keys(table.queue).length > 0) return;
		table.mode = mode;
	};

	const sortTable = (key: string) => {
		if (!schema[key].sort) return;
		table.sort.update((sort) => ({
			key,
			reverse: !sort.reverse || false
		}));
	};

	let { headers, elements, results, selected, page, saving, filter } = table;
</script>

<div class="table-editor-wrapper">
	<div class="table-editor-heading">
		{#if options.multiMode !== false}
			{#if table.mode === 'bulk'}
				<button on:click={() => switchMode('normal')} class:cursor-not-allowed={$saving}>
					Selezione Standard
				</button>
			{:else}
				<button on:click={() => switchMode('bulk')} class:cursor-not-allowed={$saving}>
					Selezione Multipla
				</button>
			{/if}
		{/if}

		{#if options.search}
			<div class="searchbox">
				<input type="text" bind:value={$filter} on:input={() => table.startSearch()} />
			</div>
		{/if}
	</div>

	<div class="table-editor-rendering">
		{#each Object.keys(schema).map((k) => [k, schema[k].name]) as [key, name]}
			<div
				on:click={() => table.switchRenderedKeys(key)}
				on:keypress={() => table.switchRenderedKeys(key)}
				class:line-through={!$headers.some(([k]) => k === key)}
			>
				{name}
			</div>
		{/each}
	</div>

	<div class="table-editor">
		{#if table.mode === 'bulk'}
			<div class="table-editor-col">
				<div class="text-transparent">S</div>
				{#each $elements as element}
					<div
						class="table-editor-cell"
						on:keypress={() => null}
						on:click={(e) => switchSelected(e, element._tableIndex)}
					>
						<input type="checkbox" checked={$selected && $selected.has(element._tableIndex)} />
					</div>
				{/each}
			</div>
		{/if}
		{#each $headers as [key, header]}
			<div class="table-editor-col">
				<div
					class="table-editor-heading"
					on:click={() => sortTable(key)}
					on:keypress={() => sortTable(key)}
				>
					{header}
				</div>
				{#each $elements as element}
					<div
						class="table-editor-cell"
						class:bg-gray-300={schema[key].editable === false}
						class:pointer-none={schema[key].editable === false}
						class:cursor-not-allowed={schema[key].editable === false}
					>
						{#if schema[key].render}
							<svelte:component
								this={schema[key].render?.component}
								{...schema[key].render?.props}
							/>
						{:else if schema[key].editable === false}
							<div>
								{element[key]}
							</div>
						{:else if schema[key].type === 'select'}
							<select
								value={element[key]}
								on:change={(event) => updateData({ event, key, i: element._tableIndex })}
							>
								{#each Object.entries(schema[key].selectOptions) as [value, option]}
									<option {value}>{option}</option>
								{/each}
							</select>
						{:else if schema[key].type === 'number'}
							<input
								type="number"
								value={element[key]}
								on:input={(event) => updateData({ event, key, i: element._tableIndex })}
							/>
						{:else}
							<input
								type="text"
								value={element[key] || ''}
								on:input={(event) => updateData({ event, key, i: element._tableIndex })}
							/>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
		{#if options.buttons?.edit}
			<div class="table-editor-col">
				{#each $elements as element}
					<div
						class="table-editor-cell"
						on:click={() => options.buttons?.edit?.openModal(element)}
						on:keypress={() => options.buttons?.edit?.openModal(element)}
					>
						<svelte:component this={options.buttons.edit.button} />
					</div>
				{/each}
			</div>
		{/if}
		{#if options.buttons?.remove}
			<div class="table-editor-col">
				{#each $elements as element}
					<div
						class="table-editor-cell"
						on:click={() => options.buttons?.remove?.openModal(element)}
						on:keypress={() => options.buttons?.remove?.openModal(element)}
					>
						<svelte:component this={options.buttons.remove.button} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="table-editor-footer">
		{#if options.paging?.pageSize && $results}
			<span class="paging">
				Pagina {$page + 1}
				{#if $results / (($page + 1) * options.paging.pageSize) > 1}
					<button on:click={table.nextPage}>+</button>
				{/if}
				{#if $page > 0}
					<button on:click={table.prevPage}>-</button>
				{/if}
			</span>
		{/if}

		<span class="saving-status">
			{#if $saving}
				Salvataggio in corso...
			{:else}
				Salvataggio Completato
			{/if}
		</span>
	</div>
</div>

<style lang="postcss">
	.table-editor {
		@apply flex;
	}

	.table-editor-col {
		@apply flex flex-col items-center;
	}

	.table-editor-rendering {
		@apply flex gap-2;
	}

	.table-editor-heading,
	.table-editor-rendering > div {
		@apply cursor-pointer;
	}

	.table-editor-cell {
		@apply px-2;
	}

	.table-editor-cell input {
		@apply bg-transparent;
	}
</style>
