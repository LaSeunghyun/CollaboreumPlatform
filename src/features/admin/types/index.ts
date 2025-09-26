import type { UserRole } from '@/shared/types';

// Admin 관련 타입 정의
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type AdminRole =
  | 'super_admin'
  | 'operator'
  | 'finance'
  | 'community_manager';

export interface AdminPermissions {
  userManagement: boolean;
  artistApproval: boolean;
  fundingOversight: boolean;
  financeAccess: boolean;
  communityModeration: boolean;
  systemAdmin: boolean;
}

export interface AdminNotification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'funding' | 'user_management' | 'reports' | 'revenue' | 'system';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
  read: boolean;
  data?: any;
  relatedUser?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface SystemMetrics {
  serverLoad: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeUsers: number;
  ongoingTransactions: number;
  errorRate: number;
  uptime: string;
  lastUpdate: string;
}

export interface AdminDashboardMetrics {
  userMetrics: {
    totalUsers: number;
    newUsersThisWeek: number;
    activeArtists: number;
    userGrowthRate: number;
  };
  fundingMetrics: {
    activeProjects: number;
    successfulProjectsThisMonth: number;
    totalFundedAmount: number;
    successRate: number;
  };
  revenueMetrics: {
    monthlyRevenue: number;
    platformFees: number;
    pendingPayouts: number;
    growthRate: number;
  };
  communityMetrics: {
    pendingReports: number;
    postsThisWeek: number;
    activeDiscussions: number;
    moderationQueue: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joinDate: string;
  lastActivity: string;
  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  fundingCount: number;
  totalInvestment: number;
  reportCount: number;
}

export interface FundingProject {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
    avatar?: string;
  };
  category: string;
  goalAmount: number;
  currentAmount: number;
  backerCount: number;
  deadline: string;
  status: 'active' | 'successful' | 'failed' | 'pending' | 'draft';
  submissionDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
}

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  category: string;
  medium: string;
  dimensions: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  views: number;
  likes: number;
}

export interface Report {
  id: number;
  reporter: {
    id: number;
    name: string;
    avatar?: string;
  };
  reportedUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  contentType: 'user' | 'project' | 'post' | 'comment' | 'live_stream';
  contentId: number;
  reason:
    | 'spam'
    | 'harassment'
    | 'inappropriate_content'
    | 'fraud'
    | 'copyright'
    | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface FinancialData {
  month: string;
  totalRevenue: number;
  platformFee: number;
  artistPayouts: number;
  investorReturns: number;
  pendingPayments: number;
}

// API 응답 타입들
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArtworksResponse {
  artworks: Artwork[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
