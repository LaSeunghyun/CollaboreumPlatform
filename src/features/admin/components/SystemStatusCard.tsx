import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import type { DashboardSystemStatus } from '../hooks/useAdminDashboardData';

interface SystemStatusCardProps {
  status: DashboardSystemStatus;
  loading: boolean;
}

export function SystemStatusCard({ status, loading }: SystemStatusCardProps) {
  const { systemHealth, activeUsers, completedProjects, monthlyGrowth } = status;

  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>시스템 상태</h3>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>시스템 건강도</span>
            <span className='font-semibold text-green-600'>
              {loading ? '...' : `${systemHealth}%`}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-green-500'
              style={{ width: `${loading ? 0 : systemHealth}%` }}
            />
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>활성 사용자</span>
            <span className='font-semibold'>
              {loading ? '...' : activeUsers.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>완료된 프로젝트</span>
            <span className='font-semibold'>
              {loading ? '...' : completedProjects.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600'>월간 성장률</span>
            <span className='font-semibold text-green-600'>
              {loading ? '...' : `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`}
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
