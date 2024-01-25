import firebaseAdmin from './firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import type { Course, Profile, School, SchoolLocation } from '$lib/interfaces';
import type { TimetableRule } from '$lib/utils';
import type { QueryDocumentSnapshot, DocumentSnapshot } from 'firebase-admin/firestore';

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

export const getUserProfile = async (
	access_token: string
): Promise<[DecodedIdToken | null, SpecialDocumentRef<Profile> | null]> => {
	try {
		const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(access_token);

		const profileSnapshot = await getFirestore(firebaseAdmin)
			.collection('users')
			.where('email', '==', decodedToken.email)
			.limit(1)
			.get();

		let profile: null | SpecialDocumentRef<Profile> = null;

		if (profileSnapshot.empty) profile = null;
		else
			profile = specialUnpack<Profile>(profileSnapshot.docs[0] as QueryDocumentSnapshot<Profile>);

		return [decodedToken, profile];
	} catch (error) {
		return [null, null];
	}
};

export const getSchoolsProfile = async (profile: Profile): Promise<School | null> => {
	if (!profile || !profile.school) return null;

	return await profile.school.get();
};

export const getProfileLocation = async (profile: Profile): Promise<SchoolLocation | null> => {
	if (!profile || !profile.loc) return null;

	const locationSnapshot = await getFirestore(firebaseAdmin)
		.collection('schools')
		.doc(profile.school.id)
		.collection('locations')
		.doc(profile.loc)
		.get();

	if (!locationSnapshot.exists) return null;

	return locationSnapshot.data() as SchoolLocation;
};

export const getCourseById = async (id: string): Promise<SpecialDocumentRef<Course> | null> => {
	const courseSnapshot = await getFirestore(firebaseAdmin).collection('courses').doc(id).get();

	if (!courseSnapshot.exists) return null;

	return specialUnpack<Course>(courseSnapshot as QueryDocumentSnapshot<Course>);
};

export const updateProfileRules = async (
	profile: SpecialDocumentRef<Profile>,
	newRules: TimetableRule
) => {
	await profile._.ref.update({
		rules: newRules.rules
	});
};

export const getCourseSubsCount = async (course: SpecialDocumentRef<Course>, timecode: string) => {
	const subSnapshot = await getFirestore(firebaseAdmin)
		.collection('subs')
		.where('course', '==', course._.ref)
		.where('timecode', '==', timecode)
		.count()
		.get();

	return subSnapshot.data().count;
};

export const subscribeToCourseAtTimecode = async (
	profile: SpecialDocumentRef<Profile>,
	coures: SpecialDocumentRef<Course>,
	timecode: string
) => {
	await getFirestore(firebaseAdmin).collection('subs').add({
		course: coures._.ref,
		timecode,
		user: profile._.ref
	});
};
