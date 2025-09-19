import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserAPI } from '../../services/api';

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'artist' | 'fan';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastLoginAt: string;
    avatar?: string;
}

export interface AdminUsersResponse {
    success: boolean;
    data: {
        users: AdminUser[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
    message?: string;
}

export interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
}

// 관리자 사용자 목록 조회
export const useAdminUsers = (filters: UserFilters = {}) => {
    return useQuery<AdminUsersResponse>({
        queryKey: ['admin', 'users', filters],
        queryFn: async () => {
            const response = await adminUserAPI.getUsers(filters);
            return response;
        },
        staleTime: 2 * 60 * 1000, // 2분
        gcTime: 5 * 60 * 1000, // 5분
        retry: 3,
    });
};

// 사용자 상세 조회
export const useAdminUser = (userId: string) => {
    return useQuery<{ success: boolean; data: AdminUser }>({
        queryKey: ['admin', 'users', userId],
        queryFn: async () => {
            const response = await adminUserAPI.getUser(userId);
            return response;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// 사용자 상태 변경
export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
            const response = await adminUserAPI.updateUserStatus(userId, status);
            return response;
        },
        onSuccess: () => {
            // 관련 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

// 사용자 역할 변경
export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const response = await adminUserAPI.updateUserRole(userId, role);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};

// 사용자 삭제
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await adminUserAPI.deleteUser(userId);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};
