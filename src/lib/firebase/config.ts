import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites
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

// Initialize Firestore with persistent cache settings
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const storage = getStorage(app);

// Network status management
let isOnline = true;
let retryTimeout: NodeJS.Timeout | null = null;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000;

export const goOnline = async () => {
  try {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    await enableNetwork(db);
    isOnline = true;
    console.log('Firebase connection restored');
  } catch (error) {
    console.error('Error enabling network:', error);
    scheduleRetry();
  }
};

export const goOffline = async () => {
  try {
    await waitForPendingWrites(db);
    await disableNetwork(db);
    isOnline = false;
    console.log('Firebase connection disabled');
  } catch (error) {
    console.error('Error disabling network:', error);
  }
};

const scheduleRetry = (attempt = 1) => {
  if (attempt > MAX_RETRY_ATTEMPTS) {
    console.warn('Max retry attempts reached');
    return;
  }

  if (retryTimeout) {
    clearTimeout(retryTimeout);
  }

  retryTimeout = setTimeout(async () => {
    try {
      await goOnline();
    } catch (error) {
      console.error(`Retry attempt ${attempt} failed:`, error);
      scheduleRetry(attempt + 1);
    }
  }, RETRY_DELAY * attempt);
};

// Listen for online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Browser went online');
    goOnline();
  });

  window.addEventListener('offline', () => {
    console.log('Browser went offline');
    goOffline();
  });
}

export { app, auth, db, storage, firebaseConfig };