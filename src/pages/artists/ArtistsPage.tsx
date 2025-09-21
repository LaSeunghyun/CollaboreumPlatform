import React, { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Search,
  Palette,
  BarChart3,
  Users,
  Heart,
  Star,
  Plus,
} from 'lucide-react';
import { ArtistCard } from '../../components/molecules/ArtistCard';
import {
  useArtists,
  usePopularArtists,
  useNewArtists,
} from '../../lib/api/useArtists';
import { usePlatformStats } from '../../lib/api/useStats';
import {
  ErrorState,
  EmptyArtistsState,
  SkeletonGrid,
} from '../../components/organisms/States';
import { ArtistGallery } from '../../components/ArtistGallery';
import { ArtistDashboard } from '../../components/ArtistDashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

export const ArtistsPage: React.FC = () => {
  const { requireAuth } = useAuthRedirect();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('hot');

  // API 훅들
  const {
    data: allArtists,
    isLoading: allArtistsLoading,
    error: allArtistsError,
  } = useArtists({
    search: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const {
    data: popularArtists,
    isLoading: popularLoading,
    error: popularError,
  } = usePopularArtists();
  const {
    data: newArtists,
    isLoading: newLoading,
    error: newError,
  } = useNewArtists();

  // 플랫폼 통계 조회
  const {
    data: platformStats,
    isLoading: statsLoading,
    error: statsError,
  } = usePlatformStats();

  const handleSearch = () => {
    // 검색 로직은 useArtists 훅이 자동으로 처리
  };

  const handleCreateProject = () => {
    requireAuth(() => {
      // 프로젝트 생성 페이지로 이동
      window.location.href = '/funding/create';
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const renderArtists = (artists: any[], loading: boolean, error: any) => {
    if (loading) {
      return <SkeletonGrid count={6} cols={3} />;
    }

    if (error) {
      return (
        <ErrorState
          title='아티스트 정보를 불러올 수 없습니다'
          description='잠시 후 다시 시도해주세요.'
        />
      );
    }

    if (!artists || artists.length === 0) {
      return (
        <EmptyArtistsState
          action={{
            label: '전체 아티스트 보기',
            onClick: () => setActiveTab('all'),
          }}
        />
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {artists.map((artist: any) => (
          <ArtistCard
            key={artist.id}
            {...artist}
            onClick={() =>
              requireAuth(() => {
                window.location.href = `/artists/${artist.id}`;
              })
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-8'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>아티스트</h1>
            <p className='text-muted-foreground'>
              재능 있는 아티스트들을 발견하고 팔로우하세요
            </p>
          </div>
          <Button
            variant='indigo'
            className='hover-scale transition-button shadow-sm'
            onClick={handleCreateProject}
          >
            <Plus className='mr-2 h-4 w-4' />
            프로젝트 시작하기
          </Button>
        </div>

        {/* Search and Filter */}
        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
            <Input
              placeholder='아티스트 이름, 분야 검색...'
              className='pl-10'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='분야 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 분야</SelectItem>
              <SelectItem value='음악'>음악</SelectItem>
              <SelectItem value='미술'>미술</SelectItem>
              <SelectItem value='디지털아트'>디지털아트</SelectItem>
              <SelectItem value='사진'>사진</SelectItem>
              <SelectItem value='영상'>영상</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList>
          <TabsTrigger value='hot'>핫한 아티스트</TabsTrigger>
          <TabsTrigger value='new'>신규 아티스트</TabsTrigger>
          <TabsTrigger value='all'>전체 아티스트</TabsTrigger>
          <TabsTrigger value='gallery'>갤러리</TabsTrigger>
          <TabsTrigger value='dashboard'>대시보드</TabsTrigger>
        </TabsList>

        <TabsContent value='hot' className='space-y-6'>
          {renderArtists(
            (popularArtists as any)?.data || [],
            popularLoading,
            popularError,
          )}
        </TabsContent>

        <TabsContent value='new' className='space-y-6'>
          {renderArtists(
            (newArtists as any)?.data?.artists ||
              (newArtists as any)?.data ||
              [],
            newLoading,
            newError,
          )}
        </TabsContent>

        <TabsContent value='all' className='space-y-6'>
          {renderArtists(
            (allArtists as any)?.data || [],
            allArtistsLoading,
            allArtistsError,
          )}
        </TabsContent>

        <TabsContent value='gallery' className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Palette className='h-5 w-5 text-indigo' />
              <h3 className='text-xl font-semibold'>아티스트 갤러리</h3>
            </div>
            <p className='text-muted-foreground'>
              아티스트들의 작품을 감상하고 좋아요를 눌러보세요.
            </p>
            <ArtistGallery onBack={() => setActiveTab('hot')} />
          </div>
        </TabsContent>

        <TabsContent value='dashboard' className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-sky' />
              <h3 className='text-xl font-semibold'>아티스트 대시보드</h3>
            </div>
            <p className='text-muted-foreground'>
              아티스트 활동 현황과 통계를 확인하세요.
            </p>
            <ArtistDashboard />
          </div>
        </TabsContent>
      </Tabs>

      {/* 아티스트 통계 섹션 */}
      <section className='space-y-6'>
        <div className='space-y-4 text-center'>
          <h2 className='text-2xl font-bold'>아티스트 통계</h2>
          <p className='text-muted-foreground'>
            플랫폼의 아티스트 활동 현황을 확인해보세요.
          </p>
        </div>

        {statsLoading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    로딩 중...
                  </CardTitle>
                  <div className='h-4 w-4 animate-pulse rounded bg-gray-200' />
                </CardHeader>
                <CardContent>
                  <div className='mb-2 h-8 animate-pulse rounded bg-gray-200' />
                  <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : statsError ? (
          <div className='py-8 text-center'>
            <p className='text-red-500'>통계를 불러올 수 없습니다.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  총 아티스트
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {(
                    (platformStats as any)?.data?.totalArtists || 0
                  ).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {((platformStats as any)?.data?.newArtistsThisWeek || 0) > 0
                    ? '+'
                    : ''}
                  {(platformStats as any)?.data?.newArtistsThisWeek || 0}명 이번
                  주 신규
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  성공 프로젝트
                </CardTitle>
                <Heart className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {(
                    (platformStats as any)?.data?.successfulProjects || 0
                  ).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  총 펀딩 ₩
                  {(
                    (platformStats as any)?.data?.totalFunding || 0
                  ).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  활성 후원자
                </CardTitle>
                <Star className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {(
                    (platformStats as any)?.data?.activeSupporters || 0
                  ).toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>최근 30일 활동</p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
};
