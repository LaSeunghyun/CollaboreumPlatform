import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/Tabs';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';
import {
  Users,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Shield,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { adminAPI } from '@/services/api/admin';
import { statsAPI } from '@/services/api/stats';
import { adminService } from '@/features/admin/services/adminService';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AdminDashboardSystemProps {
  onUserAction?: (action: string, userId: string) => void;
  onProjectAction?: (action: string, projectId: string) => void;
}

const safeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fallbackId = () => Math.random().toString(36).slice(2, 10);

const formatRelativeTime = (value?: string) => {
  if (!value) return '';

  try {
    return formatDistanceToNow(new Date(value), {
      addSuffix: true,
      locale: ko,
    });
  } catch (error) {
    return value;
  }
};

const AdminDashboardSystem: React.FC<AdminDashboardSystemProps> = ({
  onUserAction,
  onProjectAction,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

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

  const platformStats = useMemo(
    () => (platformStatsData as any)?.data ?? platformStatsData ?? {},
    [platformStatsData],
  );
  const dashboardMetrics = useMemo(
    () => (dashboardMetricsData as any)?.data ?? dashboardMetricsData ?? {},
    [dashboardMetricsData],
  );

  const pendingReportsCount = useMemo(() => {
    const raw = (reportedContentData as any)?.data ?? reportedContentData ?? [];

    if (Array.isArray(raw)) {
      return raw.length;
    }

    if (Array.isArray(raw?.items)) {
      return raw.items.length;
    }

    if (typeof raw?.total === 'number') {
      return raw.total;
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

  const users = useMemo(() => {
    if (!usersData) return [];
    const raw =
      (usersData as any).data?.users ??
      (usersData as any).users ??
      (Array.isArray(usersData) ? usersData : []);
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const normalizedUsers = useMemo(() => {
    return users.map((user: any) => ({
      id: String(
        user.id ?? user._id ?? user.userId ?? user.uuid ?? fallbackId(),
      ),
      name: user.name ?? user.username ?? '이름 미상',
      email: user.email ?? '이메일 정보 없음',
      status: (user.status ?? 'active') as string,
      joinDate: user.joinDate ?? user.createdAt ?? '',
      lastActive: user.lastActivity ?? user.lastLogin ?? user.updatedAt ?? '',
      projects: safeNumber(
        user.fundingCount ?? user.projectCount ?? user.projects ?? 0,
      ),
    }));
  }, [users]);

  const projects = useMemo(() => {
    if (!projectsData) return [];
    const raw =
      (projectsData as any).data ??
      (projectsData as any).projects ??
      (Array.isArray(projectsData) ? projectsData : []);
    return Array.isArray(raw) ? raw : [];
  }, [projectsData]);

  const normalizedProjects = useMemo(() => {
    return projects.map((project: any) => ({
      id: String(
        project.id ?? project._id ?? project.projectId ?? fallbackId(),
      ),
      title: project.title ?? '이름 없는 프로젝트',
      artist: project.artist?.name ?? project.artistName ?? '알 수 없음',
      status: (project.approvalStatus ?? project.status ?? 'pending') as string,
      amount: safeNumber(
        project.currentAmount ?? project.amount ?? project.raisedAmount ?? 0,
      ),
      targetAmount: safeNumber(
        project.goalAmount ?? project.targetAmount ?? project.fundingGoal ?? 0,
      ),
      backers: safeNumber(project.backerCount ?? project.backers ?? 0),
      createdAt: project.submissionDate ?? project.createdAt ?? '',
    }));
  }, [projects]);

  const alerts = useMemo(() => {
    const raw = (notificationsData as any)?.data ?? notificationsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [notificationsData]);

  const statsLoading = platformStatsLoading || dashboardMetricsLoading;
  const statsError = platformStatsError || dashboardMetricsError;

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeNumber(amount));
  };

  const getStatusColor = (status: string) => {
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
  };

  const getStatusText = (status: string) => {
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
  };

  const getAlertIcon = (type: string) => {
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
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>관리자 대시보드</h1>
          <p className='mt-1 text-gray-600'>
            시스템 전체 현황을 모니터링하고 관리하세요
          </p>
        </div>

        {statsError && (
          <div className='mb-6'>
            <ErrorMessage
              error={statsError as Error}
              onRetry={() => {
                refetchPlatformStats();
                refetchDashboardMetrics();
              }}
            />
          </div>
        )}

        {/* 통계 카드 */}
        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <Users className='h-8 w-8 text-blue-600' />
                <div>
                  <p className='text-sm text-gray-600'>총 사용자</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {statsLoading
                      ? '...'
                      : computedStats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <DollarSign className='h-8 w-8 text-green-600' />
                <div>
                  <p className='text-sm text-gray-600'>총 수익</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {statsLoading
                      ? '...'
                      : formatCurrency(computedStats.totalRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <BarChart3 className='h-8 w-8 text-purple-600' />
                <div>
                  <p className='text-sm text-gray-600'>총 프로젝트</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {statsLoading
                      ? '...'
                      : computedStats.totalProjects.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-3'>
                <AlertTriangle className='h-8 w-8 text-warning-600' />
                <div>
                  <p className='text-sm text-gray-600'>승인 대기</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {statsLoading
                      ? '...'
                      : computedStats.pendingApprovals.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 알림 */}
        <Card className='mb-8'>
          <CardHeader>
            <h3 className='text-lg font-semibold'>시스템 알림</h3>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <ProjectListSkeleton />
            ) : alertsError ? (
              <ErrorMessage
                error={alertsError as Error}
                onRetry={() => refetchAlerts()}
              />
            ) : alerts.length > 0 ? (
              <div className='space-y-3'>
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'
                  >
                    {getAlertIcon(alert.type)}
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>{alert.title}</p>
                      <p className='text-sm text-gray-600'>{alert.message}</p>
                    </div>
                    <span className='text-xs text-gray-500'>
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                새로운 시스템 알림이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>개요</TabsTrigger>
            <TabsTrigger value='users'>사용자 관리</TabsTrigger>
            <TabsTrigger value='projects'>프로젝트 관리</TabsTrigger>
            <TabsTrigger value='system'>시스템 설정</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* 시스템 상태 */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>시스템 상태</h3>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        시스템 건강도
                      </span>
                      <span className='font-semibold text-green-600'>
                        {statsLoading
                          ? '...'
                          : `${computedStats.systemHealth}%`}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-green-500'
                        style={{
                          width: `${statsLoading ? 0 : computedStats.systemHealth}%`,
                        }}
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>활성 사용자</span>
                      <span className='font-semibold'>
                        {statsLoading
                          ? '...'
                          : computedStats.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        완료된 프로젝트
                      </span>
                      <span className='font-semibold'>
                        {statsLoading
                          ? '...'
                          : computedStats.completedProjects.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>월간 성장률</span>
                      <span className='font-semibold text-green-600'>
                        {statsLoading
                          ? '...'
                          : `${computedStats.monthlyGrowth >= 0 ? '+' : ''}${computedStats.monthlyGrowth.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 최근 활동 */}
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>최근 활동</h3>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {alerts.slice(0, 3).map((alert: any) => (
                      <div
                        key={alert.id}
                        className='flex items-center space-x-3'
                      >
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div>
                          <p className='text-sm font-medium'>{alert.title}</p>
                          <p className='text-xs text-gray-500'>
                            {formatRelativeTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {alerts.length === 0 && (
                      <p className='text-sm text-gray-500'>
                        최근 활동 내역이 없습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='users' className='mt-6'>
            <Card>
              <CardHeader>
                <h3 className='text-lg font-semibold'>사용자 관리</h3>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <ProjectListSkeleton />
                ) : usersError ? (
                  <ErrorMessage
                    error={usersError as Error}
                    onRetry={() => refetchUsers()}
                  />
                ) : normalizedUsers.length > 0 ? (
                  <div className='space-y-4'>
                    {normalizedUsers.map(user => (
                      <div
                        key={user.id}
                        className='flex items-center justify-between rounded-lg border border-gray-200 p-4'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100'>
                            <Users className='h-5 w-5 text-primary-600' />
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>
                              {user.name}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {user.email}
                            </p>
                            <p className='text-xs text-gray-500'>
                              가입일:{' '}
                              {user.joinDate
                                ? new Date(user.joinDate).toLocaleDateString()
                                : '정보 없음'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}
                          >
                            {getStatusText(user.status)}
                          </span>
                          <div className='flex space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onUserAction?.('view', user.id)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onUserAction?.('edit', user.id)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onUserAction?.('suspend', user.id)}
                            >
                              <Shield className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>
                    표시할 사용자가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='projects' className='mt-6'>
            <Card>
              <CardHeader>
                <h3 className='text-lg font-semibold'>프로젝트 관리</h3>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <ProjectListSkeleton />
                ) : projectsError ? (
                  <ErrorMessage
                    error={projectsError as Error}
                    onRetry={() => refetchProjects()}
                  />
                ) : normalizedProjects.length > 0 ? (
                  <div className='space-y-4'>
                    {normalizedProjects.map(project => (
                      <div
                        key={project.id}
                        className='flex items-center justify-between rounded-lg border border-gray-200 p-4'
                      >
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900'>
                            {project.title}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            by {project.artist}
                          </p>
                          <div className='mt-2 flex items-center space-x-4 text-sm text-gray-500'>
                            <span>
                              목표: {formatCurrency(project.targetAmount)}
                            </span>
                            <span>•</span>
                            <span>현재: {formatCurrency(project.amount)}</span>
                            <span>•</span>
                            <span>
                              후원자: {project.backers.toLocaleString()}명
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}
                          >
                            {getStatusText(project.status)}
                          </span>
                          <div className='flex space-x-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                onProjectAction?.('view', project.id)
                              }
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                onProjectAction?.('approve', project.id)
                              }
                            >
                              <CheckCircle className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                onProjectAction?.('reject', project.id)
                              }
                            >
                              <XCircle className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>
                    검토할 프로젝트가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='system' className='mt-6'>
            <Card>
              <CardHeader>
                <h3 className='text-lg font-semibold'>시스템 설정</h3>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-500'>
                  시스템 설정 기능은 곧 제공될 예정입니다.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardSystem;
