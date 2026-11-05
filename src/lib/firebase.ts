import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase, ref, set, get, update, remove, onValue, Database } from 'firebase/database';

/**
 * PRODUCTION DEFAULT CONFIGURATION
 * Hardcoded directly with the Realtime Database URL:
 * https://satarupa-project-default-rtdb.firebaseio.com/
 * This guarantees that when the repository is deployed to Vercel, mobile,
 * or local preview without environment variables, the app connects immediately.
 */
export const DEFAULT_FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0564196108',
  appId: '1:368637107799:web:2421a2404bf79a7f028d12',
  apiKey: 'AIzaSyBNqFtjJH6ZV-lccZ1hAtq5wHGzE_WMqK8',
  authDomain: 'gen-lang-client-0564196108.firebaseapp.com',
  databaseURL: 'https://satarupa-project-default-rtdb.firebaseio.com/',
  storageBucket: 'gen-lang-client-0564196108.firebasestorage.app',
  messagingSenderId: '368637107799',
  measurementId: '',
  oAuthClientId: '368637107799-neti6uaifv5g70dakme0b5vmuo4612sk.apps.googleusercontent.com',
  recaptchaSiteKey: '',
};

// Supports import.meta.env overrides while falling back to DEFAULT_FIREBASE_CONFIG
export const firebaseConfig = {
  projectId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
    DEFAULT_FIREBASE_CONFIG.projectId,
  appId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) ||
    DEFAULT_FIREBASE_CONFIG.appId,
  apiKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) ||
    DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
    DEFAULT_FIREBASE_CONFIG.authDomain,
  databaseURL:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DATABASE_URL) ||
    DEFAULT_FIREBASE_CONFIG.databaseURL,
  storageBucket:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  measurementId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
    DEFAULT_FIREBASE_CONFIG.measurementId,
  oAuthClientId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_OAUTH_CLIENT_ID) ||
    DEFAULT_FIREBASE_CONFIG.oAuthClientId,
  recaptchaSiteKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_RECAPTCHA_SITE_KEY) ||
    DEFAULT_FIREBASE_CONFIG.recaptchaSiteKey,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
export const rtdb: Database = getDatabase(app, firebaseConfig.databaseURL);
export const db = rtdb; // primary database export

// Initialize Firebase Auth with persistent local storage
export const auth = getAuth(app);
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase setPersistence notice:', err);
  });
} catch {
  // Ignore in environments where window is not fully ready
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
