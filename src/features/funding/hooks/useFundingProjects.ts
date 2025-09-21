import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fundingService } from '../services/fundingService';
import {
  FundingProject,
  FundingStats,
  FundingFilters,
  CreateFundingProjectRequest,
  UpdateFundingProjectRequest,
  BackProjectRequest,
} from '../types/funding.types';

// 펀딩 프로젝트 목록 조회
export function useFundingProjects(filters?: FundingFilters) {
  return useQuery<FundingProject[]>({
    queryKey: ['funding', 'projects', filters],
    queryFn: () => fundingService.getProjects(filters),
  });
}

// 펀딩 프로젝트 상세 조회
export function useFundingProject(id: number) {
  return useQuery<FundingProject>({
    queryKey: ['funding', 'project', id],
    queryFn: () => fundingService.getProject(id),
    enabled: !!id,
  });
}

// 펀딩 통계 조회
export function useFundingStats() {
  return useQuery<FundingStats>({
    queryKey: ['funding', 'stats'],
    queryFn: fundingService.getStats,
  });
}

// 펀딩 프로젝트 생성
export function useCreateFundingProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFundingProjectRequest) =>
      fundingService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['funding', 'stats'] });
    },
  });
}

// 펀딩 프로젝트 수정
export function useUpdateFundingProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateFundingProjectRequest) =>
      fundingService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
      queryClient.invalidateQueries({
        queryKey: ['funding', 'project', variables.id],
      });
    },
  });
}

// 펀딩 프로젝트 삭제
export function useDeleteFundingProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fundingService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['funding', 'stats'] });
    },
  });
}

// 프로젝트 후원
export function useBackProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BackProjectRequest) => fundingService.backProject(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['funding', 'project', variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['funding', 'stats'] });
    },
  });
}

// 프로젝트 좋아요
export function useLikeProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) => fundingService.likeProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ['funding', 'project', projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
    },
  });
}

// 프로젝트 북마크
export function useBookmarkProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) =>
      fundingService.bookmarkProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding', 'projects'] });
    },
  });
}
