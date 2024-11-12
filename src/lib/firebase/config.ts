import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Default Firebase configuration for development
const defaultConfig = {
  apiKey: "AIzaSyDHt6qPXF6PiJfBrX-ZS66yP6BMZVrv_eo",
  authDomain: "loopcore-dev.firebaseapp.com",
  projectId: "loopcore-dev",
  storageBucket: "loopcore-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};

// Use environment config if available, otherwise fall back to default
const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG 
  ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
  : defaultConfig;

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

export { app, auth, db, storage, firebaseConfig };