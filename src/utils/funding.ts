export interface FundingProject {
  id: number;
  title: string;
  description: string;
  artistId: number;
  artistName: string;
  artistAvatar: string;
  targetAmount: number;
  currentAmount: number;
  backers: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'success' | 'failed' | 'executing' | 'completed';
  category: string;
  image: string;
  rewards: FundingReward[];
  executionPlan: ExecutionPlan[];
  updates: ProjectUpdate[];
  expenses: ProjectExpense[];
}

export interface FundingReward {
  id: number;
  amount: number;
  title: string;
  description: string;
  backers: number;
  estimatedDelivery: string;
  isLimited?: boolean;
  limitCount?: number;
}

export interface ExecutionPlan {
  id: number;
  phase: string;
  description: string;
  plannedAmount: number;
  usedAmount: number;
  status: 'pending' | 'in-progress' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface ProjectUpdate {
  id: number;
  date: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  type: 'general' | 'expense' | 'milestone';
}

export interface ProjectExpense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  receipt?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface BackerContribution {
  id: number;
  projectId: number;
  userId: number;
  amount: number;
  rewardId?: number;
  date: string;
  status: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
}

export interface RevenueDistribution {
  projectId: number;
  totalRevenue: number;
  platformFee: number;
  artistShare: number;
  backerShare: number;
  distributionDate: string;
  status: 'pending' | 'distributed';
}

export const calculateFundingProgress = (current: number, target: number): number => {
  return Math.min((current / target) * 100, 100);
};

export const getFundingStatus = (
  currentAmount: number,
  targetAmount: number,
  endDate: string
): 'active' | 'success' | 'failed' => {
  const now = new Date();
  const end = new Date(endDate);
  
  if (now > end) {
    return currentAmount >= targetAmount ? 'success' : 'failed';
  }
  
  return 'active';
};

export const calculateDaysLeft = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const mockPaymentProcess = async (
  amount: number,
  paymentMethod: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // 모의 결제 처리
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% 성공률로 모의 결제
      const success = Math.random() > 0.05;
      
      if (success) {
        resolve({
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        resolve({
          success: false,
          error: '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
        });
      }
    }, 2000); // 2초 대기로 실제 결제 과정 시뮬레이션
  });
};

export const mockRefundProcess = async (
  transactionId: string,
  amount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> => {
  // 모의 환불 처리
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        refundId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }, 1500);
  });
};