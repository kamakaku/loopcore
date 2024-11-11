// Update the User interface to include email notification preferences
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rest of the types remain the same
export interface Loop {
  id: string;
  title: string;
  description?: string;
  type: 'url' | 'image' | 'pdf' | 'figma';
  content: string;
  screenshot?: string;
  pdfPages?: string[];
  teamId?: string | null;
  projectId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  spotCount: number;
  commentCount: number;
  status: 'active' | 'archived';
  members: LoopMember[];
  publicId?: string | null;
  isPublic?: boolean;
}

export interface LoopMember {
  id: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: Date;
  addedBy: string;
}

export interface Spot {
  id: string;
  loopId: string;
  number: number;
  position: { x: number; y: number };
  content: string;
  pageNumber: number;
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
}

export interface Comment {
  id: string;
  targetId: string;
  targetType: 'loop' | 'spot';
  content: string;
  attachments?: string[];
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  projects: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string | null;
  members: string[];
  loops: string[];
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}