// FundingProject는 index.ts에서 import
export type { FundingProject } from './index';

export interface Reward {
  id: number;
  title: string;
  description: string;
  amount: number;
  estimatedDelivery: string;
  stock?: number;
  remainingStock?: number;
}

export interface BudgetItem {
  category: string;
  amount: number;
  percentage: number;
  description?: string;
}

export interface Payment {
  id: number;
  projectId: number;
  userId: string;
  amount: number;
  rewardId?: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'card' | 'phone' | 'bank';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface FundingStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFunding: number;
  totalBackers: number;
  successRate: number;
}

export interface FundingFilters {
  category?: string;
  status?: string[];
  search?: string;
  tags?: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
  sortBy?: 'newest' | 'popular' | 'ending' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateFundingProjectRequest {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  endDate: string;
  thumbnail?: string;
  rewards: Omit<Reward, 'id'>[];
  budgetBreakdown: Omit<BudgetItem, 'percentage'>[];
}

export interface UpdateFundingProjectRequest extends Partial<CreateFundingProjectRequest> {
  id: number;
}

export interface BackProjectRequest {
  projectId: number;
  amount: number;
  rewardId?: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: 'card' | 'phone' | 'bank';
  paymentDetails: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardHolder?: string;
    phoneNumber?: string;
    bankAccount?: string;
    bankName?: string;
  };
}

export interface PaymentData {
  id: string;
  projectId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}
