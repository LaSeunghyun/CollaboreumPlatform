import {
  useUserGrowthData,
  useFundingPerformanceData,
} from '../../hooks/useAdminData';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../shared/ui/Card';
import { Badge } from '../../../../shared/ui/Badge';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';

export function AnalyticsSection() {
  const { data: userGrowthData, isLoading: userGrowthLoading } =
    useUserGrowthData();
  const { data: fundingPerformanceData, isLoading: fundingLoading } =
    useFundingPerformanceData();

  if (userGrowthLoading || fundingLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-64 rounded-lg bg-gray-200'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>분석 및 통계</h2>
        <div className='flex gap-3'>
          <Badge className='bg-blue-100 text-blue-800'>
            <BarChart3 className='mr-1 h-4 w-4' />
            실시간 업데이트
          </Badge>
        </div>
      </div>

      {/* 주요 지표 요약 */}
      <div className='grid gap-6 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>평균 펀딩 성공률</p>
                <p className='text-2xl font-bold text-green-600'>78.5%</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>월간 활성 사용자</p>
                <p className='text-2xl font-bold text-blue-600'>650명</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
                <Users className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>평균 프로젝트 금액</p>
                <p className='text-2xl font-bold text-purple-600'>₩2.1M</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100'>
                <DollarSign className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>고객 만족도</p>
                <p className='text-2xl font-bold text-yellow-600'>4.7/5.0</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100'>
                <Activity className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>사용자 증가 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex h-64 items-center justify-center rounded-lg bg-gray-50'>
              <div className='text-center'>
                <BarChart3 className='mx-auto mb-2 h-12 w-12 text-gray-400' />
                <p className='text-gray-500'>차트 컴포넌트를 준비 중입니다</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>펀딩 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex h-64 items-center justify-center rounded-lg bg-gray-50'>
              <div className='text-center'>
                <PieChart className='mx-auto mb-2 h-12 w-12 text-gray-400' />
                <p className='text-gray-500'>차트 컴포넌트를 준비 중입니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 현황 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>음악</span>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-16 rounded-full bg-gray-200'>
                  <div className='h-2 w-12 rounded-full bg-blue-500'></div>
                </div>
                <span className='text-sm font-medium'>35%</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>미술</span>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-16 rounded-full bg-gray-200'>
                  <div className='h-2 w-10 rounded-full bg-green-500'></div>
                </div>
                <span className='text-sm font-medium'>28%</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>영화</span>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-16 rounded-full bg-gray-200'>
                  <div className='h-2 w-6 rounded-full bg-purple-500'></div>
                </div>
                <span className='text-sm font-medium'>18%</span>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>기타</span>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-16 rounded-full bg-gray-200'>
                  <div className='h-2 w-3 rounded-full bg-orange-500'></div>
                </div>
                <span className='text-sm font-medium'>19%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <div className='mb-1 flex justify-between text-sm'>
                <span>신규 가입</span>
                <span className='text-green-600'>+12.5%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div className='h-2 w-3/4 rounded-full bg-green-500'></div>
              </div>
            </div>
            <div>
              <div className='mb-1 flex justify-between text-sm'>
                <span>펀딩 참여</span>
                <span className='text-blue-600'>+8.3%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div className='h-2 w-2/3 rounded-full bg-blue-500'></div>
              </div>
            </div>
            <div>
              <div className='mb-1 flex justify-between text-sm'>
                <span>커뮤니티 활동</span>
                <span className='text-purple-600'>+15.7%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200'>
                <div className='h-2 w-4/5 rounded-full bg-purple-500'></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
