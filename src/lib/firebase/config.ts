import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  enableIndexedDbPersistence
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

// Initialize Firebase only if no app exists
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

// Initialize services
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Firestore with persistence
const db = getFirestore(app);

// Enable offline persistence for production
if (process.env.NODE_ENV === 'production') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

export { app, auth, db, storage, functions, firebaseConfig };