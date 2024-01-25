import { firestore } from '$lib/firebase';
import type { Course, School } from '$lib/interfaces';
import { specialUnpackMulti, type SpecialDocumentRef } from '$lib/user';
import { asyncDerivedConstistent } from '$lib/utils';
import type { DocumentSnapshot, CollectionReference } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { writable, type Readable } from 'svelte/store';
import type { DocumentReference } from 'firebase/firestore';

export class CourseStore {
	public _courses: DocumentSnapshot<Course>[] | null = null;
	public school = writable<DocumentReference<School> | null>(null);
	public location = writable<string | null>(null);

	get courses(): Readable<SpecialDocumentRef<Course>[] | null> {
		return asyncDerivedConstistent<DocumentReference<School> | null>(
			[this.school, this.location],
			this.fetchCourses.bind(this),
			null
		);
	}

	courseByPath(path: string | undefined): Readable<SpecialDocumentRef<Course> | null> {
		return asyncDerivedConstistent<SpecialDocumentRef<Course>[] | null>(
			[this.courses, this.school, this.location],
			async ([$courses, $school, $location]: [
				SpecialDocumentRef<Course>[] | null,
				DocumentReference<School> | null,
				string | null
			]) => {
				await this.fetchCourses([$school, $location]);

				if (!$courses || !path) return null;

				return $courses.find((c) => c._.ref.path == path);
			},
			null
		);
	}

	async fetchCourses([$school, $location]: [
		DocumentReference<School> | null,
		string | null
	]): Promise<SpecialDocumentRef<Course>[] | null> {
		if (!$school || !$location) return null;

		if (this._courses) return specialUnpackMulti<Course>(this._courses);

		const q = query<Course>(
			collection(firestore, 'courses') as CollectionReference<Course>,
			where('school', '==', $school),
			where('loc', '==', $location)
		);

		const snapshot = await getDocs<Course>(q);

		this._courses = snapshot.docs;

		return specialUnpackMulti<Course>(this._courses);
	}
}

export const courseStore = new CourseStore();
