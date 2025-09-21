import { useApiQuery, useApiMutation, usePaginatedQuery } from './useApi';
import { SearchParams } from '../../types/api';

// 수익 분배 계산
export const useCalculateRevenueDistribution = (projectId: string) => {
  return useApiMutation(`/revenue/calculate/${projectId}`, 'POST', {
    onSuccess: () => {
      // 수익 분배 계산 성공 시 관련 쿼리 무효화
    },
  });
};

// 수익 분배 실행
export const useDistributeRevenue = (projectId: string) => {
  return useApiMutation(`/revenue/distribute/${projectId}`, 'POST', {
    onSuccess: () => {
      // 수익 분배 실행 성공 시 관련 쿼리 무효화
    },
  });
};

// 크리에이터 지급 처리
export const useProcessCreatorPayout = (payoutId: string) => {
  return useApiMutation(`/revenue/payouts/${payoutId}/process`, 'POST', {
    onSuccess: () => {
      // 지급 처리 성공 시 관련 쿼리 무효화
    },
  });
};

// 크리에이터 지급 내역 조회
export const useCreatorPayouts = (creatorId: string, params?: SearchParams) => {
  return usePaginatedQuery(
    ['creator-payouts', creatorId, params || {}],
    `/revenue/payouts/creator/${creatorId}`,
    params || {},
  );
};

// 수익 리포트 생성
export const useGenerateRevenueReport = (projectId: string) => {
  return useApiMutation(`/revenue/reports/${projectId}`, 'POST', {
    onSuccess: () => {
      // 수익 리포트 생성 성공 시 관련 쿼리 무효화
    },
  });
};

// 크리에이터 수익 대시보드
export const useCreatorDashboard = (creatorId: string) => {
  return useApiQuery(
    ['creator-dashboard', creatorId],
    `/revenue/dashboard/creator/${creatorId}`,
    undefined,
    { enabled: !!creatorId },
  );
};

// 플랫폼 수익 통계
export const usePlatformRevenueStats = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useApiQuery(
    ['platform-revenue-stats', params || {}],
    '/revenue/stats/platform',
    params,
  );
};

// 수익 분배 내역 조회
export const useRevenueDistributions = (params?: SearchParams) => {
  return usePaginatedQuery(
    ['revenue-distributions', params || {}],
    '/revenue/distributions',
    params || {},
  );
};
