import { useMemo } from 'react';
import { Loop, Project, Team, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useUserRole(item: Loop | Project | Team | null): UserRole | null {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !item) return null;

    // For Loops
    if ('type' in item) {
      // Creator is owner
      if (item.createdBy === user.uid) return 'owner';

      // Direct member role
      const memberRole = item.members?.[user.uid]?.role;
      if (memberRole) return memberRole;

      // Team or project access grants editor role
      if (item.teamId || item.projectId) return 'editor';
    }

    // For Teams and Projects
    if (item.createdBy === user.uid) return 'owner';
    if (item.members?.includes(user.uid)) return 'editor';

    return null;
  }, [user, item]);
}

export function canEdit(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canManageUsers(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canDelete(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canArchive(role: UserRole | null): boolean {
  return role === 'owner';
}

export function canAddSpots(role: UserRole | null): boolean {
  return role === 'owner' || role === 'editor' || role === 'viewer';
}

export function canAddComments(role: UserRole | null): boolean {
  return role === 'owner' || role === 'editor' || role === 'viewer';
}

export function canEditSpots(role: UserRole | null, creatorId: string, userId: string): boolean {
  return creatorId === userId;
}

export function canEditComments(role: UserRole | null, creatorId: string, userId: string): boolean {
  return creatorId === userId;
}

export function canManageLoop(role: UserRole | null, creatorId: string, userId: string): boolean {
  return creatorId === userId;
}