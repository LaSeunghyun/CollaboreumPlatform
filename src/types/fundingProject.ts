// 펀딩 프로젝트 관련 타입 정의

export interface FundingProject {
  id: string;
  title: string;
  description?: string;
  artist: string;
  category: string;
  goalAmount: number;
  targetAmount?: number;
  currentAmount: number;
  backers: number;
  daysLeft: number;
  image: string;
  status: string;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  story?: string;
  artistAvatar?: string;
  artistRating?: number;
  artistId?: string;
  featured?: boolean;
  rewards: Reward[];
  updates: ProjectUpdate[];
  backersList: Backer[];
  executionPlan: ExecutionPlan;
  expenseRecords: ExpenseRecord[];
  revenueDistribution: RevenueDistribution;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
  estimatedDelivery: string;
  claimed?: number;
  maxClaim?: number;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  type?: string;
  createdAt?: string;
}

export interface Backer {
  id: string;
  userId?: string;
  userName: string;
  amount: number;
  date: string;
  status: string;
}

export interface ExecutionStage {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

export interface ExecutionPlan {
  stages: ExecutionStage[];
  totalBudget: number;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  receipt: string;
  stage: string;
  verified: boolean;
}

export interface Distribution {
  id: string;
  backer?: string;
  userName: string;
  originalAmount: number;
  profitShare: number;
  amount: number;
  date: string;
  status: string;
}

export interface RevenueShare {
  amount: number;
  percentage: number;
}

export interface RevenueDistribution {
  totalRevenue: number;
  platformFee: RevenueShare;
  artistShare: RevenueShare;
  backerShare: RevenueShare;
  distributions: Distribution[];
}
