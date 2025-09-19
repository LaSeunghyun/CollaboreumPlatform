import { api } from '@/lib/api/api';
import { 
  FundingProject, 
  FundingStats, 
  FundingFilters,
  CreateFundingProjectRequest,
  UpdateFundingProjectRequest,
  BackProjectRequest 
} from '../types/funding.types';

class FundingService {
  // 펀딩 프로젝트 목록 조회
  async getProjects(filters?: FundingFilters): Promise<FundingProject[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/funding/projects?${params.toString()}`);
    return response.data.data;
  }

  // 펀딩 프로젝트 상세 조회
  async getProject(id: number): Promise<FundingProject> {
    const response = await api.get(`/funding/projects/${id}`);
    return response.data.data;
  }

  // 펀딩 통계 조회
  async getStats(): Promise<FundingStats> {
    const response = await api.get('/funding/stats');
    return response.data.data;
  }

  // 펀딩 프로젝트 생성
  async createProject(data: CreateFundingProjectRequest): Promise<FundingProject> {
    const response = await api.post('/funding/projects', data);
    return response.data.data;
  }

  // 펀딩 프로젝트 수정
  async updateProject(id: number, data: Partial<CreateFundingProjectRequest>): Promise<FundingProject> {
    const response = await api.put(`/funding/projects/${id}`, data);
    return response.data.data;
  }

  // 펀딩 프로젝트 삭제
  async deleteProject(id: number): Promise<void> {
    await api.delete(`/funding/projects/${id}`);
  }

  // 프로젝트 후원
  async backProject(data: BackProjectRequest): Promise<{ paymentId: number; message: string }> {
    const response = await api.post(`/funding/projects/${data.projectId}/back`, data);
    return response.data.data;
  }

  // 프로젝트 좋아요
  async likeProject(projectId: number): Promise<{ liked: boolean; likesCount: number }> {
    const response = await api.post(`/funding/projects/${projectId}/like`);
    return response.data.data;
  }

  // 프로젝트 북마크
  async bookmarkProject(projectId: number): Promise<{ bookmarked: boolean }> {
    const response = await api.post(`/funding/projects/${projectId}/bookmark`);
    return response.data.data;
  }

  // 사용자 후원 내역 조회
  async getUserBackings(userId: string): Promise<FundingProject[]> {
    const response = await api.get(`/funding/users/${userId}/backings`);
    return response.data.data;
  }

  // 아티스트 프로젝트 목록 조회
  async getArtistProjects(artistId: string): Promise<FundingProject[]> {
    const response = await api.get(`/funding/artists/${artistId}/projects`);
    return response.data.data;
  }

  // 프로젝트 승인 (관리자)
  async approveProject(projectId: number): Promise<void> {
    await api.post(`/funding/projects/${projectId}/approve`);
  }

  // 프로젝트 거부 (관리자)
  async rejectProject(projectId: number, reason: string): Promise<void> {
    await api.post(`/funding/projects/${projectId}/reject`, { reason });
  }
}

export const fundingService = new FundingService();
