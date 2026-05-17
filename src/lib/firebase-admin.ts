import admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (adminApp) return adminApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    // If we're on the client, this will be undefined anyway.
    // On the server, we throw an error if we actually try to use it without a key.
    if (typeof window === 'undefined') {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is missing. Firebase Admin could not be initialized.');
    }
    return null;
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'tonjam-16d8f'}.firebaseio.com`
    });

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
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
