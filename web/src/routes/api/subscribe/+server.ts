import type { Course } from '$lib/interfaces';
import {
	getCourseById,
	getCourseSubsCount,
	getProfileLocation,
	getUserProfile,
	subscribeToCourseAtTimecode,
	updateProfileRules
} from '$lib/server/utils';
import { getHoursSchemaByRuleAndUnit, getTimecode, TimetableRule } from '$lib/utils';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { at, h, d, c } = await request.json();
	if (!at || !h || d === undefined || d === null || !c) throw error(400, 'Incomplete Request');
	if (
		!Array.isArray(h) ||
		(Array.isArray(h) && h.length != 2) ||
		isNaN(d) ||
		h?.reduce((prev, curr) => prev || isNaN(curr), false)
	)
		throw error(400, 'Invalid Parameters');

	const [user, profile] = await getUserProfile(at);

	if (!user) throw error(401, 'Invalid Token');
	if (!profile || !profile.rules)
		throw error(404, 'Profile Not Found. Is this user subscribed to a school?');

	const course = await getCourseById(c);
	if (!course || !course.unit) throw error(404, 'Course Not Found');

	const location = await getProfileLocation(profile);
	if (!location) throw error(404, 'Location Not Found');

	const inHourSchema = getHoursSchemaByRuleAndUnit(location.rules[d], course.unit)
		.map((h) => h.join(','))
		.includes(h.join(','));

	if (!inHourSchema) throw error(400, 'Invalid Hour Range. Course is not offered at this time');

	const rules = new TimetableRule(location.rules);

	rules.collide(course.rules, profile.rules);

	const profileRules: TimetableRule = new TimetableRule(profile.rules);

	if (!rules.at(d, h as [number, number])) throw error(400, 'Time Conflict');
	else {
		const timecode = getTimecode(d, h as [number, number]);

		if (!timecode) throw error(500, 'Internal Server Error');

		await subscribeToCourseAtTimecode(profile, course, timecode);

		const count = await getCourseSubsCount(course, timecode);

		if (count >= course.limit) {
			const courseRules = new TimetableRule(course.rules);
			courseRules.removeHour(d, h as [number, number]);

			await course._.ref.update({
				rules: courseRules.rules
			});
		}

		profileRules.removeHour(d, h as [number, number]);
		await updateProfileRules(profile, profileRules);
	}

	return json({
		message: 'Success',
		rules: profileRules.rules
	});
};
