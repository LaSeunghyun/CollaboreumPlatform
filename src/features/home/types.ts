import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/api/useCategories';

export interface PlatformStats {
  totalArtists: number;
  totalProjects: number;
  totalFunding: number;
  totalUsers: number;
}

export interface HomeStatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface ArtistSummary {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  category: string;
  tags: string[];
  featuredWork?: string;
  followers: number;
  isFollowing?: boolean;
  isVerified?: boolean;
  bio?: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
}

export interface NoticeSummary {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  isImportant?: boolean;
  isPinned?: boolean;
}

export interface CommunityAuthor {
  name: string;
  isVerified?: boolean;
}

export interface CommunityPostSummary {
  id: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  author: CommunityAuthor;
  isHot?: boolean;
}

export type CategoryList = Category[];
