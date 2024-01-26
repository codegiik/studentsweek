import { writable, type Writable } from 'svelte/store';
import type { School, SetupExtra } from '$lib/interfaces';

export const errors = writable({});
export const extra: Writable<SetupExtra> = writable({
	classNumbers: [1]
});

export const payload: Writable<Partial<School>> = writable({
	timeUnit: 60,
	classes: ['Classe Senza Nome (1)'],
	locations: []
});
