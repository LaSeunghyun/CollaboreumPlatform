import { apiCall } from './api';
import {
  ArtistFundingHistory,
  FundingHistoryFilter,
  FundingProject,
} from '../types/funding';
import type { ApiResponse } from '@/shared/types';

// 프로젝트 업데이트 타입 정의
interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  type?: string;
  createdAt?: string;
}

// 프로젝트 후원자 타입 정의
interface ProjectBacker {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: string;
}

// 펀딩 서비스 API
export const fundingService = {
  // 팔로우하는 아티스트의 펀딩 프로젝트 히스토리 조회
  getFollowingArtistsFundingHistory: async (
    userId: string,
    filter: FundingHistoryFilter,
  ): Promise<ArtistFundingHistory[]> => {
    try {
      const response = await apiCall<ApiResponse<ArtistFundingHistory[]>>(
        `/users/${userId}/following/funding-history`,
        {
          method: 'POST',
          body: JSON.stringify(filter),
        },
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.message || '펀딩 히스토리를 가져오는데 실패했습니다.',
      );
    } catch (error) {
      console.error('펀딩 히스토리 조회 실패:', error);
      throw error;
    }
  },

  // 특정 아티스트의 펀딩 프로젝트 히스토리 조회
  getArtistFundingHistory: async (
    userId: string,
    artistId: string,
    filter: Partial<FundingHistoryFilter>,
  ): Promise<ArtistFundingHistory> => {
    try {
      const response = await apiCall<ApiResponse<ArtistFundingHistory>>(
        `/users/${userId}/following/${artistId}/funding-history`,
        {
          method: 'POST',
          body: JSON.stringify(filter),
        },
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.message || '아티스트 펀딩 히스토리를 가져오는데 실패했습니다.',
      );
    } catch (error) {
      console.error('아티스트 펀딩 히스토리 조회 실패:', error);
      throw error;
    }
  },

  // 프로젝트 상세 정보 조회
  getProjectDetails: async (projectId: string): Promise<FundingProject> => {
    try {
      const response = await apiCall<ApiResponse<FundingProject>>(
        `/funding/projects/${projectId}`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.message || '프로젝트 상세 정보를 가져오는데 실패했습니다.',
      );
    } catch (error) {
      console.error('프로젝트 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 프로젝트 업데이트 조회
  getProjectUpdates: async (projectId: string): Promise<ProjectUpdate[]> => {
    try {
      const response = await apiCall<ApiResponse<ProjectUpdate[]>>(
        `/funding/projects/${projectId}/updates`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.message || '프로젝트 업데이트를 가져오는데 실패했습니다.',
      );
    } catch (error) {
      console.error('프로젝트 업데이트 조회 실패:', error);
      throw error;
    }
  },

  // 프로젝트 후원자 목록 조회
  getProjectBackers: async (projectId: string): Promise<ProjectBacker[]> => {
    try {
      const response = await apiCall<ApiResponse<ProjectBacker[]>>(
        `/funding/projects/${projectId}/backers`,
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.message || '후원자 목록을 가져오는데 실패했습니다.',
      );
    } catch (error) {
      console.error('후원자 목록 조회 실패:', error);
      throw error;
    }
  },
};
