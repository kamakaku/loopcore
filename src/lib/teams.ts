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
  arrayRemove,
  FirestoreError
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Team } from '../types';

export const createTeam = async ({
  name,
  description = '',
  members = []
}: {
  name: string;
  description?: string;
  members?: string[];
}): Promise<Team> => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  const uniqueMembers = Array.from(new Set([auth.currentUser.uid, ...members]));

  const teamRef = doc(collection(db, 'teams'));
  const teamData = {
    id: teamRef.id,
    name,
    description,
    members: uniqueMembers,
    owners: [auth.currentUser.uid],
    projects: [],
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(teamRef, teamData);
    return {
      ...teamData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  } catch (error) {
    const message = error instanceof FirestoreError 
      ? `Database error: ${error.message}`
      : 'Failed to create team';
    throw new Error(message);
  }
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error('Valid team ID is required');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID is required');
  }

  const teamRef = doc(db, 'teams', teamId);

  try {
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    
    if (!teamData.owners?.includes(auth.currentUser.uid)) {
      throw new Error('Only team owners can add members');
    }

    if (teamData.members?.includes(userId)) {
      throw new Error('User is already a team member');
    }

    await updateDoc(teamRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to add members to this team');
        case 'not-found':
          throw new Error('Team not found');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    throw error instanceof Error ? error : new Error('Failed to add team member');
  }
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error('Valid team ID is required');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID is required');
  }

  const teamRef = doc(db, 'teams', teamId);

  try {
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    
    if (!teamData.owners?.includes(auth.currentUser.uid)) {
      throw new Error('Only team owners can remove members');
    }

    if (teamData.owners?.includes(userId) && teamData.owners.length === 1) {
      throw new Error('Cannot remove the last team owner');
    }

    await updateDoc(teamRef, {
      members: arrayRemove(userId),
      owners: teamData.owners?.includes(userId) ? arrayRemove(userId) : teamData.owners,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to remove members from this team');
        case 'not-found':
          throw new Error('Team not found');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    throw error instanceof Error ? error : new Error('Failed to remove team member');
  }
};

export const updateTeam = async (
  teamId: string,
  updates: {
    name?: string;
    description?: string;
  }
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error('Valid team ID is required');
  }

  const teamRef = doc(db, 'teams', teamId);

  try {
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    
    if (!teamData.owners?.includes(auth.currentUser.uid)) {
      throw new Error('Only team owners can update team details');
    }

    await updateDoc(teamRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to update this team');
        case 'not-found':
          throw new Error('Team not found');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    throw error instanceof Error ? error : new Error('Failed to update team');
  }
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!teamId || typeof teamId !== 'string') {
    throw new Error('Valid team ID is required');
  }

  const teamRef = doc(db, 'teams', teamId);

  try {
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();
    
    if (!teamData.owners?.includes(auth.currentUser.uid)) {
      throw new Error('Only team owners can delete the team');
    }

    const batch = writeBatch(db);

    // Delete all projects associated with this team
    const projectsSnapshot = await getDocs(
      query(collection(db, 'projects'), where('teamId', '==', teamId))
    );
    
    projectsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Update all loops that reference this team
    const loopsSnapshot = await getDocs(
      query(collection(db, 'loops'), where('teamId', '==', teamId))
    );

    loopsSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        teamId: null,
        projectId: null,
        updatedAt: serverTimestamp()
      });
    });

    batch.delete(teamRef);
    await batch.commit();
  } catch (error) {
    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('You do not have permission to delete this team');
        case 'not-found':
          throw new Error('Team not found');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    throw error instanceof Error ? error : new Error('Failed to delete team');
  }
};