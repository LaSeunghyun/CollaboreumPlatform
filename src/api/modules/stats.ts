import { apiCall } from '../core/client';

// Stats APIs
export const statsAPI = {
  // 플랫폼 전체 통계 조회
  getPlatformStats: () => apiCall('/stats/platform'),
  // 아티스트별 통계 조회
  getArtistStats: (artistId: string) => apiCall(`/stats/artist/${artistId}`),
  // 프로젝트 통계 조회
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
  // 커뮤니티 통계 조회
  getCommunityStats: () => apiCall('/stats/community'),
};
