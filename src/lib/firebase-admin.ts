import admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (adminApp) return adminApp;

  // Don't initialize on client
  if (typeof window !== 'undefined') {
    return null;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'tonjam-16d8f';
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
        databaseURL: `https://${projectId}.firebaseio.com`
      });

      return adminApp;
    } catch (error) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to projectId init:', error);
    }
  }

  try {
    // Project-based initialization allows ID-token verification against Google Public Certs
    if (admin.apps.length > 0 && admin.apps[0]) {
      adminApp = admin.apps[0];
    } else {
      adminApp = admin.initializeApp({
        projectId
      });
    }
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin with projectId:', error);
    return null;
  }
}

export const getFirestoreAdmin = () => {
  const app = getFirebaseAdmin();
  return app ? app.firestore() : null;
};

export const getAuthAdmin = () => {
  const app = getFirebaseAdmin();
  return app ? app.auth() : null;
};
