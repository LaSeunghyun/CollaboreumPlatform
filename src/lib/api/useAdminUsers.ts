import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserAPI } from '../../services/api/admin';
import type { ApiResponse, UserRole } from '@/shared/types';

type AdminUserRole = UserRole;
type AdminUserStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  lastLoginAt: string;
  avatar?: string;
}

interface AdminUsersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type AdminUsersData = {
  users: AdminUser[];
  pagination: AdminUsersPagination;
};

export type AdminUsersResponse = ApiResponse<AdminUsersData>;

export interface UserFilters {
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  page?: number;
  limit?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAdminUser = (value: unknown): value is AdminUser => {
  if (!isRecord(value)) {
    return false;
  }

  const { id, username, email, role, status, createdAt, lastLoginAt } = value;

  return (
    typeof id === 'string' &&
    typeof username === 'string' &&
    typeof email === 'string' &&
    typeof role === 'string' &&
    typeof status === 'string' &&
    typeof createdAt === 'string' &&
    typeof lastLoginAt === 'string'
  );
};

const toPagination = (value: unknown): AdminUsersPagination => {
  if (!isRecord(value)) {
    return {
      page: 1,
      limit: 0,
      total: 0,
      pages: 0,
    };
  }

  const page = Number(value.page ?? 1);
  const limit = Number(value.limit ?? 0);
  const total = Number(value.total ?? 0);
  const pages = Number(value.pages ?? value.totalPages ?? 0);

  return {
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 0,
    total: Number.isFinite(total) ? total : 0,
    pages: Number.isFinite(pages) ? pages : 0,
  };
};

const normalizeAdminUsersResponse = (raw: unknown): AdminUsersResponse => {
  if (!isRecord(raw)) {
    throw new Error('Unexpected admin users response format');
  }

  if ('success' in raw && raw.success === false) {
    return {
      success: false,
      error:
        typeof raw.error === 'string'
          ? raw.error
          : 'Failed to load admin users',
      message: typeof raw.message === 'string' ? raw.message : undefined,
      data: {
        users: [],
        pagination: toPagination(undefined),
      },
    };
  }

  const container = isRecord(raw.data) ? raw.data : raw;
  const users = Array.isArray(container.users)
    ? container.users.filter(isAdminUser)
    : [];

  return {
    success: true,
    data: {
      users,
      pagination: toPagination(container.pagination),
    },
    message: typeof raw.message === 'string' ? raw.message : undefined,
  };
};

const fetchAdminUsers = async (
  filters: UserFilters,
): Promise<AdminUsersResponse> => {
  const response = await adminUserAPI.getAllUsers(filters);
  return normalizeAdminUsersResponse(response);
};

const fetchSingleAdminUser = async (
  userId: string,
): Promise<ApiResponse<AdminUser | null>> => {
  const response = await fetchAdminUsers({ search: userId, limit: 1 });
  const matched =
    response.data?.users.find(
      user =>
        user.id === userId || user.email === userId || user.username === userId,
    ) ?? null;

  return {
    success: response.success,
    data: matched,
    message: response.message,
    error: response.error,
  };
};

// 관리자 사용자 목록 조회
export const useAdminUsers = (filters: UserFilters = {}) => {
  return useQuery<AdminUsersResponse>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 3,
  });
};

// 사용자 상세 조회
export const useAdminUser = (userId: string) => {
  return useQuery<ApiResponse<AdminUser | null>>({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchSingleAdminUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// 사용자 상태 변경
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      return await adminUserAPI.updateUserStatus(userId, status);
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
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AdminUserRole;
    }) => {
      return await adminUserAPI.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// 사용자 삭제 (영구 차단으로 대체)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await adminUserAPI.banUser(userId, '관리자에 의한 계정 삭제');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};
