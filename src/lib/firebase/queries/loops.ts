import { 
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../';
import { Loop } from '../../../types';

export const createLoop = async ({
  title,
  type,
  content,
  teamId,
  projectId
}: {
  title: string;
  type: 'url' | 'image' | 'pdf';
  content: string | File;
  teamId?: string;
  projectId?: string;
}): Promise<Loop> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(collection(db, 'loops'));
  const loopData = {
    id: loopRef.id,
    title,
    type,
    content,
    teamId: teamId || null,
    projectId: projectId || null,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    spotCount: 0,
    commentCount: 0,
    status: 'active' as const
  };

  await setDoc(loopRef, loopData);

  return {
    ...loopData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    pdfPages: []
  };
};

export const updateLoop = async (
  loopId: string,
  updates: Partial<Omit<Loop, 'id' | 'createdAt' | 'createdBy'>>
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  if (loopDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await updateDoc(loopRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteLoop = async (loopId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  if (loopDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await deleteDoc(loopRef);
};