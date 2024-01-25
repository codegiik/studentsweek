import type Stripe from 'stripe';
import { error } from '@sveltejs/kit';
import stripe from '$lib/server/stripe';
import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';
import { db } from '$lib/server/firebase-admin';

const ENDPOINT_SECRET =
	env.SECRET_STRIPE_ENDPOINT_SECRET ||
	'whsec_46db2d3d631a8e2cde0fae98386dbd727fd16edd37100a301379886b638663a2'; // TESTING API KEY

export const POST: RequestHandler = async ({ request }) => {
	let event: Stripe.Event | undefined;
	const body = await request.text();

	const signature = request.headers.get('stripe-signature');
	if (!signature) throw error(400, 'Signature not provided');

	try {
		event = stripe.webhooks.constructEvent(body, signature, ENDPOINT_SECRET);
	} catch (err) {
		console.error('Webhook signature verification failed', (err as Error).message);
		throw error(500, 'Could not construct event');
	}

	if (event.type !== 'checkout.session.completed') {
		console.log('Unrecognized event', event.type);
		return new Response(undefined, { status: 200 });
	}

	const { schoolId, userEmail } = (event.data.object as Record<string, any>).metadata;

	if (!schoolId) {
		console.error('School id not supplied');
		throw error(400, 'School id not supplied.');
	} else if (!userEmail) {
		console.error('User email not supplied');
		throw error(400, 'User email not supplied.');
	}

	const batch = db.batch();

	batch.set(db.doc(`schools/${schoolId}`), { paid: true }, { merge: true });

	batch.set(
		db.doc(`users/${userEmail}`),
		{
			school: db.doc(`schools/${schoolId}`),
			role: 'admin',
			email: userEmail
		},
		{ merge: true }
	);

	await batch.commit();

	return new Response('Event registered correctly', { status: 200 });
};
