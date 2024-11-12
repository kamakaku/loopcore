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

// Create a singleton instance
class FirebaseInstance {
  private static instance: FirebaseInstance;
  public app;
  public auth;
  public db;
  public storage;
  public functions;

  private constructor() {
    const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase configuration is missing or invalid');
    }

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = initializeFirestore(this.app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true
    });
    this.storage = getStorage(this.app);
    this.functions = getFunctions(this.app);
  }

  public static getInstance(): FirebaseInstance {
    if (!FirebaseInstance.instance) {
      FirebaseInstance.instance = new FirebaseInstance();
    }
    return FirebaseInstance.instance;
  }
}

const firebase = FirebaseInstance.getInstance();

export const app = firebase.app;
export const auth = firebase.auth;
export const db = firebase.db;
export const storage = firebase.storage;
export const functions = firebase.functions;