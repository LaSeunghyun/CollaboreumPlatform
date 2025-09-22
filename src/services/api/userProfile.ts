import { apiCall } from './base';

export const userProfileAPI = {
  getUserProfile: (userId: string) => apiCall(`/users/${userId}/profile`),

  updateUserProfile: (userId: string, data: any) =>
    apiCall(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) =>
    apiCall(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUserProjects: (
    userId: string,
    params?: {
      status?: string;
      category?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/users/${userId}/projects${queryParams}`);
  },

  getUserRevenues: (
    userId: string,
    params?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/users/${userId}/revenues${queryParams}`);
  },

  getUserBackings: (
    userId: string,
    params?: {
      status?: string;
      projectId?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/users/${userId}/backings${queryParams}`);
  },
};
