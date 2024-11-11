import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './config';
import type { Loop } from '../../types';
import { captureWebsiteScreenshot } from '../../utils/screenshot';
import { convertPDFToImages } from '../../utils/pdfConverter';

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

  let contentUrl = '';
  let screenshotUrl = '';
  let pdfPages: string[] = [];

  if (content instanceof File) {
    const timestamp = Date.now();
    const filename = `loops/${auth.currentUser.uid}/${timestamp}_${content.name}`;
    const storageRef = ref(storage, filename);
    
    if (type === 'pdf') {
      // Convert PDF to images and upload each page
      const pages = await convertPDFToImages(content);
      const uploadPromises = pages.map(async (pageBlob, index) => {
        const pageFilename = `loops/${auth.currentUser.uid}/${timestamp}_${content.name}_page_${index + 1}.jpg`;
        const pageRef = ref(storage, pageFilename);
        await uploadBytes(pageRef, pageBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            originalName: content.name,
            pageNumber: (index + 1).toString()
          }
        });
        return getDownloadURL(pageRef);
      });

      pdfPages = await Promise.all(uploadPromises);
      contentUrl = pdfPages[0]; // First page as main content URL
    } else {
      const uploadResult = await uploadBytes(storageRef, content, {
        contentType: content.type,
        customMetadata: {
          uploadedBy: auth.currentUser.uid,
          originalName: content.name
        }
      });
      contentUrl = await getDownloadURL(uploadResult.ref);
    }
  } else {
    contentUrl = content;
    if (type === 'url') {
      screenshotUrl = await captureWebsiteScreenshot(content, auth.currentUser.uid);
    }
  }

  const loopRef = doc(collection(db, 'loops'));
  const loopData = {
    id: loopRef.id,
    title,
    type,
    content: contentUrl,
    screenshot: screenshotUrl,
    pdfPages,
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
    updatedAt: Timestamp.now()
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

  const loopData = loopDoc.data();
  if (loopData.createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  const batch = writeBatch(db);

  // Delete all spots associated with this loop
  const spotsQuery = query(collection(db, 'spots'), where('loopId', '==', loopId));
  const spotsSnapshot = await getDocs(spotsQuery);
  spotsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete all comments associated with this loop
  const commentsQuery = query(collection(db, 'comments'), where('targetId', '==', loopId));
  const commentsSnapshot = await getDocs(commentsQuery);
  commentsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete the loop document
  batch.delete(loopRef);

  // Delete associated files from storage
  if (loopData.type === 'image' || loopData.type === 'pdf') {
    try {
      const storageRef = ref(storage, loopData.content);
      await deleteObject(storageRef);

      // Delete PDF pages if they exist
      if (loopData.pdfPages?.length) {
        await Promise.all(
          loopData.pdfPages.map(pageUrl => {
            const pageRef = ref(storage, pageUrl);
            return deleteObject(pageRef);
          })
        );
      }
    } catch (error) {
      console.error('Error deleting storage files:', error);
      // Continue with deletion even if storage cleanup fails
    }
  }

  await batch.commit();
};