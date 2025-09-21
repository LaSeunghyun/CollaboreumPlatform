// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useApiQuery,
  useApiMutation,
  usePaginatedQuery,
  useOptimisticMutation,
} from './useApi';
import { SearchParams } from '../../types/api';

// 프로젝트 목록 조회
export const useProjects = (params?: SearchParams) => {
  return usePaginatedQuery(
    ['projects', params || {}],
    '/funding/projects',
    params || {},
  );
};

// 프로젝트 상세 조회
export const useProject = (projectId: string) => {
  return useApiQuery(
    ['project', projectId],
    `/funding/projects/${projectId}`,
    undefined,
    { enabled: !!projectId },
  );
};

// 프로젝트 생성
export const useCreateProject = () => {
  return useApiMutation('/funding/projects', 'POST', {
    onSuccess: () => {
      // 프로젝트 목록 무효화
    },
  });
};

// 프로젝트 후원
export const useBackProject = () => {
  return useOptimisticMutation('/funding/projects/:id/back', 'POST', {
    queryKey: ['projects'],
    updateFn: (oldData, newData) => {
      // 옵티미스틱 업데이트 로직
      return oldData;
    },
  });
};

// 프로젝트 좋아요
export const useLikeProject = () => {
  return useOptimisticMutation('/funding/projects/:id/like', 'POST', {
    queryKey: ['projects'],
    updateFn: (oldData, newData) => {
      // 옵티미스틱 업데이트 로직
      return oldData;
    },
  });
};

// 프로젝트 북마크
export const useBookmarkProject = () => {
  return useApiMutation('/funding/projects/:id/bookmark', 'POST');
};
