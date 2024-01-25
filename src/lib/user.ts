import md5 from 'md5';
import { browser } from '$app/environment';
import { derived, readable, writable, type Readable, type Writable } from 'svelte/store';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import type { CourseSubscription, School, SchoolLocation, User as Profile } from '$lib/interfaces';
import {
	collection,
	getDocs,
	getDoc,
	limit,
	query,
	where,
	doc,
	CollectionReference,
	DocumentSnapshot,
	QueryDocumentSnapshot
} from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { asyncDerivedConstistent, asyncDerivedStream } from './utils';

export const PROPIC_FALLBACK_URL =
	'https://avatar.oxro.io/avatar.png?name=$$name$$&background=random&caps=3&bold=true';

const GRAVATAR_URL = 'https://www.gravatar.com/avatar/$$hash$$?d=';

export enum UserEvents {
	LoggedIn = 'loggedIn',
	LoggedOut = 'loggedOut',
	UserChanged = 'userChanged',
	ProfileChanged = 'profileChanged',
	ProfileFetched = 'profileFetched'
}

export enum AuthStatus {
	LoggedIn = 'loggedIn',
	LoggedOut = 'loggedOut',
	Unknown = 'unknown'
}

export type SpecialDocumentRef<T> = T & {
	_: DocumentSnapshot<T> | QueryDocumentSnapshot<T>;
};

export function specialUnpack<T>(
	ref: DocumentSnapshot<T> | QueryDocumentSnapshot<T>,
	converter: (data: any) => T = (d) => d as T
): SpecialDocumentRef<T> {
	return {
		_: ref,
		...converter(ref.data())
	};
}

export function specialUnpackMulti<T>(
	ref: DocumentSnapshot<T>[] | QueryDocumentSnapshot<T>[],
	converter: (data: any) => T = (d) => d as T
): SpecialDocumentRef<T>[] {
	return ref.map((doc) => specialUnpack<T>(doc, converter));
}

