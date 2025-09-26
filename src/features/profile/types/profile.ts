import type { UserRole } from '@/shared/types';

export type { UserRole };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  lastLoginAt: Date;
  status: 'active' | 'suspended' | 'banned';
}

export interface Project {
  id: string;
  title: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  endDate: Date;
}

export interface Backing {
  id: string;
  projectTitle: string;
  amount: number;
  reward?: string;
  backedAt: Date;
  projectStatus: string;
}

export interface Revenue {
  id: string;
  projectTitle: string;
  amount: number;
  distributedAt: Date;
  status: 'pending' | 'completed';
}

export interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
