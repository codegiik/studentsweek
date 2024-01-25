import { firestore } from './firebase';
import {
	doc,
	query,
	collection,
	getDoc as fsGetDoc,
	setDoc as fsSetDoc,
	addDoc as fsAddDoc,
	getDocs as fsGetDocs,
	deleteDoc as fsDeleteDoc,
	type DocumentData,
	QueryConstraint,
	QueryDocumentSnapshot,
	type SetOptions,
	type PartialWithFieldValue
} from 'firebase/firestore';
import { derived } from 'svelte/store';
import type { Timestamp } from 'firebase-admin/firestore';
import { PROPIC_FALLBACK_URL } from './user';

export interface GetDocsOptions {
	queryConstraints?: QueryConstraint[];
	returnDocs?: boolean;
}

export const docToData = <T>(doc: DocumentData): T =>
	({
		id: doc.id,
		...doc.data()
	} as T);

export const getDoc = async <T>(path: string, ...pathSegments: string[]) => {
	return await fsGetDoc(doc(firestore, path, ...pathSegments)).then((d) => docToData<T>(d));
};

export const getDocs = <T>(path: string, options: GetDocsOptions) =>
	new Promise(
		(
			resolve: (value: QueryDocumentSnapshot<DocumentData>[] | T[]) => void,
			reject: (value: string) => void
		) => {
			const { queryConstraints, returnDocs } = options;
			const pathSegments = path.split('/');

			let constraints: QueryConstraint[] = [];
			if (queryConstraints) constraints = [...queryConstraints];

			fsGetDocs(
				query(collection(firestore, pathSegments[0], ...pathSegments.slice(1)), ...constraints)
			)
				.then((snapshot) =>
					resolve(returnDocs ? snapshot.docs : snapshot.docs.map((doc) => docToData<T>(doc)))
				)
				.catch((err) => reject(err.message));
		}
	);

type SetDocParams = {
	newData: PartialWithFieldValue<DocumentData>;
	path: string;
	pathSegments?: string[];
	options?: SetOptions;
};

export const setDoc = async ({ newData, path, pathSegments = [], options = {} }: SetDocParams) => {
	return await fsSetDoc(doc(firestore, path, ...pathSegments), newData, options);
};

export const addDoc = async ({ newData, path, pathSegments = [] }: SetDocParams) => {
	return await fsAddDoc(collection(firestore, path, ...pathSegments), newData);
};

export const deleteDoc = async (path: string, ...pathSegments: string[]) => {
	return await fsDeleteDoc(doc(firestore, path, ...pathSegments));
};

export const addQueryParams = (...queryParams: string[]) => {
	if (queryParams.length % 2 !== 0) return;

	const url = new URL(window.location as unknown as string);
	for (let i = 0; i < queryParams.length; i += 2) {
		url.searchParams.set(queryParams[i], queryParams[i + 1]);
	}
	window.history.pushState({}, '', url);
};

export const getQueryParams = (key: string) => {
	const query = new URLSearchParams(window.location.search);
	return query.get(key);
};

export const checkValidEmail = (email: string) =>
	Boolean(
		String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
	);

export const getCodeMessage = (code: string) => {
	switch (code) {
		case 'auth/inexistent-domain':
			return 'Sembra che il tuo account non sia associato a nessuna scuola.';
		case 'auth/email-already-in-use':
			return 'Questa email è già stata utilizzata per un altro account.';
		case 'auth/invalid-email':
			return "L'email inserita non è valida.";
		case 'auth/invalid-password':
			return 'La password inserita non è valida.';
		case 'auth/invalid-verification-code':
		case 'auth/invalid-verification-id':
		case 'auth/missing-verification-code':
			return 'Il codice inserito non è valido.';
		case 'auth/missing-verification-id':
			return 'Il codice di verifica è mancante.';
		case 'auth/phone-number-already-exists':
			return 'Questo numero di telefono è già stato utilizzato per un altro account.';
		case 'auth/weak-password':
			return 'La password inserita è troppo debole.';
		case 'auth/invalid-token':
			return "La tua sessione sembra essere scaduta, ritenta l'accesso";
		case 'auth/wrong-password':
			return 'La password inserita non è corretta.';
		case 'auth/user-not-found':
			return "L'utente non è stato trovato.";
		case 'activation/invalid-code':
			return 'Il codice inserito non è valido';
		case 'activation/code-already-used':
			return 'Il codice inserito è già stato utilizzato';
		case 'general/try-again':
			return 'Si è verificato un errore, riprova più tardi';
		case 'auth/account-exists-with-different-credential':
			return "Un altro account sembra registrato con questa email, eliminalo oppure contatta l'assistenza.";
		default:
			return 'Si è verificato un errore, riprova più tardi. Codice: ' + code;
	}
};

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