export class CurrentUser {
	private _queue = new Set();
	public loading: Writable<boolean> = writable(true);
	public counter: Writable<number> = writable(0);
	public user: Readable<FirebaseUser | null> = readable<FirebaseUser | null>(null, (set) => {
		set(auth.currentUser);
		this.setAccessToken(auth.currentUser);
		this.loading.set(false);
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			set(user);
			this.setAccessToken(user);
		});
		return unsubscribe;
	});
	private _profile: Profile | 'missing' | null = null;
	private _profileDoc: DocumentSnapshot<Profile> | QueryDocumentSnapshot<Profile> | null = null;
	private _school: DocumentSnapshot<School> | null = null;
	private _location: DocumentSnapshot<SchoolLocation> | null = null;
	private _subscriptions: DocumentSnapshot<CourseSubscription>[] | null = null;

	get authStatus(): Readable<AuthStatus> {
		return derived([this.user, this.loading], ([$user, $loading], set) => {
			if ($loading) set(AuthStatus.Unknown);
			else if ($user) set(AuthStatus.LoggedIn);
			else set(AuthStatus.LoggedOut);
		});
	}

	async logout() {
		try {
			this.loading.set(true);
			this._profile = null;
			this._profileDoc = null;
			this._school = null;
			this._location = null;
			this._subscriptions = null;
			await signOut(auth);
			await this.deleteAccessToken();
			this.loading.set(false);
			this.counter.update((n) => n + 1);
		} catch (error) {
			console.error(error);
		}
	}

	get profile() {
		return asyncDerivedStream(
			[this.user, this.loading, this.counter],
			this.fetchProfile.bind(this),
			null
		);
	}

	get rawProfile(): Profile | 'missing' | null {
		return this._profile;
	}

	set rawProfile(profile: Profile | 'missing' | null) {
		this._profile = profile;
		this.counter.update((n) => n + 1);
	}

	async fetchProfile([$user, $loading, _]: [FirebaseUser | null, boolean, number]): Promise<
		Profile | null | 'missing'
	> {
		if (!browser) return null;
		_;

		if (this._profile && this._profile != 'missing') return this._profile;

		if (!$user || $loading) return null;

		if (this._queue.has('fetchProfile'))
			return await new Promise((res) => {
				const intervalId = setInterval(() => {
					if (this._profile) {
						res(this._profile);
						clearInterval(intervalId);
					}
				}, 500);

				setTimeout(() => {
					clearInterval(intervalId);
					res(null);
				}, 10000);
			});

		this._queue.add('fetchProfile');

		const q = query<Profile>(
			collection(firestore, 'users') as CollectionReference<Profile>,
			where('email', '==', $user?.email),
			limit(1)
		);
		const querySnapshot = await getDocs<Profile>(q);

		if (querySnapshot.empty) this._profile = 'missing';
		else {
			this._profileDoc = querySnapshot.docs[0];
			this._profile = querySnapshot.docs[0].data();
		}

		this._queue.delete('fetchProfile');

		return this._profile;
	}

	async setAccessToken(user: FirebaseUser | null): Promise<boolean> {
		if (!user || !browser) return false;

		const token = await user.getIdToken();

		const url = new URL(window.location.origin + '/api/access-token');
		url.searchParams.set('at', token);

		const res = await fetch(url, {
			method: 'POST'
		}).then((res) => res.ok);

		if (!res) return false;

		return res;
	}

	async deleteAccessToken(): Promise<boolean> {
		if (!browser) return false;

		const url = new URL(window.location.origin + '/api/access-token');

		const res = await fetch(url, {
			method: 'DELETE'
		}).then((res) => res.ok);

		if (!res) return false;

		return res;
	}

	get propic(): Readable<null | string> {
		return derived(this.user, ($user) => {
			const fallback = GRAVATAR_URL.replace('$$hash$$', '') + 'blank';
			if (!$user) return fallback;
			if ($user.photoURL) return $user.photoURL;
			return $user.email
				? GRAVATAR_URL.replace('$$hash$$', md5($user.email)) + 'identicon'
				: fallback;
		});
	}

	get school(): Readable<SpecialDocumentRef<School> | null> {
		return asyncDerivedConstistent(
			[this.user, this.loading, this.counter],
			this.fetchSchool.bind(this),
			null
		);
	}

	async fetchSchool([$user, $loading, _]: [
		FirebaseUser | null,
		boolean,
		number
	]): Promise<SpecialDocumentRef<School> | null> {
		if (!browser) return null;

		await this.fetchProfile([$user, $loading, _]);

		if (this._school) return specialUnpack(this._school);

		if (!this._profile || this._profile == 'missing' || $loading || !this._profile.school)
			return null;

		if (this._queue.has('fetchSchool'))
			return await new Promise((res) => {
				const intervalId = setInterval(() => {
					if (this._school) {
						res(specialUnpack(this._school));
						clearInterval(intervalId);
					}
				}, 500);

				setTimeout(() => {
					clearInterval(intervalId);
					this._queue.delete('fetchSchool');
					res(null);
				}, 10000);
			});

		this._queue.add('fetchSchool');

		const snapshot: DocumentSnapshot<School> = await getDoc(this._profile.school);

		this._school = snapshot;

		this._queue.delete('fetchSchool');

		return specialUnpack(this._school);
	}

	get location(): Readable<SpecialDocumentRef<SchoolLocation> | null> {
		return asyncDerivedConstistent(
			[this.user, this.loading, this.counter],
			this.fetchLocation.bind(this),
			null
		);
	}

	async fetchLocation([$user, $loading, _]: [
		FirebaseUser | null,
		boolean,
		number
	]): Promise<SpecialDocumentRef<SchoolLocation> | null> {
		if (!browser) return null;

		if (this._location) return specialUnpack(this._location);

		await this.fetchSchool([$user, $loading, _]);

		if (
			!this._school ||
			this._profile == 'missing' ||
			!this._school.exists() ||
			!this._profile?.loc
		)
			return null;

		const snapshot = (await getDoc(
			doc(firestore, 'schools', this._school.id, 'locations', this._profile.loc)
		)) as DocumentSnapshot<SchoolLocation>;

		this._location = snapshot;

		return specialUnpack<SchoolLocation>(this._location);
	}

	get subscriptions(): Readable<SpecialDocumentRef<CourseSubscription>[] | null> {
		return asyncDerivedStream(
			[this.user, this.loading, this.counter],
			this.fetchSubscriptions.bind(this),
			null
		);
	}

	async fetchSubscriptions([$user, $loading, _]: [FirebaseUser | null, boolean, any]): Promise<
		SpecialDocumentRef<CourseSubscription>[] | null
	> {
		if (!browser) return null;

		await this.fetchProfile([$user, $loading, _]);

		if (!this._profile || this._profile == 'missing' || !this._profileDoc || $loading || !$user)
			return null;

		const q = query<CourseSubscription>(
			collection(firestore, 'subs') as CollectionReference<CourseSubscription>,
			where('user', '==', this._profileDoc.ref)
		);
		const querySnapshot = await getDocs<CourseSubscription>(q);

		if (querySnapshot.empty) return null;

		this._subscriptions = querySnapshot.docs;

		return specialUnpackMulti<CourseSubscription>(this._subscriptions);
	}

	get subscriptionsByDay(): Readable<Record<number, SpecialDocumentRef<CourseSubscription>[]>> {
		return derived(
			this.subscriptions,
			($subs) => {
				if (!$subs) return {};

				const subsByDay: Record<number, SpecialDocumentRef<CourseSubscription>[]> = {};

				for (const sub of $subs) {
					if (!sub.timecode) continue;
					try {
						const day = Number(sub.timecode.split(':')[0]);

						if (!subsByDay[day]) subsByDay[day] = [];
						subsByDay[day].push(sub);
					} catch (e) {
						console.log(e);
						continue;
					}
				}

				return Object.fromEntries(
					Object.entries(subsByDay).map(([key, value]) => [
						key,
						value.sort(
							(a, b) =>
								Number(a.timecode.split(':')[1].split(',')[0]) -
								Number(b.timecode.split(':')[1].split(',')[0])
						)
					])
				);
			},
			{}
		);
	}
}

export const currentUser = new CurrentUser();

export default currentUser;
