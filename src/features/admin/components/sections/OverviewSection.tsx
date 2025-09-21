import { useAdminMetrics, useSystemMetrics } from '../../hooks/useAdminData';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../shared/ui/Card';
import { Badge } from '../../../../shared/ui/Badge';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export function OverviewSection() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useAdminMetrics();
  const {
    data: systemMetrics,
    isLoading: systemLoading,
    error: systemError,
  } = useSystemMetrics();

  if (metricsLoading || systemLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-64 rounded-lg bg-gray-200'></div>
        </div>
      </div>
    );
  }

  if (metricsError || systemError) {
    return (
      <div className='py-12 text-center'>
        <p className='text-red-600'>
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 주요 지표 카드들 */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {/* 총 사용자 수 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>총 사용자</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics?.userMetrics?.totalUsers || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              이번 주 +{metrics?.userMetrics?.newUsersThisWeek || 0}명
            </p>
          </CardContent>
        </Card>

        {/* 활성 아티스트 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>활성 아티스트</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics?.userMetrics?.activeArtists || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              성장률 {metrics?.userMetrics?.userGrowthRate || 0}%
            </p>
          </CardContent>
        </Card>

        {/* 총 펀딩 금액 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>총 펀딩 금액</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics?.fundingMetrics?.totalFundedAmount?.toLocaleString() ||
                0}
              원
            </div>
            <p className='text-xs text-muted-foreground'>
              성공률 {metrics?.fundingMetrics?.successRate || 0}%
            </p>
          </CardContent>
        </Card>

        {/* 월간 수익 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>월간 수익</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics?.revenueMetrics?.monthlyRevenue?.toLocaleString() || 0}원
            </div>
            <p className='text-xs text-muted-foreground'>
              성장률 {metrics?.revenueMetrics?.growthRate || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              시스템 상태
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>서버 상태</span>
              <Badge variant='default' className='bg-green-100 text-green-800'>
                정상
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>데이터베이스</span>
              <Badge variant='default' className='bg-green-100 text-green-800'>
                연결됨
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>업타임</span>
              <span className='text-sm text-muted-foreground'>
                {systemMetrics?.uptime || 'N/A'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>마지막 업데이트</span>
              <span className='text-sm text-muted-foreground'>
                {systemMetrics?.lastUpdate || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-yellow-500' />
              주의사항
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>대기 중인 신고</span>
              <Badge variant='destructive'>
                {metrics?.communityMetrics?.pendingReports || 0}건
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>검토 대기 작품</span>
              <Badge variant='secondary'>
                {metrics?.communityMetrics?.moderationQueue || 0}건
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>이번 주 게시글</span>
              <span className='text-sm text-muted-foreground'>
                {metrics?.communityMetrics?.postsThisWeek || 0}개
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>활성 토론</span>
              <span className='text-sm text-muted-foreground'>
                {metrics?.communityMetrics?.activeDiscussions || 0}개
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                <span className='text-sm'>새로운 사용자가 가입했습니다</span>
              </div>
              <span className='text-xs text-muted-foreground'>방금 전</span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-green-500'></div>
                <span className='text-sm'>펀딩 프로젝트가 완료되었습니다</span>
              </div>
              <span className='text-xs text-muted-foreground'>5분 전</span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                <span className='text-sm'>새로운 신고가 접수되었습니다</span>
              </div>
              <span className='text-xs text-muted-foreground'>10분 전</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
