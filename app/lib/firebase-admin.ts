let firebaseApp: any;
let isInitializing = false;
let db: any;

export function getFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (isInitializing) {
    return null;
  }

  isInitializing = true;

  try {
    // Import firebase-admin
    const admin = require('firebase-admin');

    // Check if already initialized
    const apps = admin.getApps?.() || [];
    if (apps.length > 0) {
      firebaseApp = apps[0];
      console.log('✓ Using existing Firebase app');
      return firebaseApp;
    }

    // Initialize new app with v11 API
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✓ Firebase initialized successfully');
    return firebaseApp;
  } catch (e: any) {
    console.error('Firebase init error:', e.message);
    isInitializing = false;
    throw e;
  }
}

export function getDatabase() {
  try {
    if (!db) {
      const app = getFirebaseAdmin();
      if (!app) {
        throw new Error('Firebase app not initialized');
      }
      
      // Get database from app instance (v11)
      db = app.database();
      console.log('✓ Database connected');
    }
    return db;
  } catch (e: any) {
    console.error('Database connection error:', e.message);
    throw e;
  }
}
