import { apiCall } from './base';

export const statsAPI = {
  getPlatformStats: () => apiCall('/stats/platform'),
  getArtistStats: (artistId: string) => apiCall(`/stats/artist/${artistId}`),
  getProjectStats: (params?: {
    category?: string;
    status?: string;
    timeframe?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);

    const queryString = queryParams.toString();
    return apiCall(`/stats/projects${queryString ? `?${queryString}` : ''}`);
  },
  getCommunityStats: () => apiCall('/stats/community'),
};
