import { apiCall } from './base';
import type { RealTimeAlert } from '@/types/admin';

// Admin Dashboard APIs
export const adminAPI = {
  getAlerts: () => apiCall<RealTimeAlert[]>('/admin/alerts'),
  dismissAlert: (alertId: string) =>
    apiCall<void>(`/admin/alerts/${encodeURIComponent(alertId)}/dismiss`, {
      method: 'POST',
    }),
  getInquiries: () => apiCall('/admin/inquiries'),
  getMatchingRequests: () => apiCall('/admin/matching-requests'),
  getFinancialData: () => apiCall('/admin/financial-data'),
  getReportedContent: () => apiCall('/admin/reported-content'),
  updateInquiryStatus: (id: number, status: string) =>
    apiCall(`/admin/inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  assignInquiry: (id: number, assignedTo: string) =>
    apiCall(`/admin/inquiries/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo }),
    }),
  handleUserAction: (userId: string, action: string, reason?: string) =>
    apiCall(`/admin/users/${userId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
};

// Admin User Management APIs
export const adminUserAPI = {
  // 모든 사용자 목록 조회
  getAllUsers: (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  // 사용자 상태 변경
  updateUserStatus: (userId: string, status: string) =>
    apiCall(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // 사용자 권한 변경
  updateUserRole: (userId: string, role: string) =>
    apiCall(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  // 사용자 계정 정지/해제
  suspendUser: (userId: string, reason?: string) =>
    apiCall(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 사용자 계정 복구
  restoreUser: (userId: string) =>
    apiCall(`/admin/users/${userId}/restore`, {
      method: 'POST',
    }),

  // 사용자 계정 영구 차단
  banUser: (userId: string, reason: string) =>
    apiCall(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Admin Project Management APIs
export const adminProjectAPI = {
  // 모든 프로젝트 목록 조회
  getAllProjects: (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall(`/admin/projects${queryString ? `?${queryString}` : ''}`);
  },

  // 프로젝트 승인/거절
  updateProjectStatus: (
    projectId: string,
    status: 'approved' | 'rejected',
    reason?: string,
  ) =>
    apiCall(`/admin/projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  // 프로젝트 조치 실행
  executeProjectAction: (projectId: string, action: string, data?: any) =>
    apiCall(`/admin/projects/${projectId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    }),
};
