import { apiCall } from './base';

export const galleryAPI = {
  getAllArtworks: (params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/gallery/artworks${queryParams}`);
  },

  getArtworkById: (artworkId: string) => apiCall(`/gallery/artworks/${artworkId}`),

  getArtworksByCategory: (
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/gallery/artworks?category=${category}${queryParams}`);
  },

  getArtworksByArtist: (
    artistId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/gallery/artists/${artistId}/artworks${queryParams}`);
  },

  uploadArtwork: (data: any) =>
    apiCall('/gallery/artworks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateArtwork: (artworkId: string, data: any) =>
    apiCall(`/gallery/artworks/${artworkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteArtwork: (artworkId: string) =>
    apiCall(`/gallery/artworks/${artworkId}`, {
      method: 'DELETE',
    }),

  likeArtwork: (artworkId: string) =>
    apiCall(`/gallery/artworks/${artworkId}/like`, {
      method: 'POST',
    }),

  getGalleryCategories: () => apiCall('/gallery/categories'),

  getArtworks: async (filters?: any) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    const response = await apiCall<any>(`/gallery/artworks${queryParams}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiCall<any>('/gallery/categories');
    return response.data;
  },

  getArtistArtworks: async (
    artistId: string,
    page: number = 1,
    limit: number = 20,
  ) => {
    const response = await apiCall<any>(
      `/gallery/artists/${artistId}/artworks?page=${page}&limit=${limit}`,
    );
    return response.data;
  },
};
