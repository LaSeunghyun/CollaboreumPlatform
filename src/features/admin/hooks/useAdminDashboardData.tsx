import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { statsAPI } from '@/services/api/stats';
import { adminAPI } from '@/services/api/admin';
import { adminService } from '../services/adminService';
import type { AdminNotification, AdminDashboardMetrics } from '../types';

type UnknownRecord = Record<string, unknown>;

const safeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fallbackId = () => Math.random().toString(36).slice(2, 10);

export interface DashboardStatsSummary {
  totalUsers: number;
  totalRevenue: number;
  totalProjects: number;
  pendingApprovals: number;
}

export interface DashboardSystemStatus {
  systemHealth: number;
  activeUsers: number;
  completedProjects: number;
  monthlyGrowth: number;
}

export interface DashboardAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp?: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  status: string;
  joinDate?: string;
  lastActive?: string;
  projects: number;
}

export interface DashboardProject {
  id: string;
  title: string;
  artist: string;
  status: string;
  amount: number;
  targetAmount: number;
  backers: number;
  createdAt?: string;
}

export interface UseAdminDashboardDataResult {
  stats: {
    data: DashboardStatsSummary;
    loading: boolean;
    error: unknown;
    refetch: () => void;
  };
  systemStatus: {
    data: DashboardSystemStatus;
    loading: boolean;
  };
  alerts: {
    items: DashboardAlert[];
    loading: boolean;
    error: unknown;
    refetch: () => void;
  };
  users: {
    items: DashboardUser[];
    loading: boolean;
    error: unknown;
    refetch: () => void;
  };
  projects: {
    items: DashboardProject[];
    loading: boolean;
    error: unknown;
    refetch: () => void;
  };
  recentActivity: DashboardAlert[];
  helpers: {
    formatCurrency: (amount: unknown) => string;
    getStatusColor: (status: string) => string;
    getStatusText: (status: string) => string;
    getAlertIcon: (type: string) => ReactNode;
    formatRelativeTime: (value?: string) => string;
  };
}

const extractData = <T,>(value: unknown, fallback: T): T => {
  if (value && typeof value === 'object') {
    const record = value as UnknownRecord;
    if (Array.isArray(record.data)) {
      return record.data as T;
    }
  }
  return (value as T) ?? fallback;
};

