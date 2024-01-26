import { initializeApp, cert } from 'firebase-admin/app';
import { SECRET_FIREBASE_SERVICE_KEY } from '$env/static/private';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = JSON.parse(SECRET_FIREBASE_SERVICE_KEY);

const app = initializeApp({
	credential: cert(serviceAccountKey)
});

const firestore = getFirestore(app);

export { app as default, firestore as db };
