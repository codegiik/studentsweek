<script lang="ts">
	// Imports
	import TableCell from './TableCell.svelte';
	import TablePaging from './TablePaging.svelte';
	import TrashIcon from './icons/TrashIcon.svelte';
	import BulkModeUtils from './BulkModeUtils.svelte';
	import PencilIcon from './icons/PencilIcon.svelte';
	import NormalModeUtils from './NormalModeUtils.svelte';
	import { addQueryParams, getQueryParams } from '$lib/utils';
	import { closeModal, openModal as svelteOpenModal } from 'svelte-modals';
	import type {
		TableEditorSchema,
		TableEditorOptions,
		AutoSave,
		TableEditorProp,
		NumberProp,
		TableEditorPaging,
		IncrementalPaging
	} from '$lib/interfaces';
	import Element from './modals/Element.svelte';
	import type { SvelteComponentDev } from 'svelte/internal';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	// Props
	export let data: any[];
	export let schema: TableEditorSchema;
	export let options: TableEditorOptions | undefined;

	let clazz = '';
	export { clazz as class };

	/*          General            */
	let sliceStart = 0;
	let sliceEnd = options?.paging?.pageSize || data.length;
	let filterConditions: ((el: any) => void) | null = null;
	let currentPage =
		(options?.paging as TableEditorPaging<IncrementalPaging>).currentPage ||
		(options?.paging?.type === 'default' ? parseInt(getQueryParams('page') || '0') : 0);
	const setCurrentPage = (newPage: number) => (currentPage = newPage);

	let setData = (newData: any) => (data = newData);
	let sliceData = (start: number, end?: number) => {
		sliceStart = start;
		sliceEnd = end || data.length;
		data = data;
	};

	let setFilterConditions = (conditions: ((el: any) => void) | null) => {
		filterConditions = conditions;
		sliceData(0, options?.paging?.pageSize || data.length);
	};

	$: renderedData = data
		.filter((el) => (!filterConditions ? true : (filterConditions as (el: any) => void)(el)))
		.slice(sliceStart, sliceEnd);
	$: filteredDataLength = data.filter((el) =>
		!filterConditions ? true : (filterConditions as (el: any) => void)(el)
	).length;

	// Sorting
	const parseSortOptionsFromURL = (): { reverse: boolean; sortKey: string | null } => {
		let sortKey = null,
			reverse = false;
		const query = new URLSearchParams(window.location.search);

		const querySortKey = query.get('orderBy');
		if (
			querySortKey &&
			Object.keys(schema)
				.filter((k) => schema[k].sort)
				.includes(querySortKey)
		)
			sortKey = querySortKey;

		const queryReverse = query.get('reverse');
		if (queryReverse == '0' || queryReverse == '1') reverse = queryReverse == '1' ? true : false;

		return {
			reverse,
			sortKey
		};
	};

	let { reverse, sortKey } = parseSortOptionsFromURL();
	const sort = (key: string) => {
		const criteria = schema[key].sort;
		if (!criteria) return;

		if (sortKey !== key) reverse = false;
		data = data.sort(
			typeof criteria !== 'boolean'
				? () => criteria(reverse)
				: (a: any, b: any) => {
						if ((!reverse && a[key] > b[key]) || (reverse && a[key] < b[key])) return 1;
						else return 0;
				  }
		);

		reverse = !reverse;
		sortKey = key;
		addQueryParams('orderBy', sortKey);
		addQueryParams('reverse', reverse ? '1' : '0');
	};

	// Auto-save
	let queue: Record<string, any> = {};
	let t: ReturnType<typeof setTimeout> | undefined;

	const startBatchUpdate = (newQueue: Record<string, any>) => {
		if (!options?.save || !options?.callbacksHandler) return;

		if (t) clearTimeout(t);
		t = setTimeout(() => {
			options?.callbacksHandler?.bulkEditEntities(newQueue);
			t = undefined;
			queue = {};
		}, (options.save as AutoSave).timeout || 2000);
	};

	// Manual Save
	const save = async () => await options?.callbacksHandler?.bulkEditEntities(queue);

	// Mode Handling
	export let mode: 'bulk' | 'normal' = 'normal';
	const setMode = (m: 'bulk' | 'normal') => (mode = m);

	/*          Normal Mode          */
	let rendered: string[] = Object.keys(schema);
	let setRendered: (newRendered: string[]) => void;

	let currentElement: Record<string, any>;
	let currentModal: 'create' | 'edit' | 'delete' | undefined = undefined;
	let [hasCreateButton, hasEditButton, hasDeleteButton] = Array(3).fill(false);

	const createDummyElement = () => {
		return Object.fromEntries(
			Object.keys(schema)
				.filter((k) => schema[k].editable !== false)
				.map((k: string) => {
					let value = schema[k].default || '';
					switch (schema[k].type) {
						case 'number':
							value = (schema[k] as TableEditorProp<any, NumberProp>).inputOptions?.min || 1;
							break;
					}
					return [k, value];
				})
		);
	};

	const openModal = (modalType: 'create' | 'edit' | 'delete') => {
		if (!options?.buttons) return;

		let component: typeof SvelteComponentDev | undefined = options.buttons[modalType]?.component;
		let componentProps: Record<string, unknown> | undefined =
			options.buttons[modalType]?.componentProps ?? {};

		if (!component) return;

		if (modalType == 'delete')
			componentProps.callback = async () =>
				await options?.callbacksHandler?.deleteEntity(currentElement.id);

		svelteOpenModal(component, {
			...componentProps,
			data: modalType === 'create' ? {} : currentElement
		});
	};

	// Rendering Handler
	if (options?.renderedHandler) {
		const { initiallyRenderedKeys } = options.renderedHandler;
		if (initiallyRenderedKeys !== 'all') {
			rendered = Object.keys(schema).filter((k) => initiallyRenderedKeys.includes(k));
		}
		setRendered = (newRendered: string[]) => (rendered = newRendered);
	}

	// Buttons Handler
	if (options?.buttons) {
		const { buttons } = options;
		[hasCreateButton, hasEditButton, hasDeleteButton] = ['create', 'edit', 'delete'].map((b) =>
			Object.keys(buttons).includes(b)
		);
	}

	/*          Bulk Mode          */
	let selected: number[] = [];
	const handleSelect = (e: MouseEvent, index: number) => {
		if (e.shiftKey) return;
		const realIndex = options?.paging ? index + currentPage * options.paging.pageSize : index;

		if (selected.includes(realIndex)) selected = selected.filter((i) => i !== realIndex);
		else selected = [...selected, realIndex];
	};

	const handleRowClick = (e: MouseEvent, index: number) => {
		currentElement = renderedData[index];
		if (mode !== 'bulk') return;

		if (e.shiftKey && selected.length > 0) {
			const sorted = selected.sort((a, b) => a - b);
			const min = sorted[0];
			selected = [...Array(Math.abs(min - index) + 1).keys()].map(
				(i) => i + (min >= index ? index : min)
			);
		}
	};

	const deleteBulk = () => {
		selected.forEach(async (el) => await options?.callbacksHandler?.deleteEntity(data[el]));
		data = data.filter((_: any, i: number) => !selected.includes(i));
		selected = [];
	};

	const deactivateBulkMode = () => {
		setMode('normal');
		selected = [];
	};
