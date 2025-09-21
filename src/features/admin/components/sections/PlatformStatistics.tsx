import { RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../shared/ui/Card';
import { Button } from '../../../../shared/ui/Button';
import { Badge } from '../../../../shared/ui/Badge';
import { cn } from '../../../../shared/lib/cn';
import { useAdminStats } from '../../../../lib/api/useAdminStats';

interface PlatformStatisticsProps {
  className?: string;
}

export const PlatformStatistics = ({ className }: PlatformStatisticsProps) => {
  const { data, isLoading, error, refetch, isFetching } = useAdminStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle>플랫폼 지표</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='h-4 rounded bg-muted' />
          <div className='h-4 w-3/4 rounded bg-muted' />
          <div className='h-4 w-1/2 rounded bg-muted' />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>플랫폼 지표</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            지표를 불러오지 못했습니다.
          </p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            <RefreshCw className='mr-2 h-4 w-4' /> 다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      label: '총 가입자',
      value: stats.totalUsers.toLocaleString(),
    },
    {
      label: '총 펀딩 금액',
      value: `${stats.totalFunding.toLocaleString()}원`,
    },
    {
      label: '완료 프로젝트',
      value: stats.completedProjects.toLocaleString(),
    },
    {
      label: '이번 주 신규 아티스트',
      value: stats.weeklyNewUsers.toLocaleString(),
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {items.map(item => (
          <Card key={item.label} className='border-muted/60'>
            <CardHeader className='space-y-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold tracking-tight'>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>진행 현황</CardTitle>
          <Badge variant='secondary' className='font-medium'>
            {isFetching ? '업데이트 중…' : '실시간 동기화'}
          </Badge>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2'>
          <div>
            <span className='text-sm text-muted-foreground'>
              대기 중 프로젝트
            </span>
            <p className='text-lg font-semibold'>
              {stats.pendingProjects.toLocaleString()}건
            </p>
          </div>
          <div>
            <span className='text-sm text-muted-foreground'>
              평균 펀딩 금액
            </span>
            <p className='text-lg font-semibold'>
              {stats.averageFundingAmount.toLocaleString()}원
            </p>
          </div>
          <div>
            <span className='text-sm text-muted-foreground'>성공률</span>
            <p className='text-lg font-semibold'>
              {Math.round(stats.successRate * 100)}%
            </p>
          </div>
          <div>
            <span className='text-sm text-muted-foreground'>
              이번 주 신규 프로젝트
            </span>
            <p className='text-lg font-semibold'>
              {stats.weeklyNewProjects.toLocaleString()}건
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