export const stringToHsl = (str: string, lightness = 75, saturation = 70) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
};

export const collideRules = (...args: number[][]) => {
	args.sort((a, b) => a.length - b.length);

	if (args.length == 0) return [];

	const [first, ...rest] = args;

	if (!Array.isArray(first) || !Array.isArray(rest)) return [];

	return first.map((rule, i) => rest.reduce((acc, curr) => acc & curr[i], rule));
};

export const avaliable = (rules: number[]) => rules.reduce((acc, curr) => acc | curr, 0) !== 0;

export const getDayName = (day: Timestamp): string => {
	const date = day.toDate();
	const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
	return dayNames[date.getDay()] + ' ' + date.getDate() + '/' + (date.getMonth() + 1);
};

export const getHoursSchemaByRuleAndUnit = (rule: number, unit: number): number[][] => {
	const schema: number[][] = [];

	let counter = 0;
	let i = 0;

	while (rule != 0) {
		if ((rule & (1 << i)) == 0) {
			if (counter != 0) schema.push([i - counter + 1, i + 1]);
			counter = 0;
		} else {
			counter++;

			if ((rule & ~(1 << i)) == 0 || counter === unit) {
				schema.push([i - counter + 1, i + 1]);
				counter = 0;
			}
		}

		rule = rule & ~(1 << i);
		i++;
	}

	return schema;
};

export class TimetableRule {
	constructor(public rules: number[] = []) {}

	collide(...args: number[][]) {
		this.rules = collideRules(this.rules, ...args);
		return this;
	}

	static nOfHours(rules: number[]) {
		return rules.map((rule) => Math.floor(Math.log2(rule + 1)));
	}

	nOfHours() {
		return TimetableRule.nOfHours(this.rules);
	}

	static maxNOfHours(rules: number[]) {
		return Math.max(...TimetableRule.nOfHours(rules));
	}

	maxNOfHours() {
		return TimetableRule.maxNOfHours(this.rules);
	}

	static minNOfHours(rules: number[]) {
		return Math.min(...TimetableRule.nOfHours(rules));
	}

	minNOfHours() {
		return TimetableRule.minNOfHours(this.rules);
	}

	getDay(day: number) {
		return this.rules[day] ?? 0;
	}

	static getDay(rules: number[], day: number) {
		return rules[day] ?? 0;
	}

	getHour(day: number, hour: number) {
		return this.getDay(day) & (1 << hour);
	}

	static getHour(rules: number[], day: number, hour: number) {
		return this.getDay(rules, day) & (1 << hour);
	}

	at(day: number, hour: number | [number, number]): boolean {
		if (Array.isArray(hour)) {
			return Array.from({ length: Math.abs(hour[1] - hour[0]) }).reduce(
				(prev, _, i) => prev && this.at(day, hour[0] + i),
				true
			) as boolean;
		}
		return Boolean(this.getHour(day, hour));
	}

	static at(rules: number[], day: number, hour: number): boolean {
		return Boolean(this.getHour(rules, day, hour));
	}

	avaliable() {
		return avaliable(this.rules);
	}

	removeHour(day: number, hour: number | [number, number]) {
		if (Array.isArray(hour)) {
			Array.from({ length: Math.abs(hour[1] - hour[0]) }).forEach((_, i) =>
				this.removeHour(day, hour[0] + i)
			);
			return;
		}

		this.rules[day] = this.rules[day] & ~(1 << hour);
		return;
	}

	static addHour(rules: number[], day: number, hour: number | [number, number]): number[] {
		if (Array.isArray(hour)) {
			Array.from({ length: Math.abs(hour[1] - hour[0]) }).forEach(
				(_, i) => (rules = TimetableRule.addHour(rules, day, hour[0] + i))
			);
			return rules;
		}

		rules[day] = rules[day] | (1 << hour);

		return rules;
	}

