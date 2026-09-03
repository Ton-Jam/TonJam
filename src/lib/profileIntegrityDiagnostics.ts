import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserProfile } from '@/types';

export type DiscrepancySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProfileFieldDiscrepancy {
  field: string;
  firestoreValue: any;
  cachedValue: any;
  severity: DiscrepancySeverity;
  description: string;
}

export type IntegrityStatus = 
  | 'SYNCHRONIZED' 
  | 'DISCREPANCY_DETECTED' 
  | 'REMOTE_NOT_FOUND' 
  | 'LOCAL_NOT_FOUND' 
  | 'OFFLINE_UNAVAILABLE';

export interface ProfileIntegrityReport {
  timestamp: string;
  userId: string;
  userEmail: string | null;
  status: IntegrityStatus;
  isRoleDiscrepancy: boolean;
  isAdminDiscrepancy: boolean;
  isVerifiedDiscrepancy: boolean;
  isPrivilegeEscalationRisk: boolean;
  discrepancies: ProfileFieldDiscrepancy[];
  firestoreState: {
    exists: boolean;
    role?: string;
    isAdmin?: boolean;
    verified?: boolean;
    isVerifiedArtist?: boolean;
    verificationStatus?: string;
    walletAddress?: string;
    raw?: Record<string, any>;
  };
  cachedState: {
    exists: boolean;
    role?: string;
    isAdmin?: boolean;
    verified?: boolean;
    isVerifiedArtist?: boolean;
    verificationStatus?: string;
    walletAddress?: string;
    raw?: Record<string, any>;
  };
  summary: string;
  reconciliationSuggested: boolean;
}

/**
 * Diagnostic utility that compares the authoritative Firestore user document
 * against the local AuthContext cache (and in-memory profile), specifically
 * analyzing 'role', 'verified', and 'isAdmin' flags for potential discrepancies.
 */
