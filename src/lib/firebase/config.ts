import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Initialize Firebase with config
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing or invalid');
}

// Create the Firebase app instance first
export const app = initializeApp(firebaseConfig);

// Then initialize all services using that app instance
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true
});
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export config if needed elsewhere
export { firebaseConfig };