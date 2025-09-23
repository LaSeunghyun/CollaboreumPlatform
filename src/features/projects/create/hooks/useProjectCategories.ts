import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { constantsAPI } from '@/api/modules/constants';
import type { ProjectCategory } from '@/types/constants';
import type {
  ProjectCategoryKey,
  ProjectCategoryOption,
} from '../types';

const PROJECT_CATEGORY_LABELS: Record<ProjectCategoryKey, ProjectCategory> = {
  MUSIC: '음악',
  VIDEO: '비디오',
  PERFORMANCE: '공연',
  BOOK: '도서',
  GAME: '게임',
  OTHER: '기타',
};

const createCategoryOption = (
  key: ProjectCategoryKey,
  label?: string,
): ProjectCategoryOption => ({
  id: key,
  value: key,
  label: label?.trim() || PROJECT_CATEGORY_LABELS[key] || key,
});

const FALLBACK_PROJECT_CATEGORIES: ProjectCategoryOption[] = (
  Object.entries(PROJECT_CATEGORY_LABELS) as [ProjectCategoryKey, string][]
).map(([key, label]) => createCategoryOption(key, label));

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const isProjectCategoryKey = (value: string): value is ProjectCategoryKey => {
  return value in PROJECT_CATEGORY_LABELS;
};

const toProjectCategoryKey = (
  value: string | null | undefined,
): ProjectCategoryKey | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const candidate = normalized.toUpperCase().replace(/[\s-]+/g, '_');

  return isProjectCategoryKey(candidate) ? candidate : null;
};

const findProjectCategoryKeyByLabel = (
  label: string,
): ProjectCategoryKey | null => {
  const trimmed = label.trim();

  if (!trimmed) {
    return null;
  }

  const match = Object.entries(PROJECT_CATEGORY_LABELS).find(([, value]) => {
    return value === trimmed;
  });

  return match ? (match[0] as ProjectCategoryKey) : null;
};

const KEY_FIELDS = ['id', 'key', 'code'] as const;
const LABEL_FIELDS = ['label', 'name', 'title', 'text', 'displayName', 'value'] as const;

const getKeyFromRecord = (
  record: Record<string, unknown>,
): ProjectCategoryKey | null => {
  for (const field of KEY_FIELDS) {
    const candidate = record[field];

    if (typeof candidate === 'string') {
      const key = toProjectCategoryKey(candidate);

      if (key) {
        return key;
      }
    }
  }

  const valueCandidate = record.value;

  if (typeof valueCandidate === 'string') {
    const key = toProjectCategoryKey(valueCandidate);

    if (key) {
      return key;
    }
  }

  return null;
};

const getLabelFromRecord = (record: Record<string, unknown>): string | null => {
  for (const field of LABEL_FIELDS) {
    const candidate = record[field];

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
};

const collectFromLabel = (
  label: string,
  upsert: (key: ProjectCategoryKey, label?: string) => void,
) => {
  const trimmed = label.trim();

  if (!trimmed) {
    return;
  }

  const key = findProjectCategoryKeyByLabel(trimmed);

  if (key) {
    upsert(key, trimmed);
  }
};

export const normalizeProjectCategories = (
  raw: unknown,
): ProjectCategoryOption[] => {
  const options = new Map<ProjectCategoryKey, ProjectCategoryOption>();

  const upsert = (key: ProjectCategoryKey, label?: string) => {
    const normalizedLabel = label?.trim();

    if (!options.has(key)) {
      options.set(key, createCategoryOption(key, normalizedLabel));
      return;
    }

    if (normalizedLabel) {
      options.set(key, createCategoryOption(key, normalizedLabel));
    }
  };

  const collect = (value: unknown): void => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        collect(item);
      });
      return;
    }

    if (typeof value === 'string') {
      const key = toProjectCategoryKey(value);

      if (key) {
        upsert(key);
      } else {
        collectFromLabel(value, upsert);
      }

      return;
    }

    if (!isRecord(value)) {
      return;
    }

    if ('data' in value) {
      collect((value as Record<string, unknown>).data);
    }

    const recordKey = getKeyFromRecord(value);
    const recordLabel = getLabelFromRecord(value);

    if (recordKey) {
      upsert(recordKey, recordLabel ?? undefined);
    } else if (recordLabel) {
      collectFromLabel(recordLabel, upsert);
    }

    Object.entries(value).forEach(([entryKey, entryValue]) => {
      if (
        entryKey === 'data' ||
        KEY_FIELDS.includes(entryKey as (typeof KEY_FIELDS)[number]) ||
        LABEL_FIELDS.includes(entryKey as (typeof LABEL_FIELDS)[number])
      ) {
        return;
      }

      const keyFromEntry = toProjectCategoryKey(entryKey);

      if (keyFromEntry) {
        const labelFromEntry =
          typeof entryValue === 'string' ? entryValue : undefined;
        upsert(keyFromEntry, labelFromEntry);

        if (labelFromEntry) {
          return;
        }
      }

      collect(entryValue);
    });
  };

  collect(raw);

  return Array.from(options.values());
};

export const useProjectCategories = () => {
  const query = useQuery<ProjectCategoryOption[]>({
    queryKey: ['projects', 'create', 'categories'],
    queryFn: async () => {
      const response = await constantsAPI.getEnumsByCategory('PROJECT_CATEGORIES');
      const categories = normalizeProjectCategories(response);

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

export { FALLBACK_PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS };
