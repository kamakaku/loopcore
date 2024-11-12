import { auth, db, storage, app } from './config';  // Verwende hier den Pfad zu `config.ts`
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { 
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
} from 'firebase/firestore';

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

// Export initialized services and types
export { 
  app, 
  auth, 
  db, 
  storage
};
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
