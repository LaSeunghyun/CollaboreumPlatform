import { useSuspenseQuery } from '@tanstack/react-query';
import type { Category } from '@/lib/api/useCategories';
import { artistAPI, communityAPI, fundingAPI, statsAPI } from '@/services/api';
import { DEFAULT_PLATFORM_STATS, HOME_SECTION_LIMITS } from '../constants';
import {
  normalizeArtists,
  normalizeCommunityPosts,
  normalizeNotices,
  normalizePlatformStats,
  normalizeProjects,
} from '../utils/normalizers';
import type {
  ArtistSummary,
  CategoryList,
  CommunityPostSummary,
  NoticeSummary,
  PlatformStats,
  ProjectSummary,
} from '../types';

const arrayPlaceholder = <T>(fallback: T[] = []) =>
  (previous?: T[]) => previous ?? fallback;

const objectPlaceholder = <T extends object>(fallback: T) =>
  (previous?: T) => previous ?? fallback;

const extractCategoryList = (value: unknown): CategoryList => {
  const result: CategoryList = [];

  const rawList: unknown[] = (() => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if (Array.isArray(record.data)) {
        return record.data as unknown[];
      }

      if (Array.isArray(record.categories)) {
        return record.categories as unknown[];
      }

      if (record.data && typeof record.data === 'object') {
        const nested = record.data as Record<string, unknown>;
        if (Array.isArray(nested.categories)) {
          return nested.categories as unknown[];
        }
      }
    }

    return [];
  })();

  const seen = new Set<string>();

  rawList.forEach(item => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const record = item as Record<string, unknown>;
    const valueKey = typeof record.value === 'string'
      ? record.value
      : typeof record.slug === 'string'
        ? record.slug
        : undefined;

    if (!valueKey || seen.has(valueKey)) {
      return;
    }

    const label = typeof record.label === 'string'
      ? record.label
      : typeof record.name === 'string'
        ? record.name
        : valueKey;

    const color = typeof record.color === 'string'
      ? record.color
      : 'bg-slate-100 text-slate-700';

    seen.add(valueKey);
    result.push({ value: valueKey, label, color });
  });

  return result;
};

export const useHomePopularArtists = (
  limit = HOME_SECTION_LIMITS.artists,
) =>
  useSuspenseQuery<unknown, Error, ArtistSummary[]>({
    queryKey: ['home', 'artists', 'popular', limit],
    queryFn: () => artistAPI.getPopularArtists(limit),
    select: normalizeArtists,
    placeholderData: arrayPlaceholder<ArtistSummary>([]),
  });

export const useHomeFeaturedProjects = (
  limit = HOME_SECTION_LIMITS.projects,
) =>
  useSuspenseQuery<unknown, Error, ProjectSummary[]>({
    queryKey: ['home', 'projects', 'featured', limit],
    queryFn: () => fundingAPI.getProjects({ limit }),
    select: normalizeProjects,
    placeholderData: arrayPlaceholder<ProjectSummary>([]),
  });

export const useHomeNotices = (
  limit = HOME_SECTION_LIMITS.notices,
) =>
  useSuspenseQuery<unknown, Error, NoticeSummary[]>({
    queryKey: ['home', 'notices', 'latest', limit],
    queryFn: () =>
      communityAPI.getForumPosts(undefined, {
        sortBy: 'latest',
        limit,
      }),
    select: normalizeNotices,
    placeholderData: arrayPlaceholder<NoticeSummary>([]),
  });

export const useHomeCommunityPosts = (
  limit = HOME_SECTION_LIMITS.communityPosts,
) =>
  useSuspenseQuery<unknown, Error, CommunityPostSummary[]>({
    queryKey: ['home', 'community', 'posts', limit],
    queryFn: () =>
      communityAPI.getForumPosts(undefined, {
        sortBy: 'popular',
        limit,
      }),
    select: normalizeCommunityPosts,
    placeholderData: arrayPlaceholder<CommunityPostSummary>([]),
  });

export const useHomeCommunityCategories = () =>
  useSuspenseQuery<unknown, Error, CategoryList>({
    queryKey: ['home', 'community', 'categories'],
    queryFn: () => communityAPI.getCategories(),
    select: extractCategoryList,
    placeholderData: arrayPlaceholder<Category>([]),
  });

export const useHomePlatformStats = () =>
  useSuspenseQuery<unknown, Error, PlatformStats>({
    queryKey: ['home', 'stats', 'platform'],
    queryFn: () => statsAPI.getPlatformStats(),
    select: value => normalizePlatformStats(value, DEFAULT_PLATFORM_STATS),
    placeholderData: objectPlaceholder(DEFAULT_PLATFORM_STATS),
  });
