import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, TrendingUp, Users2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePopularArtists } from '@/lib/api/useArtists';
import { useProjects } from '@/lib/api/useProjects';
import { useNotices } from '@/lib/api/useNotices';
import { useCategories } from '@/lib/api/useCategories';
import { useCommunityPosts } from '@/features/community/hooks/useCommunityPosts';
import { statsAPI } from '@/services/api';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import {
  HomeCommunitySection,
  HomeFeaturedArtistsSection,
  HomeFeaturedProjectsSection,
  HomeFundingCtaSection,
  HomeHeroSection,
  HomeNoticesSection,
  HomePageMeta,
  HomeStatsSection,
} from '@/features/home/components';
import {
  normalizeArtists,
  normalizeCommunityPosts,
  normalizeNotices,
  normalizePlatformStats,
  normalizeProjects,
} from '@/features/home/utils/normalizers';
import type { HomeStatItem, PlatformStats } from '@/features/home/types';

const DEFAULT_PLATFORM_STATS: PlatformStats = {
  totalArtists: 0,
  totalProjects: 0,
  totalFunding: 0,
  totalUsers: 0,
};

export const HomePage: React.FC = () => {
  const { requireAuth } = useAuthRedirect();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: popularArtists,
    isLoading: artistsLoading,
    error: artistsError,
  } = usePopularArtists(3);

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects({ limit: 3, sortBy: 'popularity' });

  const {
    data: notices,
    isLoading: noticesLoading,
    error: noticesError,
  } = useNotices({ limit: 2, sortBy: 'createdAt', order: 'desc' });

  const {
    data: communityPosts,
    isLoading: communityLoading,
    error: communityError,
  } = useCommunityPosts({ limit: 4, sortBy: 'likes', order: 'desc' });

  const { data: categories = [] } = useCategories();

  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: statsAPI.getPlatformStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
  });

  const stats = useMemo(
    (): HomeStatItem[] => {
      const normalized = normalizePlatformStats(platformStats, DEFAULT_PLATFORM_STATS);

      return [
        {
          label: '아티스트',
          value: statsLoading ? '...' : normalized.totalArtists.toLocaleString(),
          icon: Users2,
          iconColor: 'text-indigo',
        },
        {
          label: '진행 프로젝트',
          value: statsLoading ? '...' : normalized.totalProjects.toLocaleString(),
          icon: TrendingUp,
          iconColor: 'text-sky',
        },
        {
          label: '총 후원금액',
          value: statsLoading
            ? '...'
            : `₩${normalized.totalFunding.toLocaleString()}`,
          icon: Heart,
          iconColor: 'text-red-500',
        },
      ];
    },
    [platformStats, statsLoading],
  );

  const artistSummaries = useMemo(
    () => normalizeArtists(popularArtists),
    [popularArtists],
  );

  const projectSummaries = useMemo(
    () => normalizeProjects(projects),
    [projects],
  );

  const noticeSummaries = useMemo(
    () => normalizeNotices(notices),
    [notices],
  );

  const communitySummaries = useMemo(
    () => normalizeCommunityPosts(communityPosts),
    [communityPosts],
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
  };

  const handleArtistSelect = (artistId: string) =>
    requireAuth(() => {
      window.location.href = `/artists/${artistId}`;
    });

  const handleProjectSelect = (projectId: string) =>
    requireAuth(() => {
      window.location.href = `/projects/${projectId}`;
    });

  const handleRegisterArtist = () =>
    requireAuth(() => {
      window.location.href = '/signup';
    });

  const handleCreateProject = () =>
    requireAuth(() => {
      window.location.href = '/funding/create';
    });

  const handleCreatePost = () =>
    requireAuth(() => {
      window.location.href = '/community/create';
    });

  const handleExploreProjects = () =>
    requireAuth(() => {
      window.location.href = '/projects';
    });

  return (
    <ErrorBoundary>
      <div className='space-y-8 md:space-y-12'>
        <HomePageMeta />
        <HomeHeroSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <HomeStatsSection stats={stats} />
        <HomeFeaturedArtistsSection
          artists={artistSummaries}
          isLoading={artistsLoading}
          hasError={Boolean(artistsError)}
          onReload={() => window.location.reload()}
          onArtistSelect={handleArtistSelect}
          onRegisterArtist={handleRegisterArtist}
        />
        <HomeFeaturedProjectsSection
          projects={projectSummaries}
          isLoading={projectsLoading}
          hasError={Boolean(projectsError)}
          onReload={() => window.location.reload()}
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
        />
        <HomeNoticesSection
          notices={noticeSummaries}
          isLoading={noticesLoading}
          hasError={Boolean(noticesError)}
          onReload={() => window.location.reload()}
        />
        <HomeCommunitySection
          posts={communitySummaries}
          categories={categories}
          isLoading={communityLoading}
          hasError={Boolean(communityError)}
          onReload={() => window.location.reload()}
          onCreatePost={handleCreatePost}
        />
        <HomeFundingCtaSection onExploreProjects={handleExploreProjects} />
      </div>
    </ErrorBoundary>
  );
};
