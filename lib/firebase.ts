import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  Auth,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firestoreDatabaseId =
  process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';

// Singleton — évite la double initialisation en HMR (Next.js dev)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserSessionPersistence).catch(console.error);
}

export const db: Firestore = getFirestore(app, firestoreDatabaseId);

export const functions: Functions = getFunctions(app, 'europe-west1');

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'dummy_key'
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn('App Check initialization failed:', e);
  }
}

if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  console.info('[Firebase] Mode émulateur actif');
}

export default app;