export const useAdminDashboardData = (): UseAdminDashboardDataResult => {
  const {
    data: platformStatsData,
    isLoading: platformStatsLoading,
    error: platformStatsError,
    refetch: refetchPlatformStats,
  } = useQuery({
    queryKey: ['stats', 'platform'],
    queryFn: statsAPI.getPlatformStats,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: dashboardMetricsData,
    isLoading: dashboardMetricsLoading,
    error: dashboardMetricsError,
    refetch: refetchDashboardMetrics,
  } = useQuery({
    queryKey: ['admin', 'dashboard', 'metrics'],
    queryFn: adminService.getDashboardMetrics,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin', 'users', 'recent'],
    queryFn: () =>
      adminService.getUsers({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['admin', 'funding', 'projects', 'recent'],
    queryFn: () =>
      adminService.getFundingProjects({
        limit: 5,
        sortBy: 'createdAt',
        order: 'desc',
      }),
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: notificationsData,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminService.getNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const { data: reportedContentData } = useQuery({
    queryKey: ['admin', 'reported-content'],
    queryFn: adminAPI.getReportedContent,
    staleTime: 60 * 1000,
  });

  const platformStats = useMemo(() => {
    if (!platformStatsData) return {} as UnknownRecord;
    if (typeof platformStatsData === 'object' && 'data' in platformStatsData) {
      return ((platformStatsData as UnknownRecord).data ?? {}) as UnknownRecord;
    }
    return (platformStatsData as UnknownRecord) ?? {};
  }, [platformStatsData]);

  const dashboardMetrics = useMemo(() => {
    if (!dashboardMetricsData) return {} as AdminDashboardMetrics;
    if (
      typeof dashboardMetricsData === 'object' &&
      'data' in dashboardMetricsData
    ) {
      return ((dashboardMetricsData as unknown as UnknownRecord).data ??
        {}) as AdminDashboardMetrics;
    }
    return (
      (dashboardMetricsData as AdminDashboardMetrics) ??
      ({} as AdminDashboardMetrics)
    );
  }, [dashboardMetricsData]);

  const pendingReportsCount = useMemo(() => {
    const raw =
      (reportedContentData as UnknownRecord)?.data ?? reportedContentData ?? [];

    if (Array.isArray(raw)) {
      return raw.length;
    }

    if (Array.isArray((raw as UnknownRecord)?.items)) {
      return ((raw as UnknownRecord).items as unknown[]).length;
    }

    if (typeof (raw as UnknownRecord)?.total === 'number') {
      return safeNumber((raw as UnknownRecord).total);
    }

    return 0;
  }, [reportedContentData]);

  const computedStats = useMemo(() => {
    const totalUsers = safeNumber(
      platformStats.totalUsers ?? dashboardMetrics.userMetrics?.totalUsers,
    );
    const totalProjects = safeNumber(
      platformStats.totalProjects ??
        dashboardMetrics.fundingMetrics?.activeProjects,
    );
    const totalRevenue = safeNumber(
      platformStats.totalFunding ??
        platformStats.totalRevenue ??
        dashboardMetrics.revenueMetrics?.monthlyRevenue,
    );
    const activeUsers = safeNumber(
      platformStats.activeUsers ??
        dashboardMetrics.userMetrics?.activeArtists ??
        dashboardMetrics.userMetrics?.newUsersThisWeek,
    );
    const completedProjects = safeNumber(
      dashboardMetrics.fundingMetrics?.successfulProjectsThisMonth,
    );
    const pendingApprovals = safeNumber(
      dashboardMetrics.communityMetrics?.pendingReports ?? pendingReportsCount,
    );
    const monthlyGrowth = safeNumber(
      dashboardMetrics.revenueMetrics?.growthRate,
    );
    const queueSize = safeNumber(
      dashboardMetrics.communityMetrics?.moderationQueue ?? pendingReportsCount,
    );
    const systemHealth = Math.max(55, Math.min(100, 100 - queueSize * 2));

    return {
      totalUsers,
      totalProjects,
      totalRevenue,
      pendingApprovals,
      activeUsers,
      completedProjects,
      monthlyGrowth,
      systemHealth,
    };
  }, [dashboardMetrics, pendingReportsCount, platformStats]);

  const users = useMemo<DashboardUser[]>(() => {
    const raw = extractData(usersData, [] as unknown[]);

    const userArray: any[] = Array.isArray(raw)
      ? raw
      : ((raw as UnknownRecord)?.users as any[]) || [];
    return userArray
      .map((user: any) => user ?? {})
      .map((user: any) => ({
        id: String(
          user.id ?? user._id ?? user.userId ?? user.uuid ?? fallbackId(),
        ),
        name: user.name ?? user.username ?? '이름 미상',
        email: user.email ?? '이메일 정보 없음',
        status: (user.status ?? 'active') as string,
        joinDate: user.joinDate ?? user.createdAt ?? undefined,
        lastActive:
          user.lastActivity ?? user.lastLogin ?? user.updatedAt ?? undefined,
        projects: safeNumber(
          user.fundingCount ?? user.projectCount ?? user.projects ?? 0,
        ),
      }));
  }, [usersData]);

  const projects = useMemo<DashboardProject[]>(() => {
    const raw = extractData(projectsData, [] as unknown[]);

    const projectArray: any[] = Array.isArray(raw)
      ? raw
      : ((raw as UnknownRecord)?.projects as any[]) || [];
    return projectArray
      .map((project: any) => project ?? {})
      .map((project: any) => ({
        id: String(
          project.id ?? project._id ?? project.projectId ?? fallbackId(),
        ),
        title: project.title ?? '이름 없는 프로젝트',
        artist: project.artist?.name ?? project.artistName ?? '알 수 없음',
        status: (project.approvalStatus ??
          project.status ??
          'pending') as string,
        amount: safeNumber(
          project.currentAmount ?? project.amount ?? project.raisedAmount ?? 0,
        ),
        targetAmount: safeNumber(
          project.goalAmount ??
            project.targetAmount ??
            project.fundingGoal ??
            0,
        ),
        backers: safeNumber(project.backerCount ?? project.backers ?? 0),
        createdAt: project.submissionDate ?? project.createdAt ?? undefined,
      }));
  }, [projectsData]);

  const alerts = useMemo<DashboardAlert[]>(() => {
    const raw = extractData<AdminNotification[]>(notificationsData, []);

    if (Array.isArray(raw)) {
      return raw.map(alert => ({
        id: String(alert.id ?? fallbackId()),
        type: alert.type ?? 'info',
        title: alert.title ?? '알림',
        message: alert.message ?? '',
        timestamp: alert.timestamp,
      }));
    }

    return [];
  }, [notificationsData]);

  const formatCurrency = useCallback((amount: unknown) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeNumber(amount));
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-success-100 text-success-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
      case 'banned':
      case 'rejected':
        return 'bg-danger-100 text-danger-700';
      case 'collecting':
      case 'pending':
      case 'under_review':
        return 'bg-warning-100 text-warning-700';
      case 'succeeded':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'suspended':
      case 'banned':
        return '정지';
      case 'collecting':
        return '모금 중';
      case 'succeeded':
        return '성공';
      case 'failed':
        return '실패';
      case 'pending':
        return '대기';
      case 'approved':
        return '승인';
      case 'under_review':
        return '검토 중';
      case 'rejected':
        return '거절';
      default:
        return status;
    }
  }, []);

  const getAlertIcon = useCallback((type: string): ReactNode => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-warning-600' />;
      case 'error':
      case 'urgent':
        return <XCircle className='h-5 w-5 text-danger-600' />;
      case 'success':
        return <CheckCircle className='h-5 w-5 text-success-600' />;
      default:
        return <Clock className='h-5 w-5 text-blue-600' />;
    }
  }, []);

  const formatRelativeTime = useCallback((value?: string) => {
    if (!value) return '';

    try {
      return formatDistanceToNow(new Date(value), {
        addSuffix: true,
        locale: ko,
      });
    } catch (error) {
      return value;
    }
  }, []);

  const refetchStats = useCallback(() => {
    void refetchPlatformStats();
    void refetchDashboardMetrics();
  }, [refetchDashboardMetrics, refetchPlatformStats]);

  return {
    stats: {
      data: {
        totalUsers: computedStats.totalUsers,
        totalRevenue: computedStats.totalRevenue,
        totalProjects: computedStats.totalProjects,
        pendingApprovals: computedStats.pendingApprovals,
      },
      loading: platformStatsLoading || dashboardMetricsLoading,
      error: platformStatsError ?? dashboardMetricsError,
      refetch: refetchStats,
    },
    systemStatus: {
      data: {
        systemHealth: computedStats.systemHealth,
        activeUsers: computedStats.activeUsers,
        completedProjects: computedStats.completedProjects,
        monthlyGrowth: computedStats.monthlyGrowth,
      },
      loading: platformStatsLoading || dashboardMetricsLoading,
    },
    alerts: {
      items: alerts,
      loading: alertsLoading,
      error: alertsError,
      refetch: () => {
        void refetchAlerts();
      },
    },
    users: {
      items: users,
      loading: usersLoading,
      error: usersError,
      refetch: () => {
        void refetchUsers();
      },
    },
    projects: {
      items: projects,
      loading: projectsLoading,
      error: projectsError,
      refetch: () => {
        void refetchProjects();
      },
    },
    recentActivity: alerts.slice(0, 3),
    helpers: {
      formatCurrency,
      getStatusColor,
      getStatusText,
      getAlertIcon,
      formatRelativeTime,
    },
  };
};

export const dashboardStatIcons: Record<
  keyof DashboardStatsSummary,
  ReactNode
> = {
  totalUsers: <Users className='h-8 w-8 text-blue-600' />,
  totalRevenue: <DollarSign className='h-8 w-8 text-green-600' />,
  totalProjects: <BarChart3 className='h-8 w-8 text-purple-600' />,
  pendingApprovals: <AlertTriangle className='h-8 w-8 text-warning-600' />,
};
