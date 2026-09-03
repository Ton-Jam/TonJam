import firebaseConfig from '../../firebase-applet-config.json';
import { app, db, auth } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export interface FirebaseDiagnosticReport {
  timestamp: string;
  configValidation: {
    isValid: boolean;
    missingFields: string[];
    projectId?: string;
    authDomain?: string;
    firestoreDatabaseId?: string;
    hasApiKey: boolean;
    hasAppId: boolean;
  };
  appStatus: {
    initialized: boolean;
    name?: string;
    optionsProjectId?: string;
  };
  firestoreStatus: {
    targetDatabaseId: string;
    connectionAttempted: boolean;
    connected?: boolean;
    error?: string;
  };
  authStatus: {
    initialized: boolean;
    currentUser: string | null;
  };
}

/**
 * Runs diagnostics on Firebase configuration and connectivity.
 * Logs structured diagnostic details to the console for easy troubleshooting.
 */
export async function runFirebaseDiagnostics(): Promise<FirebaseDiagnosticReport> {
  console.groupCollapsed('%c[Firebase Diagnostic] Running Environment & Initialization Checks...', 'color: #3b82f6; font-weight: bold;');

  const requiredFields: (keyof typeof firebaseConfig)[] = [
    'projectId',
    'apiKey',
    'authDomain',
    'appId'
  ];

  const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);

  const report: FirebaseDiagnosticReport = {
    timestamp: new Date().toISOString(),
    configValidation: {
      isValid: missingFields.length === 0,
      missingFields: missingFields as string[],
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      firestoreDatabaseId: (firebaseConfig as any).firestoreDatabaseId || '(default)',
      hasApiKey: Boolean(firebaseConfig.apiKey),
      hasAppId: Boolean(firebaseConfig.appId),
    },
    appStatus: {
      initialized: Boolean(app),
      name: app?.name,
      optionsProjectId: app?.options?.projectId,
    },
    firestoreStatus: {
      targetDatabaseId: (firebaseConfig as any).firestoreDatabaseId || '(default)',
      connectionAttempted: true,
    },
    authStatus: {
      initialized: Boolean(auth),
      currentUser: auth?.currentUser?.uid || null,
    },
  };

  console.log('1. Configuration Validation:', {
    status: report.configValidation.isValid ? '✅ Valid' : '❌ Incomplete',
    projectId: report.configValidation.projectId,
    authDomain: report.configValidation.authDomain,
    firestoreDatabaseId: report.configValidation.firestoreDatabaseId,
    missingFields: report.configValidation.missingFields,
  });

  console.log('2. Firebase App Instance:', {
    initialized: report.appStatus.initialized ? '✅ Ready' : '❌ Not Initialized',
    name: report.appStatus.name,
    boundProjectId: report.appStatus.optionsProjectId,
  });

  console.log('3. Auth Service:', {
    initialized: report.authStatus.initialized ? '✅ Ready' : '❌ Not Initialized',
    currentUser: report.authStatus.currentUser || 'No active session (guest mode)',
  });

  // Attempt Firestore probe connection
  try {
    const probeDocRef = doc(db, '_connection_probe', 'health_check');
    await getDocFromServer(probeDocRef);
    report.firestoreStatus.connected = true;
    console.log('4. Firestore Connectivity: ✅ Connected to Firestore backend');
  } catch (err: any) {
    // A permission-denied or not-found from the server confirms the network connection and database exist
    if (err?.code === 'permission-denied' || err?.code === 'not-found') {
      report.firestoreStatus.connected = true;
      console.log('4. Firestore Connectivity: ✅ Connected (Server responded: ' + err.code + ')');
    } else {
      report.firestoreStatus.connected = false;
      report.firestoreStatus.error = err?.message || String(err);
      console.log('4. Firestore Connectivity: ⚠️ Offline/Warning - ' + (err?.message || err));
    }
  }

  console.groupEnd();
  return report;
}

export { 
  verifyUserProfileIntegrity, 
  logProfileIntegrityReport 
} from './profileIntegrityDiagnostics';
export type { 
  ProfileIntegrityReport, 
  ProfileFieldDiscrepancy, 
  IntegrityStatus 
} from './profileIntegrityDiagnostics';
