import {
	derived,
	readable,
	writable,
	type Readable,
	type Unsubscriber,
	type Writable
} from 'svelte/store';
import type { SvelteComponentDev } from 'svelte/internal';

export interface TableEditorSchema {
	[key: string]: TableEditorElement;
}

type TableEditorElementTypes = 'string' | 'number' | 'select';

export type TableEditorElement = {
	name: string;
	render?: {
		component: typeof SvelteComponentDev;
		props?: any;
	};
	editable?: boolean;
	type?: TableEditorElementTypes;
	sort?: boolean | ((reverse?: boolean) => number);
	selectOptions?: any;
};

export type TableEditorSelectElement = {
	type: 'select';
	selectOptions: Record<string, string>;
} & TableEditorElement;

export type TableEditorButton = {
	button: typeof SvelteComponentDev;
	openModal: (...args: any) => any;
};

export interface TableEditorOptions {
	multiMode?: boolean;
	initiallyRenderedKeys?: Set<string>;
	paging?: {
		pageSize: number;
		pageThreshold?: number;
		callback?: (page: number, pageSize: number) => void;
	};
	search?: {
		searchKey: string;
		searchThreshold?: number;
		callback?: (searchKey: string) => void;
	};
	callbacks?: {
		create?: (newElement: any) => any;
		edit?: (index: number, newElement: any) => any;
		editBulk?: (indeces: Set<number>, changes: any) => any;
		remove?: (index: number) => any;
		removeBulk?: (indeces: Set<number>) => any;
		timeout: number;
	};
	buttons?: {
		create?: TableEditorButton;
		edit?: TableEditorButton;
		remove?: TableEditorButton;
	};
}

type QueueElement = CreateQueueElement | EditQueueElement | RemoveQueueElement;

type CreateQueueElement = {
	type: 'create';
	data: Record<string, any>;
};

type EditQueueElement = {
	type: 'edit';
	data: Record<string, any>;
};

type RemoveQueueElement = {
	type: 'remove';
	remove: boolean;
};

export class TableEditor<T extends Record<string, any>> {
	private _selected?: Writable<Set<number>>;
	private _renderedKeys?: Writable<Set<string>>;
	private _timeout?: ReturnType<typeof setTimeout>;
	private _action: Writable<'filter' | 'page' | null> = writable(null);

	public page = writable(0);
	public filter = writable('');
	public saving = writable(false);
	public results?: Writable<number>;
	public mode: 'bulk' | 'normal' = 'normal';
	public queue: Record<string, QueueElement> = {};
	public sort: Writable<{ key?: string; reverse?: boolean }> = writable({});

	constructor(
		public schema: TableEditorSchema,
		public data: Writable<T[]>,
		public options: TableEditorOptions
	) {
		if (options.multiMode !== false) this._selected = writable(new Set<number>());
		if (options.initiallyRenderedKeys) this._renderedKeys = writable(options.initiallyRenderedKeys);
		else this._renderedKeys = writable(new Set<string>(Object.keys(this.schema)));

		if (options.search) {
			let d: T[] = [];
			const unsubscribe = data.subscribe((s) => (d = s));
			this.results = writable(d.length);
			unsubscribe();
		}
	}

	private _getElements([data, sort, filter, page, action]: [
		data: T[],
		sort: { key?: string; reverse?: boolean },
		filter: string,
		page: number,
		action: 'filter' | 'page' | null
	]) {
		data = data.map((el, i) => ({ ...el, _tableIndex: i }));

		if (this.options.search && filter) {
			const { searchKey, searchThreshold, callback } = this.options.search;
			const regex = new RegExp(filter, 'gi');
			data = data.filter((el) => el[searchKey] && (el[searchKey] as string).match(regex));

			if (callback && searchThreshold && data.length <= searchThreshold && action === 'filter')
				callback(filter);
		}

		const results = data.length;
		if (this.results) this.results.set(results);

		if (this.options.paging) {
			const { pageSize, pageThreshold, callback } = this.options.paging;
			data = data.slice(page * pageSize, pageSize + pageSize * page);

			if (
				callback &&
				pageThreshold &&
				action === 'page' &&
				data.length <= pageThreshold &&
				results / ((page + 1) * pageSize) <= 1
			)
				callback(page, pageSize);
		}

		if (sort.key) {
			data = data.sort(
				(el1: any, el2: any) =>
					(sort.key && el1[sort.key] > el2[sort.key] ? 1 : -1) * (sort.reverse ? 1 : -1)
			);
		}

		return data;
	}

