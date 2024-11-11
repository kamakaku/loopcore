import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Spot } from '../types';
import { notifyNewSpot } from './notifications/email';

export const createSpot = async ({
  loopId,
  position,
  content = '',
  pageNumber = 0
}: {
  loopId: string;
  position: { x: number; y: number };
  content?: string;
  pageNumber?: number;
}): Promise<Spot> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  // Get the loop document to verify it exists and get the current spot count
  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  const spotCount = loopDoc.data().spotCount || 0;
  const nextNumber = spotCount + 1;

  // Create new spot document
  const spotRef = doc(collection(db, 'spots'));
  const spotData = {
    id: spotRef.id,
    loopId,
    number: nextNumber,
    position,
    content,
    pageNumber,
    status: 'open' as const,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    commentCount: 0
  };

  const batch = writeBatch(db);

  // Create the spot
  batch.set(spotRef, spotData);
  
  // Update loop's spot count
  batch.update(loopRef, {
    spotCount: increment(1),
    updatedAt: serverTimestamp()
  });

  await batch.commit();

  // Send notification to loop members
  const loop = { id: loopDoc.id, ...loopDoc.data() };
  await notifyNewSpot(loop, spotData);

  return {
    ...spotData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateSpot = async (
  spotId: string, 
  updates: Partial<Omit<Spot, 'id' | 'loopId' | 'number' | 'createdAt' | 'createdBy'>>
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const spotRef = doc(db, 'spots', spotId);
  const spotDoc = await getDoc(spotRef);

  if (!spotDoc.exists()) {
    throw new Error('Spot not found');
  }

  if (spotDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await updateDoc(spotRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteSpot = async (spotId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const spotRef = doc(db, 'spots', spotId);
  const spotDoc = await getDoc(spotRef);

  if (!spotDoc.exists()) {
    throw new Error('Spot not found');
  }

  const spotData = spotDoc.data();
  if (spotData.createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  const batch = writeBatch(db);

  // Delete all comments associated with this spot
  const commentsQuery = query(collection(db, 'comments'), where('targetId', '==', spotId));
  const commentsSnapshot = await getDocs(commentsQuery);
  commentsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete the spot
  batch.delete(spotRef);

  // Update loop's spot count
  const loopRef = doc(db, 'loops', spotData.loopId);
  batch.update(loopRef, {
    spotCount: increment(-1),
    updatedAt: serverTimestamp()
  });

  await batch.commit();
};

export const getSpotsByLoop = async (loopId: string, pageNumber?: number): Promise<Spot[]> => {
  const constraints = [where('loopId', '==', loopId)];
  if (typeof pageNumber === 'number') {
    constraints.push(where('pageNumber', '==', pageNumber));
  }

  const spotsQuery = query(collection(db, 'spots'), ...constraints);
  const snapshot = await getDocs(spotsQuery);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as Spot[];
};

export const getSpot = async (spotId: string): Promise<Spot | null> => {
  const spotDoc = await getDoc(doc(db, 'spots', spotId));
  
  if (!spotDoc.exists()) {
    return null;
  }

  return {
    id: spotDoc.id,
    ...spotDoc.data(),
    createdAt: spotDoc.data().createdAt?.toDate(),
    updatedAt: spotDoc.data().updatedAt?.toDate()
  } as Spot;
};