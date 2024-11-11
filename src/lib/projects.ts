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
  getDocs,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Project } from '../types';

export const createProject = async ({
  name,
  description = '',
  teamId = null,
  members = [],
  loops = []
}: {
  name: string;
  description?: string;
  teamId?: string | null;
  members?: string[];
  loops?: string[];
}) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  // Always include the creator as a member
  const uniqueMembers = Array.from(new Set([auth.currentUser.uid, ...members]));

  const projectData = {
    name,
    description,
    teamId,
    members: uniqueMembers,
    loops,
    status: 'active',
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const projectRef = doc(collection(db, 'projects'));
  await setDoc(projectRef, projectData);

  // If there's a team, add the project to the team's projects array
  if (teamId) {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      projects: arrayUnion(projectRef.id),
      updatedAt: serverTimestamp()
    });
  }

  return {
    id: projectRef.id,
    ...projectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
};

export const updateProject = async (
  projectId: string,
  updates: {
    name?: string;
    description?: string;
    status?: 'active' | 'archived';
    teamId?: string | null;
    members?: string[];
    loops?: string[];
  }
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists()) throw new Error('Project not found');
  
  const currentData = projectDoc.data();
  if (!currentData.members.includes(auth.currentUser.uid)) {
    throw new Error('Permission denied');
  }

  const batch = writeBatch(db);

  // Handle team changes
  if ('teamId' in updates && updates.teamId !== currentData.teamId) {
    // Remove from old team
    if (currentData.teamId) {
      const oldTeamRef = doc(db, 'teams', currentData.teamId);
      batch.update(oldTeamRef, {
        projects: arrayRemove(projectId),
        updatedAt: serverTimestamp()
      });
    }

    // Add to new team
    if (updates.teamId) {
      const newTeamRef = doc(db, 'teams', updates.teamId);
      batch.update(newTeamRef, {
        projects: arrayUnion(projectId),
        updatedAt: serverTimestamp()
      });
    }
  }

  // Ensure creator remains a member
  if (updates.members) {
    updates.members = Array.from(new Set([currentData.createdBy, ...updates.members]));
  }

  batch.update(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });

  await batch.commit();
};

export const addProjectMember = async (projectId: string, userId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists()) throw new Error('Project not found');
  if (!projectDoc.data().members.includes(auth.currentUser.uid)) {
    throw new Error('Permission denied');
  }

  await updateDoc(projectRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists()) throw new Error('Project not found');
  if (!projectDoc.data().members.includes(auth.currentUser.uid)) {
    throw new Error('Permission denied');
  }

  if (userId === projectDoc.data().createdBy) {
    throw new Error('Cannot remove project owner');
  }

  await updateDoc(projectRef, {
    members: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
};

export const deleteProject = async (projectId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const projectRef = doc(db, 'projects', projectId);
  const projectDoc = await getDoc(projectRef);
  
  if (!projectDoc.exists()) throw new Error('Project not found');
  if (projectDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Only project owner can delete the project');
  }

  const batch = writeBatch(db);

  // Remove from team if associated
  if (projectDoc.data().teamId) {
    const teamRef = doc(db, 'teams', projectDoc.data().teamId);
    batch.update(teamRef, {
      projects: arrayRemove(projectId),
      updatedAt: serverTimestamp()
    });
  }

  // Update all loops that reference this project
  const loopsQuery = query(collection(db, 'loops'), where('projectId', '==', projectId));
  const loopsSnapshot = await getDocs(loopsQuery);

  loopsSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      projectId: null,
      updatedAt: serverTimestamp()
    });
  });

  batch.delete(projectRef);
  await batch.commit();
};