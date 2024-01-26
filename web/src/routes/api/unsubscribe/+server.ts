import type { Profile } from '$lib/interfaces';
import {
	getCourseById,
	getCourseSubsCount,
	getProfileLocation,
	getUserProfile,
	specialUnpack
} from '$lib/server/utils';
import { getHoursSchemaByRuleAndUnit, Timecode, TimetableRule } from '$lib/utils';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { firestore } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request }) => {
	const { at, s } = await request.json();
	if (!at || !s) throw error(400, 'Incomplete Request');

	const [user, profile] = await getUserProfile(at);

	if (!user) throw error(401, 'Invalid Token');
	if (!profile) throw error(404, 'Profile Not Found. Is this user subscribed to a school?');
	if (profile?.role != 'admin') throw error(401, 'This user is not an admin');

	const subSnap = await getFirestore()
		.collection('subs')
		.doc(s)
		.get()
		.catch((e) => {
			throw error(500, e.message);
		});

	if (!subSnap.exists) throw error(404, 'Subscription Not Found');

	const sub = specialUnpack(subSnap);

	const subbeduserSnap = (await sub.user.get()) as DocumentSnapshot<Profile>;

	if (!subbeduserSnap.exists) throw error(404, 'User Not Found');
	const subbeduser = specialUnpack<Profile>(subbeduserSnap);

	if (subbeduser.role == 'admin') throw error(401, 'You cannot unsubscribe an admin');
	if (!subbeduser?.rules) throw error(400, 'Invalid User');

	const course = await getCourseById(sub.course.id);
	if (!course || !course.unit) throw error(404, 'Course Not Found');

	const count = await getCourseSubsCount(course, sub.timecode);

	const timecode = new Timecode(sub.timecode);

	if (count - 1 < course.limit) {
		await course._.ref.update({
			rules: TimetableRule.addHour(course.rules, timecode.day, timecode.hours as [number, number])
		});
	}

	await sub._.ref.delete();

	const countuserSnap = await getFirestore()
		.collection('subs')
		.where('user', '==', sub.user)
		.where('timecode', '==', sub.timecode)
		.count()
		.get();

	const countuser = countuserSnap.data().count;

	if (countuser == 0) {
		await subbeduser._.ref.update({
			rules: TimetableRule.addHour(
				subbeduser.rules,
				timecode.day,
				timecode.hours as [number, number]
			)
		});
	}

	return json({ success: true });
};
