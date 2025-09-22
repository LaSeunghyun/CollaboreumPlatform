import type { RealTimeAlert } from '@/types/admin';

import { apiCall } from './base';

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

export const adminUserAPI = {
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

  updateUserStatus: (userId: string, status: string) =>
    apiCall(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  updateUserRole: (userId: string, role: string) =>
    apiCall(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  suspendUser: (userId: string, reason?: string) =>
    apiCall(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  restoreUser: (userId: string) =>
    apiCall(`/admin/users/${userId}/restore`, {
      method: 'POST',
    }),

  banUser: (userId: string, reason: string) =>
    apiCall(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

export const adminProjectAPI = {
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

  updateProjectStatus: (
    projectId: string,
    status: 'approved' | 'rejected',
    reason?: string,
  ) =>
    apiCall(`/admin/projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  executeProjectAction: (projectId: string, action: string, data?: any) =>
    apiCall(`/admin/projects/${projectId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    }),
};
