import React, { useCallback, useMemo, useState } from 'react';
import { Heart, RefreshCw, TrendingUp, Users2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/shared/ui/Button';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import {
  HomeCommunitySection,
  HomeFeaturedArtistsSection,
  HomeFeaturedProjectsSection,
  HomeFundingCtaSection,
  HomeHeroSection,
  HomeNoticesSection,
  HomePageMeta,
  HomeSectionBoundary,
  HomeStatsSection,
} from '@/features/home/components';
import { HOME_SECTION_LIMITS } from '@/features/home/constants';
import {
  useHomeCommunityCategories,
  useHomeCommunityPosts,
  useHomeFeaturedProjects,
  useHomeNotices,
  useHomePlatformStats,
  useHomePopularArtists,
} from '@/features/home/hooks/useHomeContent';
import type {
  CategoryList,
  HomeStatItem,
  PlatformStats,
} from '@/features/home/types';

const createStatItems = (stats: PlatformStats): HomeStatItem[] => [
  {
    label: '아티스트',
    value: stats.totalArtists.toLocaleString(),
    icon: Users2,
    iconColor: 'text-indigo',
  },
  {
    label: '진행 프로젝트',
    value: stats.totalProjects.toLocaleString(),
    icon: TrendingUp,
    iconColor: 'text-sky',
  },
  {
    label: '총 후원금액',
    value: `₩${stats.totalFunding.toLocaleString()}`,
    icon: Heart,
    iconColor: 'text-red-500',
  },
];

const STATS_LOADING_ITEMS: HomeStatItem[] = [
  { label: '아티스트', value: '...', icon: Users2, iconColor: 'text-indigo' },
  { label: '진행 프로젝트', value: '...', icon: TrendingUp, iconColor: 'text-sky' },
  { label: '총 후원금액', value: '...', icon: Heart, iconColor: 'text-red-500' },
];

const StatsErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className='mx-auto max-w-5xl rounded-lg border border-dashed border-red-200 bg-red-50 p-8 text-center'>
    <h3 className='text-lg font-semibold text-red-700'>플랫폼 통계를 불러오지 못했습니다.</h3>
    <p className='mt-2 text-sm text-red-600'>네트워크 상태를 확인한 뒤 다시 시도해주세요.</p>
    <Button
      onClick={onRetry}
      variant='outline'
      className='mt-4 border-red-300 text-red-700 hover:bg-red-100'
    >
      <RefreshCw className='mr-2 h-4 w-4' />
      다시 시도
    </Button>
  </div>
);

const HomeStatsContent: React.FC = () => {
  const { data } = useHomePlatformStats();
  const stats = useMemo(() => createStatItems(data), [data]);

  return <HomeStatsSection stats={stats} />;
};

interface ArtistsContentProps {
  onArtistSelect: (artistId: string) => void;
  onRegisterArtist: () => void;
  onViewAll: () => void;
}

const HomeArtistsContent: React.FC<ArtistsContentProps> = ({
  onArtistSelect,
  onRegisterArtist,
  onViewAll,
}) => {
  const { data, refetch } = useHomePopularArtists(HOME_SECTION_LIMITS.artists);

  const handleReload = useCallback(() => {
    void refetch({ throwOnError: false });
  }, [refetch]);

  return (
    <HomeFeaturedArtistsSection
      artists={data}
      isLoading={false}
      hasError={false}
      onReload={handleReload}
      onArtistSelect={onArtistSelect}
      onRegisterArtist={onRegisterArtist}
      onViewAll={onViewAll}
    />
  );
};

interface ProjectsContentProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

const HomeProjectsContent: React.FC<ProjectsContentProps> = ({
  onProjectSelect,
  onCreateProject,
}) => {
  const { data, refetch } = useHomeFeaturedProjects(HOME_SECTION_LIMITS.projects);

  const handleReload = useCallback(() => {
    void refetch({ throwOnError: false });
  }, [refetch]);

  return (
    <HomeFeaturedProjectsSection
      projects={data}
      isLoading={false}
      hasError={false}
      onReload={handleReload}
      onProjectSelect={onProjectSelect}
      onCreateProject={onCreateProject}
    />
  );
};

interface NoticesContentProps {
  onViewAll: () => void;
}

const HomeNoticesContent: React.FC<NoticesContentProps> = ({ onViewAll }) => {
  const { data, refetch } = useHomeNotices(HOME_SECTION_LIMITS.notices);

  const handleReload = useCallback(() => {
    void refetch({ throwOnError: false });
  }, [refetch]);

  return (
    <HomeNoticesSection
      notices={data}
      isLoading={false}
      hasError={false}
      onReload={handleReload}
      onViewAll={onViewAll}
    />
  );
};

interface CommunityContentProps {
  onCreatePost: () => void;
  onViewAll: () => void;
}

const HomeCommunityContent: React.FC<CommunityContentProps> = ({ onCreatePost, onViewAll }) => {
  const { data: posts, refetch: refetchPosts } = useHomeCommunityPosts(
    HOME_SECTION_LIMITS.communityPosts,
  );
  const { data: categories, refetch: refetchCategories } = useHomeCommunityCategories();

  const handleReload = useCallback(() => {
    void Promise.all([
      refetchPosts({ throwOnError: false }),
      refetchCategories({ throwOnError: false }),
    ]);
  }, [refetchCategories, refetchPosts]);

  return (
    <HomeCommunitySection
      posts={posts}
      categories={categories}
      isLoading={false}
      hasError={false}
      onReload={handleReload}
      onCreatePost={onCreatePost}
      onViewAll={onViewAll}
    />
  );
};

