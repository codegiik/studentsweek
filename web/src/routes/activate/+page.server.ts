import { AuthMethod } from '$lib/interfaces';
import firebaseAdmin from '$lib/server/firebase-admin';
import { getUserProfile } from '$lib/server/utils';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const access_token = cookies.get('access_token');

	if (!access_token) throw redirect(302, '/login');

	const [user, profile] = await getUserProfile(access_token);

	if (profile?.role == 'admin') throw redirect(302, '/admin');

	if (profile && profile.rules) throw redirect(302, '/dashboard');

	if (!user || !user.email) throw redirect(302, '/login');
	else if (user.firebase.sign_in_provider != 'password') {
		const firestore = getFirestore(firebaseAdmin);

		try {
			const domain_regex = new RegExp('^.*?@(.+?)$');
			const domain_match = domain_regex.exec(user?.email);
			if (!domain_match || domain_match.length < 2)
				return {
					authMethod: AuthMethod.InstitutionalAccount,
					error: {
						code: 'auth/invalid-email'
					}
				};

			const domain = domain_match[1];

			const schoolSnap = await firestore
				.collection('schools')
				.where('domain', '==', domain)
				.limit(1)
				.get();

			if (schoolSnap.empty)
				return {
					authMethod: AuthMethod.InstitutionalAccount,
					error: {
						code: 'auth/inexistent-domain'
					}
				};

			const schoolDoc = schoolSnap.docs[0];

			if (!profile)
				firestore
					.collection('users')
					.doc(user.uid)
					.create({
						email: user.email,
						school: schoolDoc.ref
					})
					.catch((err) => {
						console.error(err);
					});

			const schoolData = schoolDoc.data();

			return {
				authMethod: AuthMethod.InstitutionalAccount,
				school: {
					classes: schoolData.classes,
					domain: schoolData.domain,
					name: schoolData.name,
					logo: schoolData?.logo
				}
			};
		} catch (error) {
			console.log(error);
		}
	}

	return {
		authMethod: AuthMethod.EmailAndPassword
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const access_token = cookies.get('access_token');
		const data = await request.formData();
		let user: DecodedIdToken;

		if (!access_token) return fail(400, { error: { code: 'auth/fail-token' } });

		try {
			user = await getAuth(firebaseAdmin).verifyIdToken(access_token);
		} catch (e) {
			return fail(401, { error: { code: 'auth/fail-token' } });
		}

		if (user.firebase.sign_in_provider == 'password') {
			try {
				const code = data.get('code') as string;
				if (!code || code?.length < 16)
					return fail(400, { error: { code: 'activation/fail-code' } });

				const doc = await getFirestore(firebaseAdmin).collection('users').doc(code).get();

				if (!doc.exists) return fail(400, { error: { code: 'activation/fail-code' } });
				if (doc.get('email')) return fail(400, { error: { code: 'activation/code-already-used' } });

				const userDoc = doc?.data();
				if (!userDoc) return fail(400, { error: { code: 'activation/fail-code' } });

				const schoolDoc = await userDoc.school.get();
				const schoolData = schoolDoc.data();

				await getFirestore(firebaseAdmin).collection('users').doc(code).update({
					email: user.email,
					rules: schoolData.rules
				});
			} catch (e) {
				return fail(400, {
					error: {
						code: 'auth/fail-code'
					}
				});
			}
		} else {
			try {
				const userClass = data.get('class') as string;

				const userSnap = await getFirestore(firebaseAdmin).collection('users').doc(user.uid).get();

				if (!userSnap.exists) return fail(400, { error: { code: 'auth/invalid-profile' } });

				const userDoc = userSnap.data();

				if (!userDoc) return fail(400, { error: { code: 'auth/invalid-profile' } });

				const locSnap = await userDoc.school
					.collection('locations')
					.where('classes', 'array-contains', userClass)
					.limit(1)
					.get();

				if (locSnap.empty) return fail(400, { error: { code: 'activation/invalid-class' } });

				const locDoc = locSnap.docs[0];

				await getFirestore(firebaseAdmin).collection('users').doc(user.uid).update({
					class: userClass,
					loc: locDoc.ref.id,
					rules: locDoc.data()?.rules
				});
			} catch (e) {
				return fail(500, {
					error: {
						code: 'general/try-again'
					}
				});
			}
		}

		throw redirect(302, '/dashboard');
	}
};
