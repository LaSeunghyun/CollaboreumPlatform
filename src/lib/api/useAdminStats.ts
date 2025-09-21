import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import type { ApiResponse } from '@/shared/types';

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalFunding: number;
  activeUsers: number;
  pendingProjects: number;
  completedProjects: number;
  weeklyNewProjects: number;
  weeklyNewUsers: number;
  averageFundingAmount: number;
  successRate: number;
}

export type AdminStatsResponse = ApiResponse<AdminStats>;

const fetchAdminStats = () => api.get<AdminStats>('/admin/stats');

// 관리자 통계 조회
export const useAdminStats = () => {
  return useQuery<AdminStatsResponse>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// 실시간 통계 업데이트 (WebSocket 또는 폴링)
export const useRealtimeStats = (enabled: boolean = true) => {
  return useQuery<AdminStatsResponse>({
    queryKey: ['admin', 'stats', 'realtime'],
    queryFn: fetchAdminStats,
    enabled,
    refetchInterval: 30000, // 30초마다 업데이트
    staleTime: 0, // 항상 최신 데이터 요청
  });
};
