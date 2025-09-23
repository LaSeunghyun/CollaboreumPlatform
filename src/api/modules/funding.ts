import { apiCall } from '../core/client';
import type { ApiResponse } from '@/shared/types';
import type {
  FundingProject,
  FundingProjectPayload,
} from '@/types/fundingProject';
import { mapFundingProjectDetail } from '../mappers/fundingProjectMapper';

// Funding Projects APIs
export const fundingAPI = {
  // 프로젝트 목록 조회
  getProjects: (filters?: any) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return apiCall(`/funding/projects${queryParams}`);
  },

  // 프로젝트 상세 조회
  getProject: async (projectId: string): Promise<FundingProject | null> => {
    const response = await apiCall<ApiResponse<FundingProjectPayload>>(
      `/funding/projects/${projectId}`,
    );
    return mapFundingProjectDetail(response.data);
  },
  getProjectDetail: async (
    projectId: string,
  ): Promise<FundingProject | null> => {
    const response = await apiCall<ApiResponse<FundingProjectPayload>>(
      `/funding/projects/${projectId}`,
    );
    return mapFundingProjectDetail(response.data);
  },

  // 프로젝트 생성
  createProject: (projectData: any) =>
    apiCall('/funding/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  // 프로젝트 업데이트
  updateProject: (projectId: string, projectData: any) =>
    apiCall(`/funding/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  // 후원 참여
  backProject: (projectId: string, backData: any) =>
    apiCall(`/funding/projects/${projectId}/back`, {
      method: 'POST',
      body: JSON.stringify(backData),
    }),

  // 환불 처리
  refundProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/refund`, {
      method: 'POST',
    }),

  // 집행 계획 업데이트
  updateExecutionPlan: (projectId: string, executionData: any) =>
    apiCall(`/funding/projects/${projectId}/execution`, {
      method: 'PUT',
      body: JSON.stringify(executionData),
    }),

  // 비용 내역 추가
  addExpense: (projectId: string, expenseData: any) =>
    apiCall(`/funding/projects/${projectId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }),

  // 수익 분배 실행
  distributeRevenue: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/distribute-revenue`, {
      method: 'POST',
    }),

  // 프로젝트 좋아요/취소
  likeProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/like`, {
      method: 'POST',
    }),

  // 프로젝트 북마크/취소
  bookmarkProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/bookmark`, {
      method: 'POST',
    }),

  // 기존 함수들 (호환성 유지)
  getProjectDetails: (projectId: number) =>
    fundingAPI.getProjectDetail(String(projectId)),
  investInProject: (projectId: number, amount: number) =>
    apiCall(`/funding/projects/${projectId}/invest`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  getProjectUpdates: (projectId: number) =>
    apiCall(`/funding/projects/${projectId}/updates`),
};
