import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Get Firebase config from environment variable
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing or invalid');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with persistence settings
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true
});

const storage = getStorage(app);

// Enable offline persistence based on environment
if (import.meta.env.PROD) {
  try {
    // Try multi-tab persistence first
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // If multi-tab is not supported, fall back to single-tab persistence
        return enableIndexedDbPersistence(db);
      } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support IndexedDB persistence');
      }
    });
  } catch (err) {
    console.warn('Error enabling persistence:', err);
  }
}

export { app, auth, db, storage, firebaseConfig };