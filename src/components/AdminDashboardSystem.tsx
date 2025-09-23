import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { useAdminDashboardData } from '@/features/admin/hooks/useAdminDashboardData';
import { StatsOverviewGrid } from '@/features/admin/components/StatsOverviewGrid';
import { AlertsPanel } from '@/features/admin/components/AlertsPanel';
import { SystemStatusCard } from '@/features/admin/components/SystemStatusCard';
import { UserListPanel } from '@/features/admin/components/UserListPanel';
import { ProjectListPanel } from '@/features/admin/components/ProjectListPanel';

interface AdminDashboardSystemProps {
  onUserAction?: (action: string, userId: string) => void;
  onProjectAction?: (action: string, projectId: string) => void;
}

const AdminDashboardSystem: React.FC<AdminDashboardSystemProps> = ({
  onUserAction,
  onProjectAction,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    stats,
    alerts,
    users,
    projects,
    systemStatus,
    recentActivity,
    helpers,
  } = useAdminDashboardData();

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>관리자 대시보드</h1>
          <p className='mt-1 text-gray-600'>
            시스템 전체 현황을 모니터링하고 관리하세요
          </p>
        </div>

        <StatsOverviewGrid
          stats={stats.data}
          loading={stats.loading}
          error={stats.error}
          onRetry={stats.refetch}
          formatCurrency={helpers.formatCurrency}
        />

        <AlertsPanel
          alerts={alerts.items}
          loading={alerts.loading}
          error={alerts.error}
          onRetry={alerts.refetch}
          renderIcon={helpers.getAlertIcon}
          formatRelativeTime={helpers.formatRelativeTime}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>개요</TabsTrigger>
            <TabsTrigger value='users'>사용자 관리</TabsTrigger>
            <TabsTrigger value='projects'>프로젝트 관리</TabsTrigger>
            <TabsTrigger value='system'>시스템 설정</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <SystemStatusCard
                status={systemStatus.data}
                loading={systemStatus.loading}
              />
              <AlertsPanel
                className='mb-0 h-full'
                title='최근 활동'
                alerts={recentActivity}
                loading={alerts.loading}
                error={null}
                onRetry={alerts.refetch}
                renderIcon={helpers.getAlertIcon}
                formatRelativeTime={helpers.formatRelativeTime}
                emptyState='최근 활동 내역이 없습니다.'
              />
            </div>
          </TabsContent>

          <TabsContent value='users' className='mt-6'>
            <UserListPanel
              users={users.items}
              loading={users.loading}
              error={users.error}
              onRetry={users.refetch}
              onUserAction={onUserAction}
              getStatusColor={helpers.getStatusColor}
              getStatusText={helpers.getStatusText}
            />
          </TabsContent>

          <TabsContent value='projects' className='mt-6'>
            <ProjectListPanel
              projects={projects.items}
              loading={projects.loading}
              error={projects.error}
              onRetry={projects.refetch}
              onProjectAction={onProjectAction}
              getStatusColor={helpers.getStatusColor}
              getStatusText={helpers.getStatusText}
              formatCurrency={helpers.formatCurrency}
            />
          </TabsContent>

          <TabsContent value='system' className='mt-6'>
            <div className='rounded-lg border border-gray-200 bg-white p-6'>
              <h3 className='text-lg font-semibold'>시스템 설정</h3>
              <p className='mt-2 text-sm text-gray-500'>
                시스템 설정 기능은 곧 제공될 예정입니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardSystem;
