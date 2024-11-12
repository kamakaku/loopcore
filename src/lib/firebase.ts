import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Get Firebase config from environment variable
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing or invalid');
}

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Enable offline persistence
if (process.env.NODE_ENV === 'production') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Export initialized services
export { 
  app, 
  auth, 
  db, 
  storage,
  functions
};

// Export types
export type { User };

// Export Firestore types and functions
export {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch
};

// Export all functions from their respective modules
export * from './firebase/teams';
export * from './firebase/projects';
export * from './firebase/loops';
export * from './firebase/spots';
export * from './firebase/comments';