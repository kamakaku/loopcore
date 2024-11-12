import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Get Firebase config from environment variable
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing or invalid');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with new cache settings
const db = initializeFirestore(app, {
  cache: {
    type: 'persistent',
    synchronizeTabs: true
  }
});

const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };