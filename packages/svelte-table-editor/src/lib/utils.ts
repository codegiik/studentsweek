import type SvelteStore from 'svelte';
import { derived } from 'svelte/store';

export function asyncDerivedStream<T>(
	stores: SvelteStore<any>[] | SvelteStore<T>,
	callback: (store: any) => Promise<any>,
	initial_value: any
) {
	let previous = 0;

	return derived(
		stores,
		($stores, set) => {
			const start = Date.now();
			Promise.resolve(callback($stores)).then((value) => {
				if (start > previous) {
					previous = start;
					set(value);
				}
			});
		},
		initial_value
	);
}

export function asyncDerivedConstistent<T>(
	stores: SvelteStore<any>[] | SvelteStore<T>,
	callback: (store: any) => Promise<any>,
	initial_value: any
) {
	let guard: any;

	return derived(
		stores,
		($stores, set) => {
			const inner = (guard = {});

			set(initial_value);
			Promise.resolve(callback($stores))
				.then((value) => {
					if (guard === inner) {
						set(value);
					}
				})
				.catch((err) => console.error(err));
		},
		initial_value
	);
}
