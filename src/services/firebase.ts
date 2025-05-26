import admin from 'firebase-admin';
import path from 'path';

// Перевірте, чи Firebase вже ініціалізований
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_KEY_PATH || './serviceAccountKey.json';
  
  try {
    const serviceAccount = require(path.resolve(serviceAccountPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const db = admin.firestore();
export default admin;