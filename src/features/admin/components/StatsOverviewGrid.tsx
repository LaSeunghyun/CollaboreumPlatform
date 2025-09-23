import { Card, CardContent } from '@/shared/ui/Card';
import { ErrorMessage } from '@/shared/ui';
import type { DashboardStatsSummary } from '../hooks/useAdminDashboardData';
import { dashboardStatIcons } from '../hooks/useAdminDashboardData';

interface StatsOverviewGridProps {
  stats: DashboardStatsSummary;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  formatCurrency: (value: unknown) => string;
}

const STAT_CONFIG: Array<{
  key: keyof DashboardStatsSummary;
  label: string;
  formatter?: (value: number, helpers: StatsOverviewGridProps) => string;
}> = [
  { key: 'totalUsers', label: '총 사용자' },
  {
    key: 'totalRevenue',
    label: '총 수익',
    formatter: (value, { formatCurrency }) => formatCurrency(value),
  },
  { key: 'totalProjects', label: '총 프로젝트' },
  { key: 'pendingApprovals', label: '승인 대기' },
];

export function StatsOverviewGrid({
  stats,
  loading,
  error,
  onRetry,
  formatCurrency,
}: StatsOverviewGridProps) {
  return (
    <div className='mb-8'>
      {error ? (
        <div className='mb-4'>
          <ErrorMessage error={error as Error} onRetry={onRetry} />
        </div>
      ) : null}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {STAT_CONFIG.map(({ key, label, formatter }) => {
          const value = stats[key];
          const displayValue = loading
            ? '...'
            : formatter
              ? formatter(value, {
                  stats,
                  loading,
                  error,
                  onRetry,
                  formatCurrency,
                })
              : value.toLocaleString();

          return (
            <Card key={key}>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-3'>
                  {dashboardStatIcons[key]}
                  <div>
                    <p className='text-sm text-gray-600'>{label}</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {displayValue}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
