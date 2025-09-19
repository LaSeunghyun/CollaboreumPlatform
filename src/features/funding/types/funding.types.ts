export interface FundingProject {
  id: number;
  title: string;
  description: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  rewards: Reward[];
  budgetBreakdown: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

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
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'newest' | 'popular' | 'ending' | 'amount';
  sortOrder?: 'asc' | 'desc';
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
