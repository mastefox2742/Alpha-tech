// ─────────────────────────────────────────────────────────────────────────────
// firebase.config.ts
// Configuration sécurisée du SDK Firebase côté client.
//
// RÈGLES D'OR :
//   1. Ne jamais committer ce fichier avec de vraies clés → utiliser .env
//   2. Ces clés sont PUBLIQUES par conception (elles ne donnent aucun accès
//      sans authentification). La sécurité réside dans les Firestore Rules.
//   3. Activer l'App Check pour bloquer les appels hors de votre domaine.
// ─────────────────────────────────────────────────────────────────────────────

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
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

import firebaseConfig from '../firebase-applet-config.json';

// ── Singleton — évite la double initialisation en HMR (Next.js dev) ──────────
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth: Auth = getAuth(app);

// Persistance SESSION uniquement (expire à la fermeture du navigateur).
// Jamais LOCAL pour une app sensible.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserSessionPersistence).catch(console.error);
}

// ── Firestore ─────────────────────────────────────────────────────────────────
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// ── Cloud Functions ───────────────────────────────────────────────────────────
export const functions: Functions = getFunctions(app, 'europe-west1'); // région proche de Brazzaville

// ── App Check (anti-abus) ─────────────────────────────────────────────────────
// Active uniquement en production.
// Bloque les appels API provenant d'outils comme Postman ou de scripts malveillants.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'dummy_key'
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("App Check initialization failed:", e);
  }
}

// ── Émulateurs locaux (développement uniquement) ──────────────────────────────
// `firebase emulators:start` → tout tourne en local, aucune donnée de prod touchée.
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth,      'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db,   '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);

  // Cache Firestore hors-ligne (pratique en dev, à désactiver en SSR)
  enableIndexedDbPersistence(db).catch(() => {
    // Ignore si déjà actif dans un autre onglet
  });

  console.info('[Firebase] Mode émulateur actif');
}

export default app;
