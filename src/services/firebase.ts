import admin from 'firebase-admin';
import path from 'path';

if (admin.apps.length === 0) {
  try {
    const now = new Date();
    console.log('Current system time:', now.toISOString());
    console.log('Current timestamp:', Math.floor(now.getTime() / 1000));
    
    const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    
    console.log('Service account project:', serviceAccount.project_id);
    console.log('Service account key ID:', serviceAccount.private_key_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('Firebase Admin initialized successfully');
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;