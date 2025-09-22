import { apiCall } from './base';

export const interactionAPI = {
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

  markNotificationAsRead: (notificationId: string) =>
    apiCall(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsAsRead: () =>
    apiCall('/notifications/read-all', {
      method: 'PUT',
    }),

  deleteNotification: (notificationId: string) =>
    apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
    }),

  followArtist: (artistId: string) =>
    apiCall(`/artists/${artistId}/follow`, {
      method: 'POST',
    }),

  unfollowArtist: (artistId: string) =>
    apiCall(`/artists/${artistId}/unfollow`, {
      method: 'DELETE',
    }),

  search: (
    query: string,
    type?: 'artists' | 'projects' | 'events' | 'posts',
  ) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return apiCall(`/search?${params.toString()}`);
  },
};
