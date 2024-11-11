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
  getDocs,
  arrayUnion,
  arrayRemove,
  or,
  QueryConstraint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { Loop, LoopMember } from '../types';
import { captureWebsiteScreenshot } from '../utils/screenshot';
import { convertPDFToImages } from '../utils/pdfConverter';
import { notifyMemberAdded, notifyNewSpot } from './notifications/email';
import { v4 as uuidv4 } from 'uuid';

// Helper functions
const getUserTeamIds = async (userId: string): Promise<string[]> => {
  const teamsRef = collection(db, 'teams');
  const teamsQuery = query(teamsRef, where('members', 'array-contains', userId));
  const snapshot = await getDocs(teamsQuery);
  return snapshot.docs.map(doc => doc.id);
};

const getUserProjectIds = async (userId: string): Promise<string[]> => {
  const projectsRef = collection(db, 'projects');
  const projectsQuery = query(projectsRef, where('members', 'array-contains', userId));
  const snapshot = await getDocs(projectsQuery);
  return snapshot.docs.map(doc => doc.id);
};

export const getAccessibleLoops = async (userId?: string): Promise<Loop[]> => {
  if (!auth.currentUser && !userId) {
    throw new Error('Authentication required');
  }

  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User ID is required');
  }

  try {
    const loopsRef = collection(db, 'loops');
    const constraints: QueryConstraint[] = [];

    // First get team and project IDs the user has access to
    const [teamIds, projectIds] = await Promise.all([
      getUserTeamIds(uid),
      getUserProjectIds(uid)
    ]);

    // Build the query based on available access paths
    const accessConditions = [
      where('createdBy', '==', uid)
    ];

    // Only add team/project conditions if there are IDs to query
    if (teamIds.length > 0) {
      accessConditions.push(where('teamId', 'in', teamIds));
    }
    if (projectIds.length > 0) {
      accessConditions.push(where('projectId', 'in', projectIds));
    }

    // Create query with OR conditions
    const q = query(loopsRef, or(...accessConditions));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Loop[];
  } catch (error) {
    console.error('Error in getAccessibleLoops:', error);
    throw new Error('Failed to fetch accessible loops');
  }
};

export const createLoop = async ({
  title,
  type,
  content,
  description = '',
  teamId,
  projectId,
  screenshot,
  metadata = {}
}: {
  title: string;
  type: 'url' | 'image' | 'pdf' | 'figma';
  content: string | File;
  description?: string;
  teamId?: string;
  projectId?: string;
  screenshot?: string;
  metadata?: Record<string, any>;
}): Promise<Loop> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  let contentUrl = '';
  let screenshotUrl = screenshot || '';
  let pdfPages: string[] = [];

  if (content instanceof File) {
    const timestamp = Date.now();
    const filename = `loops/${auth.currentUser.uid}/${timestamp}_${content.name}`;
    const storageRef = ref(storage, filename);
    
    if (type === 'pdf') {
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
      contentUrl = pdfPages[0];
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
    if (type === 'url' && !screenshot) {
      screenshotUrl = await captureWebsiteScreenshot(content, auth.currentUser.uid);
    }
  }

  const loopRef = doc(collection(db, 'loops'));
  const loopData = {
    id: loopRef.id,
    title,
    description,
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
    status: 'active' as const,
    members: [{
      id: auth.currentUser.uid,
      role: 'owner' as const,
      addedAt: new Date(),
      addedBy: auth.currentUser.uid
    }],
    publicId: null,
    isPublic: false,
    metadata
  };

  await setDoc(loopRef, loopData);

  return {
    ...loopData,
    createdAt: new Date(),
    updatedAt: new Date()
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
    }
  }

  // Delete the loop document
  batch.delete(loopRef);
  await batch.commit();
};

export const addLoopMember = async (loopId: string, userId: string, role: 'editor' | 'viewer' = 'viewer') => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  const loop = { id: loopDoc.id, ...loopDoc.data() } as Loop;
  const members = loop.members || [];
  
  if (members.some(member => member.id === userId)) {
    throw new Error('User is already a member of this loop');
  }

  const newMember: LoopMember = {
    id: userId,
    role,
    addedAt: new Date(),
    addedBy: auth.currentUser.uid
  };

  await updateDoc(loopRef, {
    members: [...members, newMember],
    updatedAt: serverTimestamp()
  });

  // Send email notification
  await notifyMemberAdded(loop, userId);
};

export const removeLoopMember = async (loopId: string, userId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  const loop = { id: loopDoc.id, ...loopDoc.data() } as Loop;
  const members = loop.members || [];
  const memberToRemove = members.find(member => member.id === userId);

  if (!memberToRemove) {
    throw new Error('User is not a member of this loop');
  }

  if (memberToRemove.role === 'owner') {
    throw new Error('Cannot remove the owner of the loop');
  }

  await updateDoc(loopRef, {
    members: members.filter(member => member.id !== userId),
    updatedAt: serverTimestamp()
  });
};

export const updateLoopMember = async (loopId: string, userId: string, role: 'editor' | 'viewer') => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  const members = loopDoc.data().members || [];
  const memberIndex = members.findIndex(member => member.id === userId);

  if (memberIndex === -1) {
    throw new Error('User is not a member of this loop');
  }

  if (members[memberIndex].role === 'owner') {
    throw new Error('Cannot change the role of the loop owner');
  }

  const updatedMembers = [...members];
  updatedMembers[memberIndex] = {
    ...updatedMembers[memberIndex],
    role,
    updatedAt: new Date(),
    updatedBy: auth.currentUser.uid
  };

  await updateDoc(loopRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp()
  });
};

export const toggleLoopPublicAccess = async (loopId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const loopRef = doc(db, 'loops', loopId);
  const loopDoc = await getDoc(loopRef);

  if (!loopDoc.exists()) {
    throw new Error('Loop not found');
  }

  const loopData = loopDoc.data();
  if (loopData.createdBy !== auth.currentUser.uid) {
    throw new Error('Only the loop owner can change public access');
  }

  const isCurrentlyPublic = loopData.isPublic;
  const updates: any = {
    isPublic: !isCurrentlyPublic,
    updatedAt: serverTimestamp()
  };

  if (!isCurrentlyPublic) {
    updates.publicId = uuidv4();
  } else {
    updates.publicId = null;
  }

  await updateDoc(loopRef, updates);
};