const EMPTY_CATEGORIES: CategoryList = [];

export const HomePage: React.FC = () => {
  const { requireAuth } = useAuthRedirect();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      return;
    }

    window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}`;
  }, [searchQuery]);

  const handleArtistSelect = useCallback(
    (artistId: string) =>
      requireAuth(() => {
        window.location.href = `/artists/${artistId}`;
      }),
    [requireAuth],
  );

  const handleRegisterArtist = useCallback(
    () =>
      requireAuth(() => {
        window.location.href = '/signup';
      }),
    [requireAuth],
  );

  const handleViewArtists = useCallback(() => {
    window.location.href = '/artists';
  }, []);

  const handleProjectSelect = useCallback(
    (projectId: string) =>
      requireAuth(() => {
        window.location.href = `/projects/${projectId}`;
      }),
    [requireAuth],
  );

  const handleCreateProject = useCallback(
    () =>
      requireAuth(() => {
        window.location.href = '/funding/create';
      }),
    [requireAuth],
  );

  const handleCreatePost = useCallback(
    () =>
      requireAuth(() => {
        window.location.href = '/community/create';
      }),
    [requireAuth],
  );

  const handleViewCommunity = useCallback(() => {
    window.location.href = '/community';
  }, []);

  const handleExploreProjects = useCallback(
    () =>
      requireAuth(() => {
        window.location.href = '/projects';
      }),
    [requireAuth],
  );

  const renderArtistsFallback = useCallback(
    (state: 'loading' | 'error', onReload?: () => void) => (
      <HomeFeaturedArtistsSection
        artists={[]}
        isLoading={state === 'loading'}
        hasError={state === 'error'}
        onReload={onReload ?? (() => undefined)}
        onArtistSelect={handleArtistSelect}
        onRegisterArtist={handleRegisterArtist}
        onViewAll={handleViewArtists}
      />
    ),
    [handleArtistSelect, handleRegisterArtist, handleViewArtists],
  );

  const renderProjectsFallback = useCallback(
    (state: 'loading' | 'error', onReload?: () => void) => (
      <HomeFeaturedProjectsSection
        projects={[]}
        isLoading={state === 'loading'}
        hasError={state === 'error'}
        onReload={onReload ?? (() => undefined)}
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
      />
    ),
    [handleCreateProject, handleProjectSelect],
  );

  const renderNoticesFallback = useCallback(
    (state: 'loading' | 'error', onReload?: () => void) => (
      <HomeNoticesSection
        notices={[]}
        isLoading={state === 'loading'}
        hasError={state === 'error'}
        onReload={onReload ?? (() => undefined)}
        onViewAll={handleViewCommunity}
      />
    ),
    [handleViewCommunity],
  );

  const renderCommunityFallback = useCallback(
    (state: 'loading' | 'error', onReload?: () => void) => (
      <HomeCommunitySection
        posts={[]}
        categories={EMPTY_CATEGORIES}
        isLoading={state === 'loading'}
        hasError={state === 'error'}
        onReload={onReload ?? (() => undefined)}
        onCreatePost={handleCreatePost}
        onViewAll={handleViewCommunity}
      />
    ),
    [handleCreatePost, handleViewCommunity],
  );

  return (
    <ErrorBoundary>
      <div className='space-y-8 md:space-y-12'>
        <HomePageMeta />
        <HomeHeroSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <HomeSectionBoundary
          loadingFallback={<HomeStatsSection stats={STATS_LOADING_ITEMS} />}
          renderError={reset => <StatsErrorFallback onRetry={reset} />}
        >
          <HomeStatsContent />
        </HomeSectionBoundary>
        <HomeSectionBoundary
          loadingFallback={renderArtistsFallback('loading')}
          renderError={reset => renderArtistsFallback('error', reset)}
        >
          <HomeArtistsContent
            onArtistSelect={handleArtistSelect}
            onRegisterArtist={handleRegisterArtist}
            onViewAll={handleViewArtists}
          />
        </HomeSectionBoundary>
        <HomeSectionBoundary
          loadingFallback={renderProjectsFallback('loading')}
          renderError={reset => renderProjectsFallback('error', reset)}
        >
          <HomeProjectsContent
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
          />
        </HomeSectionBoundary>
        <HomeSectionBoundary
          loadingFallback={renderNoticesFallback('loading')}
          renderError={reset => renderNoticesFallback('error', reset)}
        >
          <HomeNoticesContent onViewAll={handleViewCommunity} />
        </HomeSectionBoundary>
        <HomeSectionBoundary
          loadingFallback={renderCommunityFallback('loading')}
          renderError={reset => renderCommunityFallback('error', reset)}
        >
          <HomeCommunityContent
            onCreatePost={handleCreatePost}
            onViewAll={handleViewCommunity}
          />
        </HomeSectionBoundary>
        <HomeFundingCtaSection onExploreProjects={handleExploreProjects} />
      </div>
    </ErrorBoundary>
  );
};
