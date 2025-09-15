import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fundingAPI } from '../../services/api';

// 프로젝트 목록 조회
export const useProjects = (params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}) => {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => fundingAPI.getProjects(params),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 1, // 재시도 1회만
        retryDelay: 1000
    });
};

// 프로젝트 상세 조회
export const useProject = (projectId: string) => {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: () => fundingAPI.getProject(projectId),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
};

// 프로젝트 생성
export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectData: any) => fundingAPI.createProject(projectData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

// 프로젝트 후원
export const useBackProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, backData }: { projectId: string; backData: any }) =>
            fundingAPI.backProject(projectId, backData),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

// 프로젝트 좋아요
export const useLikeProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => fundingAPI.likeProject(projectId),
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

// 프로젝트 북마크
export const useBookmarkProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => fundingAPI.bookmarkProject(projectId),
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
};
