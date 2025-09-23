import { apiCall } from '../core/client';

// Event Management APIs
export const eventManagementAPI = {
  // 이벤트 목록 조회
  getEvents: (params?: {
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
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall(`/events${queryString ? `?${queryString}` : ''}`);
  },

  // 이벤트 상세 조회
  getEventById: (eventId: string) => apiCall(`/events/${eventId}`),

  // 이벤트 생성
  createEvent: (data: any) =>
    apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 이벤트 수정
  updateEvent: (eventId: string, data: any) =>
    apiCall(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 이벤트 삭제
  deleteEvent: (eventId: string) =>
    apiCall(`/events/${eventId}`, {
      method: 'DELETE',
    }),

  // 이벤트 참가
  joinEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/join`, {
      method: 'POST',
    }),

  // 이벤트 참가 취소
  leaveEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/leave`, {
      method: 'DELETE',
    }),

  // 이벤트 참가자 목록 조회
  getEventParticipants: (
    eventId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/events/${eventId}/participants${queryParams}`);
  },

  // 이벤트 좋아요/취소
  likeEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/like`, {
      method: 'POST',
    }),

  // 이벤트 북마크/취소
  bookmarkEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/bookmark`, {
      method: 'POST',
    }),

  // 이벤트 상세 조회 (별칭)
  getEvent: (eventId: string) => apiCall(`/events/${eventId}`),
};
