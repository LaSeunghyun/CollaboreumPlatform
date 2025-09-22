import { useQuery } from '@tanstack/react-query';
import { eventManagementAPI } from '../../services/api/events';

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
    queryKey: ['events', eventId],
    queryFn: () => eventManagementAPI.getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// 다가오는 이벤트 조회 (홈페이지용)
export const useUpcomingEvents = (limit: number = 3) => {
  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: () =>
      eventManagementAPI.getEvents({
        status: 'upcoming',
        limit,
        sortBy: 'startDate',
        order: 'asc',
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
