import { getAuth } from 'firebase-admin/auth';
import { invalid, type Actions } from '@sveltejs/kit';
import { getFirestore } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export const actions: Actions = {
	default: ({ request, cookies }) => {
		//		const access_token = cookies.get('access_token');
		//		const data = await request.formData();
		//		const code = data.get('code') as string;
		//		let user: DecodedIdToken;
		//
		//		if (!access_token) return invalid(400, { error: { code: 'auth/invalid-token' } });
		//		if (!code || code?.length < 16)
		//			return invalid(400, { error: { code: 'activation/invalid-code' } });
		//
		//		try {
		//			user = await getAuth(firebaseAdmin).verifyIdToken(access_token);
		//		} catch (e) {
		//			return invalid(401, { error: { code: 'auth/invalid-token' } });
		//		}
		//
		//		try {
		//			const doc = await getFirestore(firebaseAdmin).collection('users').doc(code).get();
		//
		//			if (!doc.exists) return invalid(400, { error: { code: 'activation/invalid-code' } });
		//			if (doc.get('email'))
		//				return invalid(400, { error: { code: 'activation/code-already-used' } });
		//
		//			await getFirestore(firebaseAdmin).collection('users').doc(code).update({
		//				uid: user.uid,
		//				email: user.email
		//			});
		//		} catch (e) {
		//			return invalid(400, {
		//				error: {
		//					code: 'auth/invalid-code'
		//				}
		//			});
		//		}
		//
		//		throw redirect(302, '/dashboard');
	}
};
