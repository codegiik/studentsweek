import stripe from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
import type { ImgBBResponse, School } from '$lib/interfaces';

import { db } from '$lib/server/firebase-admin';
import { getUserProfile } from '$lib/server/utils';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

const getUserEmail = async (accessToken: string) => {
	const [user] = await getUserProfile(accessToken);

	if (!user) throw new Error('User not found.');

	return user.email;
};

const createSchool = async (school: School) => {
	const payload = Object.fromEntries(
		Object.keys(school)
			.filter((k) => school[k] !== undefined)
			.map((k) => [k, school[k]])
	);

	delete payload.locations;
	payload.days = school.days.map((d) => new Timestamp(d.seconds, d.nanoseconds));
	payload.startTime = new Timestamp(school.startTime.seconds, school.startTime.nanoseconds);

	const schoolRef = await db.collection('schools').add({
		...payload,
		paid: false
	});

	if (!schoolRef) throw new Error('Could not create entity.');

	if (school.locations) {
		const batch = db.batch();

		let d: DocumentReference;
		school.locations?.forEach((location, i) => {
			d = db.doc(`schools/${schoolRef.id}/locations/${i + 1}`);
			batch.set(d, location);
		});

		await batch.commit();
	}

	return schoolRef.id;
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const accessToken = cookies.get('access_token');

	if (!accessToken) throw redirect(302, '/login');

	const form = await request.formData();
	const payload = form.get('payload');

	if (!payload) throw error(400, 'Payload not found.');
	const school: School = JSON.parse(payload.toString());

	if (school.logo && env.SECRET_IMGBB_API_KEY) {
		const form = new FormData();
		form.append('image', school.logo.slice(school.logo.indexOf(',') + 1));

		await fetch(`https://api.imgbb.com/1/upload?key=${env.SECRET_IMGBB_API_KEY}`, {
			method: 'POST',
			body: form
		})
			.then((r) => r.json())
			.then((r: ImgBBResponse) => {
				if (r.status === 200) school.logo = r.data.medium.url;
			})
			.catch((err) => {
				console.error(err);
				delete school.logo;
			});
	} else delete school.logo;

	let schoolId, userEmail: string | undefined;
	try {
		schoolId = await createSchool(school);
		userEmail = await getUserEmail(accessToken);
	} catch (err) {
		throw error(500, (err as Error).message);
	}

	if (!schoolId) return new Response('Could not create entity', { status: 500 });

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: 'price_1MDsz6BFf10upAzqzxol8BLE',
				quantity: 1
			}
		],
		mode: 'payment',
		allow_promotion_codes: true,
		metadata: {
			userEmail,
			schoolId
		},
		success_url: `${
			process.env.SECRET_DOMAIN_NAME || 'http://localhost:5173'
		}/admin/setup/payment-complete?success=true&schoolId=${schoolId}`,
		cancel_url: `${
			process.env.SECRET_DOMAIN_NAME || 'http://localhost:5173'
		}/admin/setup/payment-complete?success=false`
	});

	if (session.url) throw redirect(302, session.url);

	return new Response('Invalid response received.', {
		status: 400
	});
};
