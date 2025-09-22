import { apiCall } from './base';

export const artistAPI = {
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

  getArtistById: (artistId: string) => apiCall(`/artists/${artistId}`),

  getPopularArtists: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiCall(`/artists/featured/popular${queryParams}`);
  },

  getNewArtists: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiCall(`/artists/new${queryParams}`);
  },

  followArtist: (artistId: string, action: 'follow' | 'unfollow') =>
    apiCall(`/artists/${artistId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  updateArtistProfile: (artistId: string, data: any) =>
    apiCall(`/artists/${artistId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getArtistData: (artistId: number) => apiCall(`/artists/${artistId}/dashboard`),
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

export const profileAPI = {
  getArtistProfile: (artistId: number) => apiCall(`/artists/${artistId}/profile`),
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
