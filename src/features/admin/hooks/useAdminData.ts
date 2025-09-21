import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import {
  AdminDashboardMetrics,
  User,
  FundingProject,
  Artwork,
  Report,
  FinancialData,
  AdminNotification,
  SystemMetrics,
  UsersResponse,
  ArtworksResponse,
  ReportsResponse,
} from '../types';

// 대시보드 메트릭
export const useAdminMetrics = () => {
  return useQuery<AdminDashboardMetrics>({
    queryKey: ['admin', 'metrics'],
    queryFn: adminService.getDashboardMetrics,
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  });
};

// 사용자 관리
export const useUsers = (params?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery<UsersResponse>({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: string;
      reason?: string;
    }) => adminService.updateUserStatus(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.restoreUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// 펀딩 관리
export const useFundingProjects = (params?: {
  status?: string;
  approvalStatus?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'funding', 'projects', params],
    queryFn: () => adminService.getFundingProjects(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateProjectApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      approvalStatus,
      feedback,
    }: {
      projectId: string;
      approvalStatus: boolean;
      feedback?: string;
    }) =>
      adminService.updateProjectApproval(projectId, approvalStatus, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'funding'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// 작품 관리
export const useArtworks = (params?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery<ArtworksResponse>({
    queryKey: ['admin', 'artworks', params],
    queryFn: () => adminService.getArtworks(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateArtworkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      status,
      reason,
    }: {
      artworkId: string;
      status: string;
      reason?: string;
    }) => adminService.updateArtworkStatus(artworkId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artworks'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// 신고 관리
export const useReports = (params?: {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery<ReportsResponse>({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminService.getReports(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      resolution,
      actionTaken,
      notes,
    }: {
      reportId: string;
      resolution: string;
      actionTaken?: string;
      notes?: string;
    }) => adminService.resolveReport(reportId, resolution, actionTaken, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// 재정 관리
export const useFinancialData = () => {
  return useQuery<FinancialData[]>({
    queryKey: ['admin', 'financial-data'],
    queryFn: adminService.getFinancialData,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 알림 관리
export const useNotifications = () => {
  return useQuery<AdminNotification[]>({
    queryKey: ['admin', 'notifications'],
    queryFn: adminService.getNotifications,
    staleTime: 30 * 1000, // 30초
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      adminService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
};

// 시스템 모니터링
export const useSystemMetrics = () => {
  return useQuery<SystemMetrics>({
    queryKey: ['admin', 'system', 'metrics'],
    queryFn: adminService.getSystemMetrics,
    staleTime: 10 * 1000, // 10초
    refetchInterval: 10 * 1000, // 10초마다 자동 갱신
  });
};

// 통계 데이터
export const useUserGrowthData = (
  period: string = 'monthly',
  months: number = 8,
) => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'user-growth', period, months],
    queryFn: () => adminService.getUserGrowthData(period, months),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useFundingPerformanceData = (
  period: string = 'monthly',
  months: number = 8,
) => {
  return useQuery({
    queryKey: ['admin', 'analytics', 'funding-performance', period, months],
    queryFn: () => adminService.getFundingPerformanceData(period, months),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
