import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Normalize Firebase auth errors
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      error.code = 'auth/invalid-credential';
    }
    throw error;
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  await Promise.all([
    // Update profile
    updateProfile(userCredential.user, { displayName: name }),
    
    // Create user document
    setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscription: {
        planId: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      }
    })
  ]);

  return userCredential.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};