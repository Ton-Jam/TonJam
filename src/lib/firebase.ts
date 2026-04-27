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
console.log(`[Firebase] Initializing Firestore. DatabaseID: ${firestoreDatabaseId}`);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true,
}, firestoreDatabaseId);

export const auth = getAuth();
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Validates connection to Firestore
 * CRITICAL CONSTRAINT: When the application initially boots, call getFromServer to test the connection.
 */
async function testConnection() {
  try {
    // Try to reach the specific database instance
    await getDocFromServer(doc(db, 'test', 'connection_check'));
    console.log("Firestore connection check: Server is reachable.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Missing or insufficient permissions')) {
        console.warn("Firestore connection check: Server is reachable but requires Firestore Rules to be published.");
      } else if (error.message.includes('unavailable') || error.message.includes('the client is offline')) {
        console.warn(
          "Firestore backend is currently unreachable. The app will continue in offline mode (using mock data).\n" +
          "Reason: " + error.message
        );
      } else {
        console.warn("Firestore connectivity check failed (falling back to offline mode):", error.message);
      }
    }
  }
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
