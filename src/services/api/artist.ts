import { apiCall } from './base';

// Artist APIs with improved error handling
export const artistAPI = {
  // 모든 아티스트 조회
  getAllArtists: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    genre?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/artists${queryParams}`);
  },

  // 특정 아티스트 조회
  getArtistById: (artistId: string) => apiCall(`/artists/${artistId}`),

  // 인기 아티스트 조회
  getPopularArtists: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiCall(`/artists/featured/popular${queryParams}`);
  },

  // 새로 가입한 아티스트 조회
  getNewArtists: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiCall(`/artists/new${queryParams}`);
  },

  // 아티스트 팔로우/언팔로우
  followArtist: (artistId: string, action: 'follow' | 'unfollow') =>
    apiCall(`/artists/${artistId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // 아티스트 프로필 업데이트
  updateArtistProfile: (artistId: string, data: any) =>
    apiCall(`/artists/${artistId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 기존 함수들 (하위 호환성)
  getArtistData: (artistId: number) =>
    apiCall(`/artists/${artistId}/dashboard`),
  getProjects: (artistId: number) => apiCall(`/artists/${artistId}/projects`),
  getWbsItems: (projectId: number) => apiCall(`/projects/${projectId}/wbs`),
  updateProject: (projectId: number, data: any) =>
    apiCall(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  createProject: (data: any) =>
    apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Artist Profile APIs
export const profileAPI = {
  getArtistProfile: (artistId: number) =>
    apiCall(`/artists/${artistId}/profile`),
  updateProfile: (artistId: number, data: any) =>
    apiCall(`/artists/${artistId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  followArtist: (artistId: number) =>
    apiCall(`/artists/${artistId}/follow`, {
      method: 'POST',
    }),
  unfollowArtist: (artistId: number) =>
    apiCall(`/artists/${artistId}/unfollow`, {
      method: 'DELETE',
    }),
};

// Enhanced artist data fetcher - API만 사용
export const getArtistData = async () => {
  try {
    const response = await artistAPI.getPopularArtists(20);
    if ((response as any).success && (response as any).data?.artists) {
      return (response as any).data.artists;
    }
    return [];
  } catch (error) {
    console.error('API call failed:', error);
    return [];
  }
};
