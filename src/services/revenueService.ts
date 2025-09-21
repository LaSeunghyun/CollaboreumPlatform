import { api } from '@/lib/api/api';
import type { ApiResponse } from '@/shared/types';

// 수익 분배 관련 타입 정의
export interface RevenueDistribution {
  projectId: string;
  totalRevenue: number;
  platformFee: number; // 플랫폼 수수료 (5%)
  creatorRevenue: number; // 크리에이터 수익 (95%)
  distributionDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CreatorPayout {
  creatorId: string;
  projectId: string;
  amount: number;
  bankAccount: {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  failureReason?: string;
}

export interface RevenueReport {
  projectId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalRevenue: number;
  platformFee: number;
  creatorRevenue: number;
  backerCount: number;
  averageBackAmount: number;
  topRewards: Array<{
    rewardId: string;
    name: string;
    amount: number;
    backerCount: number;
  }>;
}

// 수익 분배 서비스 클래스
class RevenueService {
  // 프로젝트 완료 후 수익 분배 계산
  async calculateRevenueDistribution(
    projectId: string,
  ): Promise<ApiResponse<RevenueDistribution>> {
    return api.post<RevenueDistribution>(`/revenue/calculate/${projectId}`);
  }

  // 수익 분배 실행
  async distributeRevenue(
    projectId: string,
  ): Promise<ApiResponse<RevenueDistribution>> {
    return api.post<RevenueDistribution>(`/revenue/distribute/${projectId}`);
  }

  // 크리에이터 지급 처리
  async processCreatorPayout(
    payoutId: string,
  ): Promise<ApiResponse<CreatorPayout>> {
    return api.post<CreatorPayout>(`/revenue/payouts/${payoutId}/process`);
  }

  // 크리에이터 지급 내역 조회
  async getCreatorPayouts(
    creatorId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ): Promise<ApiResponse<CreatorPayout[]>> {
    return api.get<CreatorPayout[]>(
      `/revenue/payouts/creator/${creatorId}`,
      params,
    );
  }

  // 수익 리포트 생성
  async generateRevenueReport(
    projectId: string,
    period: {
      startDate: string;
      endDate: string;
    },
  ): Promise<ApiResponse<RevenueReport>> {
    return api.post<RevenueReport>(`/revenue/reports/${projectId}`, period);
  }

  // 플랫폼 수익 통계
  async getPlatformRevenueStats(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<
    ApiResponse<{
      totalRevenue: number;
      totalPlatformFee: number;
      totalCreatorRevenue: number;
      projectCount: number;
      dailyStats: Array<{
        date: string;
        revenue: number;
        platformFee: number;
        creatorRevenue: number;
      }>;
    }>
  > {
    return api.get<{
      totalRevenue: number;
      totalPlatformFee: number;
      totalCreatorRevenue: number;
      projectCount: number;
      dailyStats: Array<{
        date: string;
        revenue: number;
        platformFee: number;
        creatorRevenue: number;
      }>;
    }>('/revenue/stats/platform', params);
  }

  // 크리에이터 수익 대시보드
  async getCreatorDashboard(creatorId: string): Promise<
    ApiResponse<{
      totalEarnings: number;
      pendingPayouts: number;
      completedPayouts: number;
      projectCount: number;
      monthlyEarnings: Array<{
        month: string;
        earnings: number;
      }>;
      topProjects: Array<{
        projectId: string;
        title: string;
        earnings: number;
      }>;
    }>
  > {
    return api.get<{
      totalEarnings: number;
      pendingPayouts: number;
      completedPayouts: number;
      projectCount: number;
      monthlyEarnings: Array<{
        month: string;
        earnings: number;
      }>;
      topProjects: Array<{
        projectId: string;
        title: string;
        earnings: number;
      }>;
    }>(`/revenue/dashboard/creator/${creatorId}`);
  }

  // 수익 분배 실패 처리
  async retryFailedDistribution(
    distributionId: string,
  ): Promise<ApiResponse<RevenueDistribution>> {
    return api.post<RevenueDistribution>(
      `/revenue/distributions/${distributionId}/retry`,
    );
  }

  // 수익 분배 내역 조회
  async getDistributionHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    projectId?: string;
  }): Promise<ApiResponse<RevenueDistribution[]>> {
    return api.get<RevenueDistribution[]>('/revenue/distributions', params);
  }
}

export const revenueService = new RevenueService();
