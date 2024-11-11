import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, db, storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// User cache to minimize database queries
const userCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getUserInfo(userId: string) {
  const now = Date.now();
  const cached = userCache.get(userId);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      userCache.set(userId, { data: userData, timestamp: now });
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function getMultipleUsers(userIds: string[]) {
  const now = Date.now();
  const uniqueIds = [...new Set(userIds)];
  const missingIds = uniqueIds.filter(id => {
    const cached = userCache.get(id);
    return !cached || (now - cached.timestamp) >= CACHE_DURATION;
  });
  
  if (missingIds.length === 0) {
    return uniqueIds.map(id => userCache.get(id)?.data).filter(Boolean);
  }

  try {
    const usersRef = collection(db, 'users');
    const chunks = [];
    
    // Firestore has a limit of 10 items in 'in' queries
    for (let i = 0; i < missingIds.length; i += 10) {
      const chunk = missingIds.slice(i, i + 10);
      chunks.push(chunk);
    }

    const results = await Promise.all(
      chunks.map(chunk => {
        const q = query(usersRef, where('__name__', 'in', chunk));
        return getDocs(q);
      })
    );

    const users = results.flatMap(snapshot => 
      snapshot.docs.map(doc => {
        const userData = {
          id: doc.id,
          ...doc.data()
        };
        userCache.set(doc.id, { data: userData, timestamp: now });
        return userData;
      })
    );

    // Combine cached and new data
    return uniqueIds.map(id => {
      const cached = userCache.get(id);
      return cached?.data;
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching multiple users:', error);
    return [];
  }
}

export async function updateUserProfile(updates: {
  displayName?: string;
  email?: string;
  avatar?: File;
  currentPassword?: string;
  newPassword?: string;
}) {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to update profile');
  }

  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    let photoURL = auth.currentUser.photoURL;
    if (updates.avatar) {
      const timestamp = Date.now();
      const filename = `avatars/${auth.currentUser.uid}/${timestamp}_${updates.avatar.name}`;
      const storageRef = ref(storage, filename);
      
      const uploadResult = await uploadBytes(storageRef, updates.avatar, {
        contentType: updates.avatar.type,
        customMetadata: {
          uploadedBy: auth.currentUser.uid,
          originalName: updates.avatar.name
        }
      });
      photoURL = await getDownloadURL(uploadResult.ref);
    }

    const firestoreUpdates: any = {};
    if (updates.displayName) {
      firestoreUpdates.name = updates.displayName;
    }
    if (photoURL) {
      firestoreUpdates.photoURL = photoURL;
    }
    
    if (Object.keys(firestoreUpdates).length > 0) {
      await updateDoc(userRef, {
        ...firestoreUpdates,
        updatedAt: serverTimestamp()
      });
    }

    await updateProfile(auth.currentUser, {
      displayName: updates.displayName || auth.currentUser.displayName,
      photoURL: photoURL || auth.currentUser.photoURL
    });

    if (updates.email && updates.currentPassword) {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        updates.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, updates.email);
      await updateDoc(userRef, { email: updates.email });
    }

    if (updates.newPassword && updates.currentPassword) {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        updates.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, updates.newPassword);
    }

    // Clear user from cache to force refresh
    userCache.delete(auth.currentUser.uid);

    return {
      success: true,
      user: auth.currentUser
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}