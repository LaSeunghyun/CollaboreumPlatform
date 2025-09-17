import {
  useApiQuery,
  useApiMutation,
  usePaginatedQuery,
  useOptimisticMutation,
} from './useApi';
import { SearchParams } from '../../types/api';

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
  return useOptimisticMutation('/funding/projects/:id/back', 'POST', {
    queryKey: ['funding', 'projects'],
    updateFn: (oldData, newData) => {
      // 옵티미스틱 업데이트 로직
      if (oldData?.data?.projects) {
        const updatedProjects = oldData.data.projects.map((project: any) => {
          if (project.id === newData.projectId) {
            return {
              ...project,
              currentAmount: project.currentAmount + newData.amount,
              backers: project.backers + 1,
            };
          }
          return project;
        });
        return {
          ...oldData,
          data: {
            ...oldData.data,
            projects: updatedProjects,
          },
        };
      }
      return oldData;
    },
  });
};

// 펀딩 프로젝트 좋아요
export const useLikeFundingProject = () => {
  return useOptimisticMutation('/funding/projects/:id/like', 'POST', {
    queryKey: ['funding', 'projects'],
    updateFn: (oldData, newData) => {
      // 옵티미스틱 업데이트 로직
      if (oldData?.data?.projects) {
        const updatedProjects = oldData.data.projects.map((project: any) => {
          if (project.id === newData.projectId) {
            return {
              ...project,
              isLiked: !project.isLiked,
              likesCount: project.isLiked
                ? project.likesCount - 1
                : project.likesCount + 1,
            };
          }
          return project;
        });
        return {
          ...oldData,
          data: {
            ...oldData.data,
            projects: updatedProjects,
          },
        };
      }
      return oldData;
    },
  });
};

// 펀딩 프로젝트 북마크
export const useBookmarkFundingProject = () => {
  return useOptimisticMutation('/funding/projects/:id/bookmark', 'POST', {
    queryKey: ['funding', 'projects'],
    updateFn: (oldData, newData) => {
      // 옵티미스틱 업데이트 로직
      if (oldData?.data?.projects) {
        const updatedProjects = oldData.data.projects.map((project: any) => {
          if (project.id === newData.projectId) {
            return {
              ...project,
              isBookmarked: !project.isBookmarked,
            };
          }
          return project;
        });
        return {
          ...oldData,
          data: {
            ...oldData.data,
            projects: updatedProjects,
          },
        };
      }
      return oldData;
    },
  });
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