</script>

{#if mode === 'normal'}
	<NormalModeUtils
		{schema}
		search={options?.search
			? {
					setFilterConditions,
					...options.search
			  }
			: undefined}
		renderedOptions={options?.renderedHandler
			? {
					rendered,
					setRendered
			  }
			: undefined}
		modals={options?.buttons
			? {
					hasCreateButton,
					openCreateModal: () => openModal('create')
			  }
			: undefined}
		activateBulkMode={() => setMode('bulk')}
	/>
{:else if mode === 'bulk'}
	<BulkModeUtils {selected} {deleteBulk} deactivate={deactivateBulkMode} />
{/if}

<div class="overflow-x-auto drop-shadow-sm">
	<table class="{clazz} table w-full hover">
		<thead>
			<tr>
				{#if mode == 'bulk'}
					<th> Selez. </th>
				{/if}
				{#each rendered as key}
					<th class={schema[key].sort ? 'cursor-pointer' : undefined} on:click={() => sort(key)}>
						{schema[key].name}
						{#if sortKey === key}
							<div class={`sort-triangle ${!reverse ? 'rotate-0' : 'rotate-180'}`} />
						{/if}
					</th>
				{/each}
				{#if hasEditButton}
					<th>Modifica</th>
				{/if}
				{#if hasDeleteButton}
					<th>Elimina</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each renderedData as _element, index}
				<tr
					class={selected.includes(index + (currentPage * options?.paging?.pageSize || 0))
						? 'bg-blue-200'
						: ''}
					on:click|capture={(e) => handleRowClick(e, index)}
				>
					{#if mode == 'bulk'}
						<td on:click={(e) => handleSelect(e, index)}>
							<input
								type="checkbox"
								class="checkbox"
								checked={selected.includes(index + (currentPage * options?.paging?.pageSize || 0))}
							/>
						</td>
					{/if}
					{#each rendered as key}
						<TableCell
							{startBatchUpdate}
							{options}
							{queue}
							{key}
							{index}
							{mode}
							{schema}
							{setData}
							{selected}
							data={renderedData}
						/>
					{/each}
					{#if hasEditButton}
						<td>
							<button on:click={() => openModal('edit')}>
								<PencilIcon />
							</button>
						</td>
					{/if}
					{#if hasDeleteButton}
						<td>
							<button on:click={() => openModal('delete')}>
								<TrashIcon />
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				{#if mode === 'bulk'}
					<td />
				{/if}
				<td>
					Elementi: {renderedData.length}
				</td>
				{#if options?.paging}
					<TablePaging
						{mode}
						{sliceData}
						{currentPage}
						{setCurrentPage}
						paging={{
							...options.paging,
							dataLength: filteredDataLength
						}}
						renderedDataLength={renderedData.length}
					/>
				{/if}
				{#if options?.save?.type === 'auto'}
					<td>
						{t === undefined ? 'Salvato' : 'Salvataggio'}
					</td>
				{:else}
					<td>
						<button on:click={save}>Salva</button>
					</td>
				{/if}
				<td />
			</tr>
		</tfoot>
	</table>
</div>

<style lang="scss">
	table {
		tr {
			@apply font-light;
		}

		thead,
		tfoot {
			@apply font-title font-bold;
		}
	}

	.sort-triangle {
		@apply w-0 h-0 mx-auto;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-top: 10px solid black;
	}
</style>
