import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  Query,
  getDocs,
  QuerySnapshot,
  documentId,
  Timestamp,
  Unsubscribe,
  setLogLevel,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites
} from 'firebase/firestore';
import { db } from './config';

// Set Firestore log level for better debugging
if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug');
}

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

export const isNetworkAvailable = () => isOnline;

export { db };
export default db;