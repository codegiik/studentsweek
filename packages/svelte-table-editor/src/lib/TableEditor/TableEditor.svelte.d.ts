import { SvelteComponentTyped } from 'svelte';
import type { TableEditorSchema } from '$lib/interfaces';

export interface TableEditorProps<T> {
	data: T[];
	schema: TableEditorSchema;
}

export default class TableEditor<T> extends SvelteComponentTyped<
	TableEditorProps<T>,
	TableEditorEvents,
	TableEditorSlots
> {}
