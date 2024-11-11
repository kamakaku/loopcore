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
import { auth, db } from './config';
import type { Team } from '../../types';

export const createTeam = async ({
  name,
  description = '',
  members = []
}: {
  name: string;
  description?: string;
  members?: string[];
}): Promise<Team> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  // Always include the creator as a member
  const uniqueMembers = Array.from(new Set([auth.currentUser.uid, ...members]));

  const teamRef = doc(collection(db, 'teams'));
  const teamData = {
    id: teamRef.id,
    name,
    description,
    members: uniqueMembers,
    projects: [],
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(teamRef, teamData);

  return {
    ...teamData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
};

export const updateTeam = async (
  teamId: string,
  updates: {
    name?: string;
    description?: string;
  }
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  if (teamDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Only team owner can update team details');
  }

  await updateDoc(teamRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const addTeamMember = async (teamId: string, userId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  if (teamDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Only team owner can add members');
  }

  if (teamDoc.data().members.includes(userId)) {
    throw new Error('User is already a team member');
  }

  await updateDoc(teamRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  if (teamDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Only team owner can remove members');
  }

  if (userId === teamDoc.data().createdBy) {
    throw new Error('Cannot remove team owner');
  }

  await updateDoc(teamRef, {
    members: arrayRemove(userId),
    updatedAt: serverTimestamp()
  });
};

export const deleteTeam = async (teamId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  if (teamDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Only team owner can delete the team');
  }

  const batch = writeBatch(db);

  // Delete all projects associated with this team
  const projectsRef = collection(db, 'projects');
  const projectsSnapshot = await getDocs(query(projectsRef, where('teamId', '==', teamId)));
  
  projectsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Update all loops that reference this team
  const loopsRef = collection(db, 'loops');
  const loopsSnapshot = await getDocs(query(loopsRef, where('teamId', '==', teamId)));

  loopsSnapshot.forEach(doc => {
    batch.update(doc.ref, {
      teamId: null,
      projectId: null,
      updatedAt: serverTimestamp()
    });
  });

  // Delete the team
  batch.delete(teamRef);

  await batch.commit();
};