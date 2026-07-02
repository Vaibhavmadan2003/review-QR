let firebaseApp: any;

export function getFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Dynamic require to avoid TypeScript issues
  const admin = require('firebase-admin');

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (e: any) {
    if (e.code === 'app/duplicate-app') {
      firebaseApp = admin.app();
    } else {
      throw e;
    }
  }

  return firebaseApp;
}

export function getDatabase() {
  return getFirebaseAdmin().database();
}
