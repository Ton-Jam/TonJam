import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported (measurementId is present)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;

// Initialize Firestore with settings for reliability in various network environments
const firestoreDatabaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
console.log('[Firebase] Debug Config:', {
  projectId: firebaseConfig.projectId,
  databaseId: firestoreDatabaseId,
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain
});
console.log(`[Firebase] Initializing Firestore. Project: ${firebaseConfig.projectId}, DatabaseID: ${firestoreDatabaseId}, Host: firestore.googleapis.com`);

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
}, firestoreDatabaseId);

export const auth = getAuth();
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Validates connection to Firestore
 * CRITICAL CONSTRAINT: When the application initially boots, call getFromServer to test the connection.
 */
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Firebase] Connection check attempt ${i + 1}...`);
      // Try to reach the specific database instance
      await getDocFromServer(doc(db, 'test', 'connection_check'));
      console.log("[Firebase] Firestore connection check: Server is reachable.");
      return;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Missing or insufficient permissions')) {
          console.warn("[Firebase] Firestore connection check: Server is reachable but requires Firestore Rules to be published.");
          return;
        } else if (error.message.includes('unavailable') || error.message.includes('the client is offline')) {
          console.warn(`[Firebase] Connection attempt ${i + 1} failed: ${error.message}`);
          if (i < retries - 1) {
            const delay = Math.pow(2, i) * 1000;
            console.log(`[Firebase] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        console.warn(`[Firebase] Firestore connectivity check failed on attempt ${i + 1}:`, error.message);
      }
    }
  }
  console.error("[Firebase] All Firestore connection attempts failed. The app will operate in limited offline mode.");
}
testConnection();

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  // Log the error but do NOT throw to prevent fatal app crashes
  if (errInfo.error.includes('offline') || errInfo.error.includes('unavailable')) {
    // Only log connection errors once to avoid spamming the console
    if (!(window as any)._firestoreConnectionErrorLogged) {
      console.warn('Firestore Connection Issues: The app will operate in offline mode until a connection is established.');
      (window as any)._firestoreConnectionErrorLogged = true;
    }
  } else {
    console.warn('Firestore Error Detected (Gracefully Handled):', JSON.stringify(errInfo));
  }
}

export function cleanUpdateData(data: Record<string, any>) {
  const cleaned = { ...data };
  delete cleaned.id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;

  const removeUndefined = (obj: any) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        removeUndefined(obj[key]);
      }
    });
  };
  
  removeUndefined(cleaned);

  return cleaned;
}
