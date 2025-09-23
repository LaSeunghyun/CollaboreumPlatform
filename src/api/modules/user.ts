import { apiCall } from '../core/client';

// User/Investor APIs
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
  getFollowingArtists: (userId: string) =>
    apiCall(`/users/${userId}/following`),
  // 팔로우하는 아티스트의 펀딩 프로젝트 히스토리 조회
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
  // 특정 아티스트의 펀딩 프로젝트 히스토리 조회
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

// User Profile Management APIs
export const userProfileAPI = {
  // 사용자 프로필 조회
  getUserProfile: (userId: string) => apiCall(`/users/${userId}/profile`),

  // 사용자 프로필 업데이트
  updateUserProfile: (userId: string, data: any) =>
    apiCall(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 비밀번호 변경
  changePassword: (
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) =>
    apiCall(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 사용자 프로젝트 목록 조회
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

  // 사용자 수익 내역 조회
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

  // 사용자 백킹 내역 조회
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