export async function verifyUserProfileIntegrity(options?: {
  userId?: string;
  currentProfile?: UserProfile | null;
  preferServer?: boolean;
}): Promise<ProfileIntegrityReport> {
  const targetUid = options?.userId || auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email || null;

  const timestamp = new Date().toISOString();

  if (!targetUid) {
    const emptyReport: ProfileIntegrityReport = {
      timestamp,
      userId: 'UNAUTHENTICATED',
      userEmail: null,
      status: 'LOCAL_NOT_FOUND',
      isRoleDiscrepancy: false,
      isAdminDiscrepancy: false,
      isVerifiedDiscrepancy: false,
      isPrivilegeEscalationRisk: false,
      discrepancies: [],
      firestoreState: { exists: false },
      cachedState: { exists: false },
      summary: 'No authenticated user UID provided or found.',
      reconciliationSuggested: false
    };
    return emptyReport;
  }

  // 1. Retrieve local cached profile
  const cachedKey = `tonjam_user_profile_${targetUid}`;
  let localCacheProfile: Record<string, any> | null = null;
  try {
    const rawCache = localStorage.getItem(cachedKey);
    if (rawCache) {
      localCacheProfile = JSON.parse(rawCache);
    }
  } catch (err) {
    console.warn('[ProfileIntegrity] Failed to parse local cache:', err);
  }

  // If in-memory currentProfile is supplied, fallback/merge for complete coverage
  const activeLocalState = options?.currentProfile || (localCacheProfile as UserProfile | null);

  // 2. Fetch authoritative profile from Firestore
  let firestoreProfile: Record<string, any> | null = null;
  let firestoreExists = false;
  let isOffline = false;

  try {
    const userDocRef = doc(db, 'users', targetUid);
    const snap = options?.preferServer 
      ? await getDocFromServer(userDocRef).catch(() => getDoc(userDocRef))
      : await getDoc(userDocRef);

    if (snap.exists()) {
      firestoreExists = true;
      firestoreProfile = snap.data() || {};
    }
  } catch (fetchErr: any) {
    console.warn('[ProfileIntegrity] Firestore fetch encountered issue:', fetchErr?.message || fetchErr);
    if (fetchErr?.code === 'unavailable' || String(fetchErr?.message).includes('offline')) {
      isOffline = true;
    }
  }

  // 3. Compute derived administrative flags
  const isKrusherAdmin = userEmail === 'krusherkrupy@gmail.com';
  
  const firestoreRole: string = String(firestoreProfile?.role || 'collector');
  const firestoreIsAdmin = firestoreProfile?.isAdmin === true || firestoreRole === 'admin' || isKrusherAdmin;
  const firestoreVerified = firestoreProfile?.verified === true || firestoreProfile?.isVerified === true || firestoreProfile?.isVerifiedArtist === true;
  const firestoreVerificationStatus = String(firestoreProfile?.verificationStatus || (firestoreVerified ? 'verified' : 'unverified'));

  const cachedRole: string = String(activeLocalState?.role || 'collector');
  const cachedIsAdmin = (activeLocalState as any)?.isAdmin === true || cachedRole === 'admin' || isKrusherAdmin;
  const cachedVerified = activeLocalState?.verified === true || activeLocalState?.isVerified === true || activeLocalState?.isVerifiedArtist === true;
  const cachedVerificationStatus = String(activeLocalState?.verificationStatus || (cachedVerified ? 'verified' : 'unverified'));

  const discrepancies: ProfileFieldDiscrepancy[] = [];

  // If Firestore could not be reached due to offline status
  if (isOffline) {
    const report: ProfileIntegrityReport = {
      timestamp,
      userId: targetUid,
      userEmail,
      status: 'OFFLINE_UNAVAILABLE',
      isRoleDiscrepancy: false,
      isAdminDiscrepancy: false,
      isVerifiedDiscrepancy: false,
      isPrivilegeEscalationRisk: false,
      discrepancies: [],
      firestoreState: { exists: false },
      cachedState: {
        exists: Boolean(activeLocalState),
        role: cachedRole,
        isAdmin: cachedIsAdmin,
        verified: cachedVerified,
        isVerifiedArtist: activeLocalState?.isVerifiedArtist,
        verificationStatus: cachedVerificationStatus,
        walletAddress: activeLocalState?.walletAddress,
        raw: activeLocalState || undefined
      },
      summary: 'Firestore is operating in offline mode. Local cache is serving the profile safely.',
      reconciliationSuggested: false
    };
    return report;
  }

  // If Firestore record does not exist
  if (!firestoreExists) {
    if (activeLocalState) {
      discrepancies.push({
        field: 'document_existence',
        firestoreValue: 'MISSING',
        cachedValue: 'EXISTS',
        severity: 'HIGH',
        description: `Local cache exists for UID ${targetUid}, but no document exists in Firestore 'users/${targetUid}'.`
      });
    }

    const report: ProfileIntegrityReport = {
      timestamp,
      userId: targetUid,
      userEmail,
      status: 'REMOTE_NOT_FOUND',
      isRoleDiscrepancy: Boolean(activeLocalState?.role),
      isAdminDiscrepancy: Boolean(cachedIsAdmin),
      isVerifiedDiscrepancy: Boolean(cachedVerified),
      isPrivilegeEscalationRisk: cachedIsAdmin || cachedRole === 'admin' || cachedRole === 'artist',
      discrepancies,
      firestoreState: { exists: false },
      cachedState: {
        exists: Boolean(activeLocalState),
        role: cachedRole,
        isAdmin: cachedIsAdmin,
        verified: cachedVerified,
        raw: activeLocalState || undefined
      },
      summary: `Document users/${targetUid} does not exist in Firestore.`,
      reconciliationSuggested: true
    };
    return report;
  }

  // 4. Perform field-by-field integrity comparison
  let isRoleDiscrepancy = false;
  let isAdminDiscrepancy = false;
  let isVerifiedDiscrepancy = false;
  let isPrivilegeEscalationRisk = false;

  // Compare 'role'
  if (firestoreRole !== cachedRole) {
    isRoleDiscrepancy = true;
    const isEscalation = (cachedRole === 'admin' && firestoreRole !== 'admin') ||
                         (cachedRole === 'artist' && firestoreRole === 'collector');
    if (isEscalation) {
      isPrivilegeEscalationRisk = true;
    }

    discrepancies.push({
      field: 'role',
      firestoreValue: firestoreRole,
      cachedValue: cachedRole,
      severity: isEscalation ? 'CRITICAL' : 'HIGH',
      description: `Role mismatch: Firestore has '${firestoreRole}', but local cache has '${cachedRole}'.`
    });
  }

  // Compare 'isAdmin' flag
  if (firestoreIsAdmin !== cachedIsAdmin) {
    isAdminDiscrepancy = true;
    if (cachedIsAdmin && !firestoreIsAdmin) {
      isPrivilegeEscalationRisk = true;
    }
    discrepancies.push({
      field: 'isAdmin',
      firestoreValue: firestoreIsAdmin,
      cachedValue: cachedIsAdmin,
      severity: cachedIsAdmin && !firestoreIsAdmin ? 'CRITICAL' : 'HIGH',
      description: `isAdmin flag mismatch: Firestore resolves to ${firestoreIsAdmin}, but local cache resolves to ${cachedIsAdmin}.`
    });
  }

  // Compare 'verified' / 'isVerifiedArtist' flags
  if (firestoreVerified !== cachedVerified) {
    isVerifiedDiscrepancy = true;
    discrepancies.push({
      field: 'verified',
      firestoreValue: firestoreVerified,
      cachedValue: cachedVerified,
      severity: cachedVerified && !firestoreVerified ? 'HIGH' : 'MEDIUM',
      description: `Verified state mismatch: Firestore has ${firestoreVerified}, but local cache has ${cachedVerified}.`
    });
  }

  if (firestoreVerificationStatus !== cachedVerificationStatus) {
    discrepancies.push({
      field: 'verificationStatus',
      firestoreValue: firestoreVerificationStatus,
      cachedValue: cachedVerificationStatus,
      severity: 'MEDIUM',
      description: `Verification status mismatch: Firestore is '${firestoreVerificationStatus}', local cache is '${cachedVerificationStatus}'.`
    });
  }

  // Compare walletAddress if present
  const firestoreWallet = firestoreProfile?.walletAddress || '';
  const cachedWallet = activeLocalState?.walletAddress || '';
  if (firestoreWallet !== cachedWallet && (firestoreWallet || cachedWallet)) {
    discrepancies.push({
      field: 'walletAddress',
      firestoreValue: firestoreWallet || '(none)',
      cachedValue: cachedWallet || '(none)',
      severity: 'MEDIUM',
      description: `Wallet address mismatch: Firestore has '${firestoreWallet}', local cache has '${cachedWallet}'.`
    });
  }

  const status: IntegrityStatus = discrepancies.length === 0 ? 'SYNCHRONIZED' : 'DISCREPANCY_DETECTED';

  let summary = 'User profile state is fully synchronized and consistent with Firestore.';
  if (isPrivilegeEscalationRisk) {
    summary = '⚠️ CRITICAL: Potential privilege escalation discrepancy detected between local cache and Firestore.';
  } else if (discrepancies.length > 0) {
    summary = `Detected ${discrepancies.length} discrepancy(ies) between Firestore and local cache.`;
  }

  const report: ProfileIntegrityReport = {
    timestamp,
    userId: targetUid,
    userEmail,
    status,
    isRoleDiscrepancy,
    isAdminDiscrepancy,
    isVerifiedDiscrepancy,
    isPrivilegeEscalationRisk,
    discrepancies,
    firestoreState: {
      exists: true,
      role: firestoreRole,
      isAdmin: firestoreIsAdmin,
      verified: firestoreVerified,
      isVerifiedArtist: firestoreProfile?.isVerifiedArtist,
      verificationStatus: firestoreVerificationStatus,
      walletAddress: firestoreWallet,
      raw: firestoreProfile
    },
    cachedState: {
      exists: Boolean(activeLocalState),
      role: cachedRole,
      isAdmin: cachedIsAdmin,
      verified: cachedVerified,
      isVerifiedArtist: activeLocalState?.isVerifiedArtist,
      verificationStatus: cachedVerificationStatus,
      walletAddress: cachedWallet,
      raw: activeLocalState || undefined
    },
    summary,
    reconciliationSuggested: discrepancies.length > 0
  };

  return report;
}

