import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';

/**
 * PRODUCTION DEFAULT CONFIGURATION
 * Hardcoded directly as fallback so when the repository is pushed to GitHub
 * and deployed on Vercel without environment variables, the live application
 * connects immediately to the production Firestore and Auth without crashing.
 */
export const DEFAULT_FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0564196108',
  appId: '1:368637107799:web:2421a2404bf79a7f028d12',
  apiKey: 'AIzaSyBNqFtjJH6ZV-lccZ1hAtq5wHGzE_WMqK8',
  authDomain: 'gen-lang-client-0564196108.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-artisancraftshow-7828a95e-8182-4d23-b6ac-0519286a4de8',
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
  firestoreDatabaseId:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DATABASE_ID) ||
    DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
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

/**
 * Initialize Firestore with graceful multi-tab & offline persistence.
 * If running in an environment where multi-tab persistence is unsupported,
 * falls back cleanly to standard getFirestore.
 */
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase setPersistence notice:', err);
  });
} catch (e) {
  // Ignore in environments where window is not fully ready
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});



export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot per Firebase guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client persistence active in offline/cache mode.');
    }
  }
}

testConnection();
