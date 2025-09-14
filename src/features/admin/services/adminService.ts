import { apiCall } from '../../../services/api';
import {
    AdminDashboardMetrics,
    User,
    FundingProject,
    Artwork,
    Report,
    FinancialData,
    AdminNotification,
    SystemMetrics,
    UsersResponse,
    ArtworksResponse,
    ReportsResponse
} from '../types';

export const adminService = {
    // 대시보드 메트릭 조회
    getDashboardMetrics: (): Promise<AdminDashboardMetrics> =>
        apiCall('/admin/dashboard/metrics'),

    // 사용자 관리
    getUsers: (params?: {
        role?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<UsersResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/users${queryString ? `?${queryString}` : ''}`) as Promise<UsersResponse>;
    },

    updateUserStatus: (userId: string, status: string, reason?: string) =>
        apiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason })
        }),

    updateUserRole: (userId: string, role: string) =>
        apiCall(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        }),

    suspendUser: (userId: string, reason: string) =>
        apiCall(`/admin/users/${userId}/suspend`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        }),

    restoreUser: (userId: string) =>
        apiCall(`/admin/users/${userId}/restore`, {
            method: 'POST'
        }),

    // 펀딩 관리
    getFundingProjects: (params?: {
        status?: string;
        approvalStatus?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.approvalStatus) queryParams.append('approval_status', params.approvalStatus);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/funding/projects${queryString ? `?${queryString}` : ''}`);
    },

    updateProjectApproval: (projectId: string, approvalStatus: boolean, feedback?: string) =>
        apiCall(`/admin/funding/projects/${projectId}/approval`, {
            method: 'PATCH',
            body: JSON.stringify({ approvalStatus, feedback })
        }),

    // 작품 관리
    getArtworks: (params?: {
        status?: string;
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<ArtworksResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/artworks${queryString ? `?${queryString}` : ''}`) as Promise<ArtworksResponse>;
    },

    updateArtworkStatus: (artworkId: string, status: string, reason?: string) =>
        apiCall(`/admin/artworks/${artworkId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, reason })
        }),

    // 신고 관리
    getReports: (params?: {
        status?: string;
        type?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }): Promise<ReportsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/reports${queryString ? `?${queryString}` : ''}`) as Promise<ReportsResponse>;
    },

    resolveReport: (reportId: string, resolution: string, actionTaken?: string, notes?: string) =>
        apiCall(`/admin/reports/${reportId}/resolve`, {
            method: 'PATCH',
            body: JSON.stringify({ resolution, actionTaken, notes })
        }),

    // 재정 관리
    getFinancialData: (): Promise<FinancialData[]> =>
        apiCall('/admin/financial-data'),

    // 알림 관리
    getNotifications: (): Promise<AdminNotification[]> =>
        apiCall('/admin/notifications'),

    markNotificationAsRead: (notificationId: string) =>
        apiCall(`/admin/notifications/${notificationId}/read`, {
            method: 'PATCH'
        }),

    // 시스템 모니터링
    getSystemMetrics: (): Promise<SystemMetrics> =>
        apiCall('/admin/system/metrics'),

    // 통계 데이터
    getUserGrowthData: (period: string = 'monthly', months: number = 8) =>
        apiCall(`/admin/analytics/user-growth?period=${period}&months=${months}`),

    getFundingPerformanceData: (period: string = 'monthly', months: number = 8) =>
        apiCall(`/admin/analytics/funding-performance?period=${period}&months=${months}`),

};