/**
 * Pretty-prints a formatted diagnostic report to the browser console.
 */
export function logProfileIntegrityReport(report: ProfileIntegrityReport): void {
  const headerColor = report.isPrivilegeEscalationRisk 
    ? '#ef4444' 
    : report.status === 'SYNCHRONIZED' 
      ? '#10b981' 
      : '#f59e0b';

  console.groupCollapsed(
    `%c[Profile Integrity Diagnostic] UID: ${report.userId} | Status: ${report.status}`,
    `color: ${headerColor}; font-weight: bold; padding: 2px 6px;`
  );

  console.log('Timestamp:', report.timestamp);
  console.log('User Email:', report.userEmail || '(guest / anonymous)');
  console.log('Overall Status:', report.status);
  console.log('Summary:', report.summary);

  console.table({
    'Role': {
      'Firestore': report.firestoreState.role,
      'Local Cache': report.cachedState.role,
      'Discrepancy': report.isRoleDiscrepancy ? '❌ MISMATCH' : '✅ SYNCED'
    },
    'isAdmin': {
      'Firestore': report.firestoreState.isAdmin,
      'Local Cache': report.cachedState.isAdmin,
      'Discrepancy': report.isAdminDiscrepancy ? '❌ MISMATCH' : '✅ SYNCED'
    },
    'Verified': {
      'Firestore': report.firestoreState.verified,
      'Local Cache': report.cachedState.verified,
      'Discrepancy': report.isVerifiedDiscrepancy ? '❌ MISMATCH' : '✅ SYNCED'
    },
    'Verification Status': {
      'Firestore': report.firestoreState.verificationStatus,
      'Local Cache': report.cachedState.verificationStatus,
      'Discrepancy': report.firestoreState.verificationStatus !== report.cachedState.verificationStatus ? '❌ MISMATCH' : '✅ SYNCED'
    }
  });

  if (report.discrepancies.length > 0) {
    console.warn(`[Profile Integrity] Discrepancies Details (${report.discrepancies.length}):`, report.discrepancies);
  }

  if (report.isPrivilegeEscalationRisk) {
    console.error(
      '[Profile Integrity] 🚨 PRIVILEGE ESCALATION WARNING: Local cache possesses higher privileges than authoritative Firestore records. Authoritative Firestore rules remain strictly enforced.'
    );
  }

  console.groupEnd();
}