	static toggleHour(rules: number[], day: number, hour: number | [number, number]): number[] {
		if (Array.isArray(hour)) {
			Array.from({ length: Math.abs(hour[1] - hour[0]) }).forEach(
				(_, i) => (rules = TimetableRule.toggleHour(rules, day, hour[0] + i))
			);
			return rules;
		}

		rules[day] = rules[day] ^ (1 << hour);

		return rules;
	}

	toggleHour(day: number, hour: number) {
		if (Array.isArray(hour)) {
			Array.from({ length: Math.abs(hour[1] - hour[0]) }).forEach((_, i) =>
				this.toggleHour(day, hour[0] + i)
			);
			return;
		}

		this.rules[day] = this.rules[day] ^ (1 << hour);
	}
}

export const getTimeByHour = (h: number, timeUnit: number, startTime: Timestamp) => {
	if (!timeUnit && !startTime) return;
	const startDate = new Date(startTime.toMillis() + h * timeUnit * 60 * 1000);
	return `${String(startDate.getHours()).padStart(2, '0')}:${String(
		startDate.getMinutes()
	).padStart(2, '0')}`;
};

export class Timecode {
	constructor(public raw: string) {}

	get day() {
		return parseInt(this.raw.split(':')[0]);
	}

	static day(raw: string) {
		return parseInt(raw.split(':')[0]);
	}

	get hours() {
		return this.raw
			.split(':')[1]
			.split(',')
			.map((h) => parseInt(h));
	}

	static hours(raw: string) {
		return raw
			.split(':')[1]
			.split(',')
			.map((h) => parseInt(h));
	}

	static time(raw: string, timeUnit: number, startTime: Timestamp) {
		if (!timeUnit || !startTime) return;
		return Timecode.hours(raw)
			.map((h) => getTimeByHour(h, timeUnit, startTime))
			.join(' - ');
	}

	time(timeUnit: number | undefined, startTime: Timestamp | undefined) {
		if (!timeUnit || !startTime) return;
		return this.hours.map((h) => getTimeByHour(h, timeUnit, startTime)).join(' - ');
	}

	static raw(day: number, hour: number[]) {
		if (!Array.isArray(hour) || hour.length != 2) throw Error('Invalid hour');
		return `${day}:${hour.join(',')}`;
	}
}

export const getTimecode = (d: number, h: [number, number]): string | null => {
	if (!Array.isArray(h) || h.length != 2) return null;
	return `${d}:${h[0]},${h[1]}`;
};

export const isDate = (s: string) => !isNaN(Date.parse(s));

export const getLastIndex = (arr: string[], regex: RegExp): number => {
	if (!arr) return 0;
	let matches;
	for (let i = arr.length - 1; i >= 0; i--) {
		matches = arr[i].match(regex);
		if (matches && matches.length > 0) {
			return parseInt((arr[i].match(/(?<=\().+?(?=\))/g) as string[])[0]) + 1;
		}
	}
	return 1;
};

export const toBinary = (
	outputLen: number,
	arr: number[],
	index: number,
	options?: {
		restricted?: number[][];
		inverted?: boolean;
	}
) => {
	return [...Array(outputLen)].fill(1).map((_, x) => {
		if (options?.restricted && options.restricted[index][x] === 1) return 0;
		const bit = (arr[index] >> x) & 1;
		return options?.inverted ? (bit === 1 ? 0 : 1) : bit;
	});
};

export const nToAdjective = (n: number, gender: 'female' | 'male' = 'female') => {
	const CONVERT_MALE = [
		'Zeresimo',
		'Primo',
		'Secondo',
		'Terzo',
		'Quarto',
		'Quinto',
		'Sesto',
		'Settimo',
		'Ottavo',
		'Nono',
		'Decimo',
		'Undicesimo'
	];

	const CONVERT_FEMALE = [
		'Zeresima',
		'Prima',
		'Seconda',
		'Terza',
		'Quarta',
		'Quinta',
		'Sesta',
		'Settima',
		'Ottava',
		'Nona',
		'Decima',
		'Undicesima'
	];

	if (n < 0) return 'Negativa';
	else if (n > CONVERT_MALE.length - 1) return `${n}esim${gender == 'female' ? 'a' : 'o'}`;

	return gender == 'female' ? CONVERT_FEMALE[n] : CONVERT_MALE[n];
};

export function getDefaultPropic(name = 'Guest') {
	return PROPIC_FALLBACK_URL.replace('$$name$$', name);
}
