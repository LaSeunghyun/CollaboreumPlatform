import {
  useApiQuery,
  useApiMutation,
  usePaginatedQuery,
  useOptimisticMutation,
} from './useApi';
import type { SearchParams } from '../../types/api';
import type { ApiResponse } from '@/shared/types';
import type { FundingProject as FundingProjectDetail } from '@/types/fundingProject';

interface FundingProjectSummary extends FundingProjectDetail {
  likesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface FundingProjectListData {
  projects: FundingProjectSummary[];
}

type FundingProjectsQueryResult = ApiResponse<FundingProjectListData>;

interface BackProjectVariables {
  projectId: string;
  amount: number;
  message?: string;
  rewardId?: string;
}

interface ProjectActionVariables {
  projectId: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFundingProjectSummary = (value: unknown): value is FundingProjectSummary =>
  isRecord(value) && 'id' in value;

const updateFundingProjects = (
  previous: FundingProjectsQueryResult | undefined,
  projectId: string,
  updater: (project: FundingProjectSummary) => FundingProjectSummary,
): FundingProjectsQueryResult | undefined => {
  if (!previous?.data?.projects) {
    return previous;
  }

  const nextProjects = previous.data.projects.map(project => {
    if (!isFundingProjectSummary(project)) {
      return project;
    }

    const normalizedId = String(project.id);
    if (normalizedId !== projectId) {
      return project;
    }

    const normalizedProject: FundingProjectSummary = {
      ...project,
      currentAmount:
        typeof project.currentAmount === 'number' ? project.currentAmount : 0,
      backers: typeof project.backers === 'number' ? project.backers : 0,
      likesCount:
        typeof project.likesCount === 'number' ? project.likesCount : 0,
      isLiked:
        typeof project.isLiked === 'boolean' ? project.isLiked : undefined,
      isBookmarked:
        typeof project.isBookmarked === 'boolean'
          ? project.isBookmarked
          : undefined,
    };

    return updater(normalizedProject);
  });

  return {
    ...previous,
    data: {
      ...previous.data,
      projects: nextProjects,
    },
  };
};

// 펀딩 프로젝트 목록 조회
export const useFundingProjects = (params?: SearchParams) => {
  return usePaginatedQuery<FundingProjectListData>(
    ['funding', 'projects', params || {}],
    '/funding/projects',
    params || {},
  );
};

// 펀딩 프로젝트 상세 조회
export const useFundingProject = (projectId: string) => {
  return useApiQuery<FundingProjectDetail>(
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
  return useOptimisticMutation<FundingProjectListData, BackProjectVariables>(
    '/funding/projects/:id/back',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        updateFundingProjects(oldData, newData.projectId, project => ({
          ...project,
          currentAmount: project.currentAmount + newData.amount,
          backers: project.backers + 1,
        })),
    },
  );
};

// 펀딩 프로젝트 좋아요
export const useLikeFundingProject = () => {
  return useOptimisticMutation<FundingProjectListData, ProjectActionVariables>(
    '/funding/projects/:id/like',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        updateFundingProjects(oldData, newData.projectId, project => ({
          ...project,
          isLiked: !project.isLiked,
          likesCount: (project.likesCount ?? 0) + (project.isLiked ? -1 : 1),
        })),
    },
  );
};

// 펀딩 프로젝트 북마크
export const useBookmarkFundingProject = () => {
  return useOptimisticMutation<FundingProjectListData, ProjectActionVariables>(
    '/funding/projects/:id/bookmark',
    'POST',
    {
      queryKey: ['funding', 'projects'],
      updateFn: (oldData, newData) =>
        updateFundingProjects(oldData, newData.projectId, project => ({
          ...project,
          isBookmarked: !project.isBookmarked,
        })),
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
