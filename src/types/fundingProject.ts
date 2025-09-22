// 펀딩 프로젝트 관련 타입 정의

export interface FundingProject {
  id: string;
  title: string;
  description: string;
  artist: string;
  category: string;
  goalAmount: number;
  targetAmount: number;
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

export interface FundingProjectRewardPayload {
  id?: string | number;
  _id?: string | number;
  title?: string;
  description?: string;
  amount?: number | string;
  estimatedDelivery?: string | Date;
  claimed?: number | string;
  maxClaim?: number | string;
}

export interface FundingProjectUpdatePayload {
  id?: string | number;
  _id?: string | number;
  title?: string;
  content?: string;
  date?: string | Date;
  createdAt?: string | Date;
  type?: string;
}

export interface FundingProjectBackerPayload {
  id?: string | number;
  _id?: string | number;
  userId?: string | number;
  user?: string | number | { _id?: string | number };
  userName?: string;
  isAnonymous?: boolean;
  amount?: number | string;
  date?: string | Date;
  backedAt?: string | Date;
  status?: string;
}

export interface FundingProjectExecutionStagePayload {
  id?: string | number;
  _id?: string | number;
  name?: string;
  description?: string;
  budget?: number | string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  progress?: number | string;
}

export interface FundingProjectExecutionPlanPayload {
  stages?: (FundingProjectExecutionStagePayload | null | undefined)[];
  totalBudget?: number | string;
}

export interface FundingProjectExpensePayload {
  id?: string | number;
  _id?: string | number;
  category?: string;
  title?: string;
  description?: string;
  amount?: number | string;
  date?: string | Date;
  receipt?: string;
  stage?: string | number;
  verified?: boolean;
}

export interface FundingProjectDistributionPayload {
  id?: string | number;
  _id?: string | number;
  backer?: string | number | { _id?: string | number };
  userName?: string;
  originalAmount?: number | string;
  profitShare?: number | string;
  amount?: number | string;
  totalReturn?: number | string;
  date?: string | Date;
  distributedAt?: string | Date;
  status?: string;
}

export type RevenueSharePayload =
  | FundingProjectRevenueShareObjectPayload
  | number
  | string
  | null
  | undefined;

export interface FundingProjectRevenueShareObjectPayload {
  amount?: number | string;
  percentage?: number | string;
}

export interface FundingProjectRevenueDistributionPayload {
  totalRevenue?: number | string;
  platformFee?: RevenueSharePayload;
  artistShare?: RevenueSharePayload;
  backerShare?: RevenueSharePayload;
  distributions?: (FundingProjectDistributionPayload | null | undefined)[];
}

export interface FundingProjectPayload {
  id?: string | number;
  _id?: string | number;
  title?: string;
  description?: string;
  artist?:
    | string
    | {
        _id?: string | number;
        name?: string;
      };
  artistName?: string;
  category?: string;
  goalAmount?: number | string;
  targetAmount?: number | string;
  currentAmount?: number | string;
  backers?: number | FundingProjectBackerPayload[];
  backersList?: (FundingProjectBackerPayload | null | undefined)[];
  daysLeft?: number | string;
  image?: string;
  status?: string;
  progressPercentage?: number | string;
  progress?: number | string;
  startDate?: string | Date;
  endDate?: string | Date;
  story?: string;
  artistAvatar?: string;
  artistRating?: number;
  artistId?: string | number;
  featured?: boolean;
  rewards?: (FundingProjectRewardPayload | null | undefined)[];
  updates?: (FundingProjectUpdatePayload | null | undefined)[];
  executionPlan?: FundingProjectExecutionPlanPayload;
  expenseRecords?: (FundingProjectExpensePayload | null | undefined)[];
  revenueDistribution?: FundingProjectRevenueDistributionPayload;
}
