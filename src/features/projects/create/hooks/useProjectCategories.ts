import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { constantsAPI } from '@/api/modules/constants';
import type { ProjectCategoryOption } from '../types';

const FALLBACK_PROJECT_CATEGORIES: ProjectCategoryOption[] = [
  { id: 'MUSIC', value: '음악', label: '음악' },
  { id: 'VIDEO', value: '비디오', label: '비디오' },
  { id: 'PERFORMANCE', value: '공연', label: '공연' },
  { id: 'BOOK', value: '도서', label: '도서' },
  { id: 'GAME', value: '게임', label: '게임' },
  { id: 'OTHER', value: '기타', label: '기타' },
];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const normalizeCategories = (raw: unknown): ProjectCategoryOption[] => {
  if (!raw) {
    return [];
  }

  if (isRecord(raw) && isRecord(raw.data)) {
    return normalizeCategories(raw.data);
  }

  if (Array.isArray(raw)) {
    return raw
      .map<ProjectCategoryOption | null>(item => {
        if (!item) {
          return null;
        }

        if (typeof item === 'string') {
          return {
            id: item.toUpperCase(),
            value: item,
            label: item,
          };
        }

        if (isRecord(item)) {
          const id = String(item.id ?? item.value ?? item.label ?? '').trim();
          const label = String(item.label ?? item.value ?? item.id ?? '').trim();

          if (!id || !label) {
            return null;
          }

          return {
            id: id.toUpperCase(),
            value: label,
            label,
          };
        }

        return null;
      })
      .filter((option): option is ProjectCategoryOption => Boolean(option));
  }

  if (isRecord(raw)) {
    return Object.entries(raw)
      .map(([key, value]) => {
        const label = typeof value === 'string' ? value.trim() : '';
        const id = key.trim();

        if (!label) {
          return null;
        }

        return {
          id: id.toUpperCase(),
          value: label,
          label,
        } satisfies ProjectCategoryOption | null;
      })
      .filter((option): option is ProjectCategoryOption => Boolean(option));
  }

  return [];
};

export const useProjectCategories = () => {
  const query = useQuery<ProjectCategoryOption[]>({
    queryKey: ['projects', 'create', 'categories'],
    queryFn: async () => {
      const response = await constantsAPI.getEnumsByCategory('PROJECT_CATEGORIES');
      const categories = normalizeCategories(response);

      if (categories.length === 0) {
        throw new Error('프로젝트 카테고리 정보를 불러오지 못했습니다.');
      }

      return categories;
    },
    placeholderData: FALLBACK_PROJECT_CATEGORIES,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: data =>
      data && data.length > 0 ? data : FALLBACK_PROJECT_CATEGORIES,
  });

  const categories = useMemo(() => {
    return query.data ?? FALLBACK_PROJECT_CATEGORIES;
  }, [query.data]);

  return {
    categories,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export { FALLBACK_PROJECT_CATEGORIES };
