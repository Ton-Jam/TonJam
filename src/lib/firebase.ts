import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  doc, 
  getDocFromServer,
  CACHE_SIZE_UNLIMITED,
  setLogLevel
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence Firestore benign network errors 
setLogLevel('error');

const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported (measurementId is present)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;

// Initialize Firestore with settings for reliability in various network environments
const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || '(default)';

console.log(`[Firebase] Initializing Firestore. Project: ${firebaseConfig.projectId}, Database: ${firestoreDatabaseId}`);

// Use initializeFirestore with forced long polling for AI Studio environments
// Adding CACHE_SIZE_UNLIMITED and experimentalAutoDetectLongPolling: false for better stability
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  useFetchStreams: false,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
} as any, firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Add a specific test for the provided database ID
async function testConnection(retries = 3) {
  if (typeof window === 'undefined') return;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Firebase] Connection check attempt ${i + 1} for database: ${firestoreDatabaseId}...`);
      // Use getDocFromServer on a explicitly allowed path in rules
      const testDocRef = doc(db, 'test', 'connectivity');
      await getDocFromServer(testDocRef);
      console.log("[Firebase] Firestore connectivity verified.");
      return;
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const errorCode = error?.code;
      
      if (errorMessage.includes('Insufficient permissions') || errorCode === 'permission-denied') {
        console.log("[Firebase] Firestore connectivity verified (Endpoint reachable, permission denied is expected).");
        return;
      } 
      
      console.warn(`[Firebase] Connection attempt ${i + 1} failed: ${errorCode || 'unknown'} - ${errorMessage}`);
      
      if (errorCode === 'unavailable' || errorMessage.includes('offline')) {
        console.info("[Firebase] Suggestion: If this persists, try checking if the Firestore database is provisioned in the Firebase console.");
      }
      
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
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
      console.warn('Firestore Connection Issues: The app will operate in offline mode until a connection is established. This is common in some network environments.');
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
