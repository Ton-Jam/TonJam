import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, TwitterAuthProvider, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  CACHE_SIZE_UNLIMITED,
  setLogLevel,
  Firestore
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence Firestore benign network errors 
setLogLevel('error');

// Ensure single FirebaseApp instance without conflicting duplicate initialization
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics safely if supported and running in client environment
export const analytics: Analytics | null = 
  typeof window !== 'undefined' && firebaseConfig.measurementId 
    ? (() => {
        try {
          return getAnalytics(app);
        } catch {
          return null;
        }
      })()
    : null;

// Initialize Firestore with specific database ID from firebase-applet-config.json
const firestoreDatabaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

console.log(`[Firebase] Initializing Firestore. Project: ${firebaseConfig.projectId}, Database: ${firestoreDatabaseId}`);

// Use initializeFirestore with safe fallback if already started
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
  } as any, firestoreDatabaseId);
} catch {
  dbInstance = getFirestore(app, firestoreDatabaseId);
}

export const db: Firestore = dbInstance;

export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

// Safe background connection check without throwing blocking offline errors
async function testConnection() {
  if (typeof window === 'undefined') return;
  try {
    const testDocRef = doc(db, 'test', 'connectivity');
    await getDoc(testDocRef);
    console.log("[Firebase] Firestore connectivity initialized.");
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code;
    if (errorMessage.includes('Insufficient permissions') || errorCode === 'permission-denied') {
      console.log("[Firebase] Firestore connectivity verified.");
    } else {
      console.info("[Firebase] Firestore operating in offline/client mode:", errorCode || errorMessage);
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
