import type { SvelteComponent } from 'svelte';
import { addDoc, deleteDoc, setDoc } from './utils';
import type { Timestamp } from 'firebase/firestore';
import type { DocumentReference } from 'firebase-admin/firestore';
import type { SvelteComponentDev } from 'svelte/internal';
export type WithTarget<Event, Target> = Event & { target: Target };

// Table
export interface TableEditorButton {
	component: typeof SvelteComponentDev;
	componentProps?: Record<string, unknown>;
}

export interface TableEditorButtons {
	delete?: TableEditorButton;
	edit?: TableEditorButton;
	create?: TableEditorButton;
}

export interface TableEditorGenericProp<D> {
	name: string;
	render?: {
		buildProps?: (element?: D | D[] | Record<string, D> | any) => Record<string, any>;
		table?: typeof SvelteComponentDev;
		modal?: typeof SvelteComponentDev;
		data?: D | D[] | Record<string, D> | any;
	};
	editable?: boolean;
	default?: string | number | object;
	type?: 'string' | 'number' | 'enum' | 'multi';
	sort?: boolean | ((reverse?: boolean) => number);
}

export interface EnumProp {
	type: 'enum';
	enumOptions: { [key: string]: string | number };
}

export interface MultiProp {
	type: 'multi';
	multiOptions: {
		max?: number;
		min?: number;
		displayMax?: number;
		data: Record<string, any> | any[];
	};
}

export interface StringProp {
	type?: 'string';
	inputOptions?: {
		minLength?: number;
		maxLength?: number;
	};
}

export interface NumberProp {
	type: 'number';
	inputOptions?: {
		min?: number;
		max?: number;
	};
}

export type TableEditorProp<
	D = any,
	T = MultiProp | EnumProp | StringProp | NumberProp
> = TableEditorGenericProp<D> & T;

export interface IncrementalPaging {
	type: 'incremental';
	currentPage?: number;
	fetchCallback: () => Promise<any>;
	setData?: (newData: any) => void;
}

export interface DefaultPaging {
	type: 'default';
	switchPage: () => Promise<void>;
}

export type TableEditorPaging<T = DefaultPaging | IncrementalPaging> = {
	pageSize: number;
} & T;

export interface AutoSave {
	type: 'auto';
	timeout?: number;
}

export interface ManualSave {
	type: 'manual';
}

interface CallbackInitializeOptions<E> {
	data: E[];
	path: string;
	identifierKey: string;
	setData: (newData: E[]) => void;
}

export class CallbacksHandler<E extends Entity = any> {
	data: E[];
	path: string;
	identifierKey: string;
	setData: (newData: E[]) => void;

	constructor(initializeOptions: CallbackInitializeOptions<E>) {
		this.data = initializeOptions.data;
		this.path = initializeOptions.path;
		this.setData = initializeOptions.setData;
		this.identifierKey = initializeOptions.identifierKey;
	}

	public async deleteEntity(element: E): Promise<boolean> {
		this.setData(this.data.filter((el) => el[this.identifierKey] != element[this.identifierKey]));
		return true;
	}

	public async editEntity(id: string, newData: E): Promise<boolean> {
		return true;
	}

	public async bulkEditEntities(queue: Record<string, E>): Promise<void> {
		Object.entries(queue).forEach(async ([id, entity]) => await this.editEntity(id, entity));
	}

	public async createEntity(newData: E): Promise<boolean> {
		return true;
	}
}
export interface TableEditorOptions {
	callbacksHandler?: CallbacksHandler;
	updateIdentifierKey?: string;
	save?: AutoSave | ManualSave;
	renderedHandler?: {
		initiallyRenderedKeys: string[] | 'all';
	};
	search?: {
		timeout?: number;
		searchKey: string;
	};
	paging?: TableEditorPaging;
	buttons?: TableEditorButtons;
}

export interface TableEditorSchema<D = any> {
	[property: string]: TableEditorProp<D>;
}

// StudentsWeek
export type ImgBBResponse = {
	data: {
		id: string;
		title: string;
		url_viewer: string;
		url: string;
		display_url: string;
		size: number;
		time: string;
		expiration: string;
		image: {
			filename: string;
			name: string;
			mime: string;
			extension: string;
			url: string;
		};
		thumb: {
			filename: string;
			name: string;
			mime: string;
			extension: string;
			url: string;
		};
		medium: {
			filename: string;
			name: string;
			mime: string;
			extension: string;
			url: string;
		};
	};
	delete_url: string;
	success: boolean;
	status: number;
};

export class FirebaseCallbacksHandler<E extends Entity = any> extends CallbacksHandler<E> {
	public async deleteEntity({ id }: E): Promise<boolean> {
		return await deleteDoc(this.path, id)
			.then(() => {
				this.setData(this.data.filter((el) => el.id !== id));
				return true;
			})
			.catch((err) => {
				console.error(err);
				return false;
			});
	}

	public async editEntity(id: string, newData: E): Promise<boolean> {
		return await setDoc({
			newData,
			path: this.path,
			pathSegments: [id],
			options: { merge: true }
		})
			.then(() => true)
			.catch((err) => {
				console.error(err);
				return false;
			});
	}

	public async createEntity(newData: E): Promise<boolean> {
		return await addDoc({
			newData,
			path: this.path
		})
			.then(() => {
				this.data.unshift(newData);
				this.setData(this.data);
				return true;
			})
			.catch((err) => {
				console.error(err);
				return false;
			});
	}
}

enum UserRole {
	ADMIN = 'admin',
	STUDENT = 'student',
	ORG = 'org'
}

export interface Entity {
	id: string;
	[key: string]: any;
}

export type TimetableRules = number[];

export interface Profile extends Entity {
	loc?: string;
	class?: string;
	email: string;
	createdAt: Timestamp;
	name: string;
	propic?: string;
	role: UserRole;
	rules?: TimetableRules;
	uid?: string;
	school: School;
}

export enum ClassesFilterType {
	All = 'all',
	Whitelist = 'whitelist',
	Blacklist = 'blacklist'
}

export interface SchoolLocation {
	name: string;
	classes: string[];
	rules: TimetableRules;
}

export interface School extends Entity {
	rules: TimetableRules;
	classes: string[];
	classesFilter: string[];
	classesFilterType: ClassesFilterType;
	currentStudents: number;
	introDescription: string;
	name: string;
	days: Timestamp[];
	numberOfHours: number;
	startTime: Timestamp;
	timeUnit: number; // mod 60
	logo?: string;
	locations?: SchoolLocation[];
	paid: boolean;
	domain?: string;
}

export type User = Profile;

export interface Course extends Entity {
	loc: string;
	name: string;
	rules: TimetableRules;
	limit: number;
	room: string;
	accepts: number;
	desc?: string;
	emoji?: string;
	unit?: number;
	org?: string;
	hours_packs?: string[];
}

export interface CourseSubscription {
	course: DocumentReference<Course> | any;
	user: Profile;
	timecode: string;
}

export interface UIError {
	message?: string;
	code: string;
}

export interface SetupExtra {
	selectedAuth?: 'email' | 'domain';
	canProceed?: boolean;
	classNumbers: number[];
	wantsFilter?: boolean;
	logoPreview?: string;
}

export enum AuthMethod {
	EmailAndPassword = 'email-pass',
	InstitutionalAccount = '3rd-party'
}
