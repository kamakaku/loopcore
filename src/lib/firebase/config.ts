import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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