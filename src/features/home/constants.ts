import type { PlatformStats } from './types';

export const HOME_SECTION_LIMITS = {
  artists: 3,
  projects: 3,
  notices: 2,
  communityPosts: 4,
} as const;

export const DEFAULT_PLATFORM_STATS: PlatformStats = {
  totalArtists: 0,
  totalProjects: 0,
  totalFunding: 0,
  totalUsers: 0,
};
