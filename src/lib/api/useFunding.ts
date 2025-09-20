import {
  useApiQuery,
  useApiMutation,
  usePaginatedQuery,
  useOptimisticMutation,
} from './useApi';
import type { ApiResponse } from '@/shared/types';
import { SearchParams } from '../../types/api';

type ProjectRecord = Record<string, unknown> & { id?: string | number };

type FundingProjectsCache = ApiResponse<{ projects: ProjectRecord[] }> | undefined;

interface BackProjectPayload {
  projectId: string;
  amount: number;
  message: string;
  rewardId?: string;
}

interface ToggleProjectPayload {
  projectId: string;
}

const toNumeric = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const mapProjects = (
  cache: FundingProjectsCache,
  mapper: (project: ProjectRecord) => ProjectRecord,
): FundingProjectsCache => {
  const projects = cache?.data?.projects;
  if (!Array.isArray(projects)) {
    return cache;
  }

  const updatedProjects = projects.map((project) => mapper(project));

  return cache
    ? {
        ...cache,
        data: {
          ...cache.data,
          projects: updatedProjects,
        },
      }
    : cache;
};

// 펀딩 프로젝트 목록 조회
export const useFundingProjects = (params?: SearchParams) => {
  return usePaginatedQuery(
    ['funding', 'projects', params || {}],
    '/funding/projects',
    params || {},
  );
};

// 펀딩 프로젝트 상세 조회
export const useFundingProject = (projectId: string) => {
  return useApiQuery(
    ['funding', 'project', projectId],
    `/funding/projects/${projectId}`,
    undefined,
    { enabled: !!projectId },
  );
};

// 펀딩 프로젝트 생성
export const useCreateFundingProject = () => {
  return useApiMutation('/funding/projects', 'POST', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};

// 펀딩 프로젝트 후원
export const useBackFundingProject = () => {
  return useOptimisticMutation<FundingProjectsCache, BackProjectPayload>(
    '/funding/projects/:id/back',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        mapProjects(oldData, (project) => {
          const projectId = project.id != null ? String(project.id) : '';
          if (projectId !== newData.projectId) {
            return project;
          }

          const currentAmount = toNumeric(project.currentAmount) + newData.amount;
          const backers = toNumeric(project.backers) + 1;
          const backerCount = toNumeric(project.backerCount) + 1;

          return {
            ...project,
            currentAmount,
            backers,
            backerCount,
          };
        }),
    },
  );
};

// 펀딩 프로젝트 좋아요
export const useLikeFundingProject = () => {
  return useOptimisticMutation<FundingProjectsCache, ToggleProjectPayload>(
    '/funding/projects/:id/like',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        mapProjects(oldData, (project) => {
          const projectId = project.id != null ? String(project.id) : '';
          if (projectId !== newData.projectId) {
            return project;
          }

          const isLiked = Boolean(project.isLiked);
          const likesCount = toNumeric(project.likesCount) + (isLiked ? -1 : 1);

          return {
            ...project,
            isLiked: !isLiked,
            likesCount,
          };
        }),
    },
  );
};

// 펀딩 프로젝트 북마크
export const useBookmarkFundingProject = () => {
  return useOptimisticMutation<FundingProjectsCache, ToggleProjectPayload>(
    '/funding/projects/:id/bookmark',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        mapProjects(oldData, (project) => {
          const projectId = project.id != null ? String(project.id) : '';
          if (projectId !== newData.projectId) {
            return project;
          }

          return {
            ...project,
            isBookmarked: !project.isBookmarked,
          };
        }),
    },
  );
};

// 펀딩 프로젝트 환불
export const useRefundFundingProject = () => {
  return useApiMutation('/funding/projects/:id/refund', 'POST', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};

// 펀딩 프로젝트 집행 계획 업데이트
export const useUpdateFundingExecution = () => {
  return useApiMutation('/funding/projects/:id/execution', 'PUT', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};

// 펀딩 프로젝트 비용 내역 추가
export const useAddFundingExpense = () => {
  return useApiMutation('/funding/projects/:id/expenses', 'POST', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};

// 펀딩 프로젝트 수익 분배
export const useDistributeFundingRevenue = () => {
  return useApiMutation('/funding/projects/:id/distribute-revenue', 'POST', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};
