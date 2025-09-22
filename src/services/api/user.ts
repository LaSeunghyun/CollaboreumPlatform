import { apiCall } from './base';

export const userAPI = {
  getUserProfile: (userId: string) => apiCall(`/users/${userId}/profile`),
  getInvestments: (userId: string) => apiCall(`/users/${userId}/investments`),
  getPoints: (userId: string) => apiCall(`/users/${userId}/points`),
  getPointsHistory: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/users/${userId}/points/history${queryParams}`);
  },
  investWithPoints: (
    userId: string,
    data: { projectId: string; amount: number },
  ) =>
    apiCall(`/users/${userId}/points/invest`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFollowingArtists: (userId: string) => apiCall(`/users/${userId}/following`),
  getFollowingArtistsFundingHistory: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: 'success' | 'failed' | 'ongoing';
      category?: string;
      sortBy?: 'date' | 'amount' | 'status';
      order?: 'asc' | 'desc';
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/users/${userId}/following/funding-history${queryParams}`);
  },
  getArtistFundingHistory: (
    userId: string,
    artistId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: 'success' | 'failed' | 'ongoing';
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(
      `/users/${userId}/following/${artistId}/funding-history${queryParams}`,
    );
  },
  updateProfile: (userId: string, data: any) =>
    apiCall(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
