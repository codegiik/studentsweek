import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_MEASUREMENT_ID
} from '$env/static/public';
import { browser, dev } from '$app/environment';
import { initializeApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
	ensureInitialized,
	getRemoteConfig,
	getValue,
	type RemoteConfig
} from 'firebase/remote-config';

const config: FirebaseOptions = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID,
	measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(config);

const auth = getAuth(app);
const firestore = getFirestore(app);
const remoteConfig = browser ? getRemoteConfig(app) : undefined;

const getConfigValue = async (key: string) => {
	await ensureInitialized(remoteConfig as RemoteConfig);
	return getValue(remoteConfig as RemoteConfig, key);
};

if (remoteConfig)
	remoteConfig.defaultConfig = {
		hero_bg:
			'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
	};

if (remoteConfig && dev) remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

export { app as default, firestore, auth, remoteConfig, getConfigValue };