	public get headers() {
		if (!this._renderedKeys)
			return readable(
				Object.entries(this.schema)
					.sort()
					.map(([key, { name }]) => [key, name])
			);

		return derived(this._renderedKeys, (renderedKeys) => {
			return Array.from(renderedKeys)
				.sort()
				.map((key) => [key, this.schema[key].name]);
		});
	}

	public get elements() {
		return derived(
			[this.data, this.sort, this.filter, this.page, this._action],
			this._getElements.bind(this)
		);
	}

	public updateData(index: number, key: string, value: any) {
		if (this.schema[key].editable === false) return;

		this.data.update((data) => {
			(data[index] as Record<string, any>)[key] = value;
			return data;
		});

		this._addQueueElement({ index: index.toString(), key, value }, 'edit');
	}

	public updateDataBulk(key: string, value: any) {
		if (this.schema[key].editable === false || !this._selected) return;

		let selected: Set<number>;
		const unsubscribe = this._selected.subscribe((s) => (selected = s));

		this.data.update((data) => {
			selected.forEach((tableIndex) => {
				(data[tableIndex] as Record<string, any>)[key] = value;
			});
			return data;
		});

		this._addQueueElement(
			{
				index: 'bulk',
				key,
				value
			},
			'edit'
		);

		unsubscribe();
	}

	// Queue
	private _addQueueElement(
		{
			index,
			key,
			value
		}: {
			index: string;
			key?: string;
			value?: any;
		},
		type: 'create' | 'edit' | 'remove'
	) {
		if (!this.options?.callbacks || !this.options.callbacks[type]) return;

		switch (type) {
			case 'create':
			case 'edit':
				if (!key || !value) return;
				if (!this.queue[index]) this.queue[index] = { type, data: { [key]: value } };
				else
					this.queue = {
						...this.queue,
						[index]: {
							type,
							data: {
								...(this.queue[index] as CreateQueueElement | EditQueueElement).data,
								[key]: value
							}
						}
					};
				break;
			case 'remove':
				this.queue = {
					...this.queue,
					[index]: {
						type: 'remove',
						remove: true
					}
				};
				break;
		}

		this._beginQueue();
	}

	private _beginQueue() {
		if (!this.options.callbacks) return;

		const callbacks = this.options.callbacks;

		if (this._timeout) clearTimeout(this._timeout);

		this.saving.set(true);

		this._timeout = setTimeout(() => {
			let selected: Set<number>;
			let unsubscribe: Unsubscriber | undefined;
			if (this._selected) unsubscribe = this._selected.subscribe((s) => (selected = s));

			Object.entries(this.queue).forEach(async ([index, el]) => {
				if (!callbacks) return;

				switch (el.type) {
					case 'create':
						if (callbacks.create) await callbacks.create(el.data);
						break;
					case 'edit':
						if (callbacks.edit && index !== 'bulk') await callbacks.edit(parseInt(index), el.data);
						else if (callbacks.editBulk && index === 'bulk') {
							await callbacks.editBulk(selected, el.data);
							if (this._selected) this._selected.set(new Set<number>());
						}
						break;
					case 'remove':
						if (callbacks.remove && index !== 'bulk') await callbacks.remove(parseInt(index));
						else if (callbacks.removeBulk && index === 'bulk') {
							await callbacks.removeBulk(selected);
							if (this._selected) this._selected.set(new Set<number>());
						}
						break;
				}
			});

			this.queue = {};
			this.saving.set(false);
			if (unsubscribe) unsubscribe();
			clearTimeout(this._timeout);
		}, this.options.callbacks.timeout);
	}

	// Searching
	startSearch() {
		this.page.set(0);
		this._action.set('filter');
	}

	// Paging
	public nextPage = () => {
		if (!this.options.paging) return;
		this.page.update((p) => p + 1);
		this._action.set('page');
	};

	public prevPage = () => {
		if (!this.options.paging) return;
		this.page.update((p) => {
			if (p > 0) p--;
			return p;
		});
		this._action.set('page');
	};

	// Bulk Mode
	public get selected(): Readable<Set<number>> | undefined {
		if (!this._selected) return undefined;
		return derived(this._selected, (s) => s);
	}

	public switchSelected(index: number) {
		if (!this._selected) return;
		this._selected.update((s) => {
			if (!s.has(index)) s.add(index);
			else s.delete(index);

			return s;
		});
	}

	public addSelected(indeces: number[]) {
		if (!this._selected) return;

		const newSet = new Set<number>();
		indeces.forEach((i) => newSet.add(i));
		this._selected.set(newSet);
	}

	// Header Rendering
	public switchRenderedKeys(key: string) {
		if (!this._renderedKeys) return;

		this._renderedKeys.update((keys) => {
			if (!keys.has(key)) keys.add(key);
			else if (keys.size > 3) keys.delete(key);

			return keys;
		});
	}
}
