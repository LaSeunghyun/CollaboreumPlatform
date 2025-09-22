import { apiCall } from './base';

// Gallery APIs
export const galleryAPI = {
  // 모든 작품 조회 (필터링 및 정렬 포함)
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

  // 특정 작품 조회
  getArtworkById: (artworkId: string) =>
    apiCall(`/gallery/artworks/${artworkId}`),

  // 카테고리별 작품 조회
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

  // 아티스트별 작품 조회
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

  // 작품 업로드
  uploadArtwork: (data: any) =>
    apiCall('/gallery/artworks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 작품 수정
  updateArtwork: (artworkId: string, data: any) =>
    apiCall(`/gallery/artworks/${artworkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 작품 삭제
  deleteArtwork: (artworkId: string) =>
    apiCall(`/gallery/artworks/${artworkId}`, {
      method: 'DELETE',
    }),

  // 작품 좋아요
  likeArtwork: (artworkId: string) =>
    apiCall(`/gallery/artworks/${artworkId}/like`, {
      method: 'POST',
    }),

  // 갤러리 카테고리 조회
  getGalleryCategories: () => apiCall('/gallery/categories'),

  // 하위 호환성을 위한 기존 함수들
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
