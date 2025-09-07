import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventManagementAPI } from '../../services/api';

// 이벤트 목록 조회
export const useEvents = (params?: {
    category?: string;
    status?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}) => {
    return useQuery({
        queryKey: ['events', params],
        queryFn: () => eventManagementAPI.getEvents(params),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
};

// 이벤트 상세 조회
export const useEvent = (eventId: string) => {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: () => eventManagementAPI.getEventById(eventId),
        enabled: !!eventId,
        staleTime: 5 * 60 * 1000,
    });
};

// 이벤트 생성
export const useCreateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => eventManagementAPI.createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 수정
export const useUpdateEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
            eventManagementAPI.updateEvent(eventId, data),
        onSuccess: (_, { eventId }) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 삭제
export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventManagementAPI.deleteEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 참가
export const useJoinEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventManagementAPI.joinEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 참가 취소
export const useLeaveEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventManagementAPI.leaveEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 참가자 목록 조회
export const useEventParticipants = (eventId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['event', 'participants', eventId, params],
        queryFn: () => eventManagementAPI.getEventParticipants(eventId, params),
        enabled: !!eventId,
        staleTime: 2 * 60 * 1000, // 2분
    });
};

// 이벤트 좋아요
export const useLikeEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventManagementAPI.likeEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
};

// 이벤트 북마크
export const useBookmarkEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (eventId: string) => eventManagementAPI.bookmarkEvent(eventId),
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        },
    });
};
