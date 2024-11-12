import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO4Fq8uTFFhL5lVDiTYIXzwjcS03D1fQE",
  authDomain: "loopcore-3fc6f.firebaseapp.com",
  projectId: "loopcore-3fc6f",
  storageBucket: "loopcore-3fc6f.appspot.com",
  messagingSenderId: "814296163933",
  appId: "1:814296163933:web:a0ba05f033343f32d7cfb4",
  measurementId: "G-J0NPPN8GGB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Functions
const functions = getFunctions(app);

export { app, auth, db, storage, functions, firebaseConfig };