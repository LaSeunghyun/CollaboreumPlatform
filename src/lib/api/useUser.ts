import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, userProfileAPI, interactionAPI } from '../../services/api';

// 사용자 프로필 조회
export const useUserProfile = (userId: string) => {
    return useQuery({
        queryKey: ['user', 'profile', userId],
        queryFn: () => userProfileAPI.getUserProfile(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5분
    });
};

// 사용자 프로필 업데이트
export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) =>
            userProfileAPI.updateUserProfile(userId, data),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile', userId] });
        },
    });
};

// 사용자 프로젝트 목록 조회
export const useUserProjects = (userId: string, params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['user', 'projects', userId, params],
        queryFn: () => userProfileAPI.getUserProjects(userId, params),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 사용자 수익 내역 조회
export const useUserRevenues = (userId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['user', 'revenues', userId, params],
        queryFn: () => userProfileAPI.getUserRevenues(userId, params),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 사용자 백킹 내역 조회
export const useUserBackings = (userId: string, params?: {
    status?: string;
    projectId?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['user', 'backings', userId, params],
        queryFn: () => userProfileAPI.getUserBackings(userId, params),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 팔로우하는 아티스트 목록 조회
export const useFollowingArtists = (userId: string) => {
    return useQuery({
        queryKey: ['user', 'following', userId],
        queryFn: () => userAPI.getFollowingArtists(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 팔로우하는 아티스트의 펀딩 프로젝트 히스토리 조회
export const useFollowingArtistsFundingHistory = (userId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'success' | 'failed' | 'ongoing';
    category?: string;
    sortBy?: 'date' | 'amount' | 'status';
    order?: 'asc' | 'desc';
}) => {
    return useQuery({
        queryKey: ['user', 'following', 'funding-history', userId, params],
        queryFn: () => userAPI.getFollowingArtistsFundingHistory(userId, params),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 특정 아티스트의 펀딩 프로젝트 히스토리 조회
export const useArtistFundingHistory = (userId: string, artistId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'success' | 'failed' | 'ongoing';
}) => {
    return useQuery({
        queryKey: ['user', 'artist', 'funding-history', userId, artistId, params],
        queryFn: () => userAPI.getArtistFundingHistory(userId, artistId, params),
        enabled: !!userId && !!artistId,
        staleTime: 5 * 60 * 1000,
    });
};

// 알림 목록 조회
export const useNotifications = (params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
}) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => interactionAPI.getNotifications(params),
        staleTime: 1 * 60 * 1000, // 1분
    });
};

// 알림 읽음 처리
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            interactionAPI.markNotificationAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// 모든 알림 읽음 처리
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => interactionAPI.markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// 알림 삭제
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            interactionAPI.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// 검색
export const useSearch = (query: string, type?: 'artists' | 'projects' | 'events' | 'posts') => {
    return useQuery({
        queryKey: ['search', query, type],
        queryFn: async () => {
            try {
                const result = await interactionAPI.search(query, type);
                return result;
            } catch (error) {
                // 네트워크 연결 상태 확인
                if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    throw new Error('네트워크 연결을 확인해주세요.');
                }
                throw error;
            }
        },
        enabled: !!query && query.length > 0,
        staleTime: 2 * 60 * 1000, // 2분
        retry: (failureCount, error) => {
            // 네트워크 에러인 경우 3회까지 재시도
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                return failureCount < 3;
            }
            return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
