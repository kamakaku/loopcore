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

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, auth, db, storage } from './config';
import { goOnline, goOffline, isNetworkAvailable } from './db';

// Auth functions
export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's profile with their name
    await updateProfile(userCredential.user, { 
      displayName: name 
    });
    
    // Create the user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscription: {
        planId: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false
      }
    });
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error during sign up:', error);
    throw error;
  }
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
export { app, auth, db, storage };

// Export network management functions
export { goOnline, goOffline, isNetworkAvailable };

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

// Export Storage functions
export {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};

// Export all functions from their respective modules
export * from './teams';
export * from './projects';
export * from './loops';
export * from './spots';
export * from './comments';