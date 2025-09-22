import { apiCall } from './base';

export const eventManagementAPI = {
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

  getEventById: (eventId: string) => apiCall(`/events/${eventId}`),

  createEvent: (data: any) =>
    apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEvent: (eventId: string, data: any) =>
    apiCall(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEvent: (eventId: string) =>
    apiCall(`/events/${eventId}`, {
      method: 'DELETE',
    }),

  joinEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/join`, {
      method: 'POST',
    }),

  leaveEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/leave`, {
      method: 'DELETE',
    }),

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

  likeEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/like`, {
      method: 'POST',
    }),

  bookmarkEvent: (eventId: string) =>
    apiCall(`/events/${eventId}/bookmark`, {
      method: 'POST',
    }),

  getEvent: (eventId: string) => apiCall(`/events/${eventId}`),
};
