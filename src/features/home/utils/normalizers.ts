import { DYNAMIC_CONSTANTS } from '@/constants/dynamic';
import type {
  ArtistSummary,
  CommunityPostSummary,
  NoticeSummary,
  PlatformStats,
  ProjectSummary,
} from '../types';

const { DEFAULT_IMAGES } = DYNAMIC_CONSTANTS;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toBoolean = (value: unknown): boolean => value === true;

const normalizeArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value) && Array.isArray(value.items)) {
    return value.items;
  }

  return [];
};

const findArray = (value: unknown, key: string): unknown[] | null => {
  const queue: unknown[] = [value];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === undefined || current === null) {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }

    if (Array.isArray(current)) {
      return current;
    }

    if (!isRecord(current)) {
      continue;
    }

    visited.add(current);

    const dataField = current.data;
    if (Array.isArray(dataField)) {
      return dataField;
    }

    const keyedField = current[key];
    if (Array.isArray(keyedField)) {
      return keyedField as unknown[];
    }

    const itemsField = current.items;
    if (Array.isArray(itemsField)) {
      return itemsField;
    }

    if (isRecord(dataField)) {
      queue.push(dataField);
    }

    if (isRecord(keyedField)) {
      queue.push(keyedField);
    }
  }

  return null;
};

const pickList = (data: unknown, key: string): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const fromData = findArray(data.data, key);
  if (fromData) {
    return fromData;
  }

  const fromKey = findArray(data[key], key);
  if (fromKey) {
    return fromKey;
  }

  const fromItems = findArray(data.items, key);
  if (fromItems) {
    return fromItems;
  }

  return [];
};

export const normalizePlatformStats = (
  value: unknown,
  fallback: PlatformStats,
): PlatformStats => {
  if (isRecord(value)) {
    const source = isRecord(value.data) ? (value.data as Record<string, unknown>) : value;
    return {
      totalArtists: toNumber(source.totalArtists, fallback.totalArtists),
      totalProjects: toNumber(source.totalProjects, fallback.totalProjects),
      totalFunding: toNumber(source.totalFunding, fallback.totalFunding),
      totalUsers: toNumber(source.totalUsers, fallback.totalUsers),
    };
  }

  return fallback;
};

export const normalizeArtists = (value: unknown): ArtistSummary[] => {
  const list = pickList(value, 'artists');

  return list
    .map(item => {
      if (!isRecord(item)) {
        return null;
      }

      const idValue = item.id;
      const id = toString(idValue, typeof idValue === 'number' ? String(idValue) : '');
      if (!id) {
        return null;
      }

      const tagsValue = item.tags;
      const tags = Array.isArray(tagsValue)
        ? tagsValue.filter((tag): tag is string => typeof tag === 'string')
        : [];

      return {
        id,
        name: toString(item.name, '이름 미정'),
        avatar: toString(item.avatar, DEFAULT_IMAGES.AVATAR),
        coverImage: toString(item.coverImage, undefined),
        category: toString(item.category, '카테고리 미정'),
        tags,
        featuredWork: toString(item.featuredWork, undefined),
        followers: toNumber(item.followers),
        isFollowing: toBoolean(item.isFollowing),
        isVerified: toBoolean(item.isVerified),
        bio: toString(item.bio, undefined),
      } satisfies ArtistSummary;
    })
    .filter((artist): artist is ArtistSummary => artist !== null);
};

export const normalizeProjects = (value: unknown): ProjectSummary[] => {
  const list = pickList(value, 'projects');

  return list
    .map(item => {
      if (!isRecord(item)) {
        return null;
      }

      const idValue = item.id;
      const id = toString(idValue, typeof idValue === 'number' ? String(idValue) : '');
      if (!id) {
        return null;
      }

      return {
        id,
        title: toString(item.title, '프로젝트 제목 미정'),
        artist: toString(item.artist, '알 수 없는 아티스트'),
        category: toString(item.category, '기타'),
        thumbnail: toString(item.thumbnail, DEFAULT_IMAGES.PROJECT_THUMBNAIL),
        currentAmount: toNumber(item.currentAmount),
        targetAmount: Math.max(toNumber(item.targetAmount, 1), 1),
        backers: toNumber(item.backers),
        daysLeft: Math.max(toNumber(item.daysLeft), 0),
      } satisfies ProjectSummary;
    })
    .filter((project): project is ProjectSummary => project !== null);
};

export const normalizeNotices = (value: unknown): NoticeSummary[] => {
  const list = pickList(value, 'posts');

  return list
    .map(item => {
      if (!isRecord(item)) {
        return null;
      }

      const idValue = item.id;
      const id = toString(idValue, typeof idValue === 'number' ? String(idValue) : '');
      if (!id) {
        return null;
      }

      return {
        id,
        title: toString(item.title, '공지사항'),
        content: toString(item.content, ''),
        createdAt: toString(item.createdAt, new Date().toISOString()),
        views: toNumber(item.views),
        isImportant: toBoolean(item.isImportant),
        isPinned: toBoolean(item.isPinned),
      } satisfies NoticeSummary;
    })
    .filter((notice): notice is NoticeSummary => notice !== null);
};

export const normalizeCommunityPosts = (value: unknown): CommunityPostSummary[] => {
  const list = pickList(value, 'posts');

  return list
    .map(item => {
      if (!isRecord(item)) {
        return null;
      }

      const idValue = item.id;
      const id = toString(idValue, typeof idValue === 'number' ? String(idValue) : '');
      if (!id) {
        return null;
      }

      const authorValue = item.author;
      const author = isRecord(authorValue)
        ? {
            name: toString(authorValue.name, '익명'),
            isVerified: toBoolean(authorValue.isVerified),
          }
        : {
            name: toString(authorValue, '익명'),
            isVerified: false,
          };

      const likeValue = item.likes;
      const commentValue = item.comments;

      return {
        id,
        title: toString(item.title, '제목 없음'),
        content: toString(item.content, ''),
        category: toString(item.category, 'general'),
        likes: Array.isArray(likeValue) ? likeValue.length : toNumber(likeValue),
        comments: Array.isArray(commentValue)
          ? commentValue.length
          : toNumber(commentValue),
        author,
        isHot: toBoolean(item.isHot),
      } satisfies CommunityPostSummary;
    })
    .filter((post): post is CommunityPostSummary => post !== null);
};

export const normalizeGenericArray = normalizeArray;
