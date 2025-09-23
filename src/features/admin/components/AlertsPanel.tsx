import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';
import type { ReactNode } from 'react';
import type { DashboardAlert } from '../hooks/useAdminDashboardData';

interface AlertsPanelProps {
  className?: string;
  title?: string;
  alerts: DashboardAlert[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  renderIcon: (type: string) => ReactNode;
  formatRelativeTime: (value?: string) => string;
  emptyState?: string;
}

export function AlertsPanel({
  className = 'mb-8',
  title = '시스템 알림',
  alerts,
  loading,
  error,
  onRetry,
  renderIcon,
  formatRelativeTime,
  emptyState = '새로운 시스템 알림이 없습니다.',
}: AlertsPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <h3 className='text-lg font-semibold'>{title}</h3>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ProjectListSkeleton />
        ) : error ? (
          <ErrorMessage error={error as Error} onRetry={onRetry} />
        ) : alerts.length > 0 ? (
          <div className='space-y-3'>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'
              >
                {renderIcon(alert.type)}
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
          <p className='text-sm text-gray-500'>{emptyState}</p>
        )}
      </CardContent>
    </Card>
  );
}
