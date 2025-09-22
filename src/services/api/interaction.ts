import { apiCall } from './base';

// 알림 및 상호작용 APIs
export const interactionAPI = {
  // 알림 목록 조회
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  }) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/notifications${queryParams}`);
  },

  // 알림 읽음 처리
  markNotificationAsRead: (notificationId: string) =>
    apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: () =>
    apiCall('/notifications/read-all', {
      method: 'PUT',
    }),

  // 알림 삭제
  deleteNotification: (notificationId: string) =>
    apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
    }),

  // 아티스트 팔로우/언팔로우
  followArtist: (artistId: string) =>
    apiCall(`/artists/${artistId}/follow`, {
      method: 'POST',
    }),

  // 아티스트 언팔로우
  unfollowArtist: (artistId: string) =>
    apiCall(`/artists/${artistId}/unfollow`, {
      method: 'DELETE',
    }),

  // 검색
  search: (
    query: string,
    type?: 'artists' | 'projects' | 'events' | 'posts',
  ) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return apiCall(`/search?${params.toString()}`);
  },
};
