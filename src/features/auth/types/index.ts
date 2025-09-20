import { User, UserRole } from '../../../shared/types';

// 인증 관련 타입
export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    displayName: string;
    role: UserRole;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string | null;
    token?: string | null;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string | null;
    token?: string | null;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordReset {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

// 권한 스코프
export enum PermissionScope {
    // 사용자 관리
    USER_READ = 'user:read',
    USER_WRITE = 'user:write',
    USER_DELETE = 'user:delete',

    // 아티스트 관리
    ARTIST_READ = 'artist:read',
    ARTIST_WRITE = 'artist:write',
    ARTIST_DELETE = 'artist:delete',

    // 펀딩 관리
    FUNDING_READ = 'funding:read',
    FUNDING_WRITE = 'funding:write',
    FUNDING_EXECUTE = 'funding:execute',

    // 커뮤니티 관리
    COMMUNITY_READ = 'community:read',
    COMMUNITY_WRITE = 'community:write',
    COMMUNITY_MODERATE = 'community:moderate',

    // 이벤트 관리
    EVENT_READ = 'event:read',
    EVENT_WRITE = 'event:write',
    EVENT_DELETE = 'event:delete',

    // 관리자 권한
    ADMIN_READ = 'admin:read',
    ADMIN_WRITE = 'admin:write',
    ADMIN_DELETE = 'admin:delete',

    // 결제/환불
    PAYMENT_READ = 'payment:read',
    PAYMENT_WRITE = 'payment:write',
    PAYOUT_EXECUTE = 'payout:execute',
}

// 역할별 권한 매핑
export const ROLE_PERMISSIONS: Record<UserRole, PermissionScope[]> = {
    [UserRole.ADMIN]: Object.values(PermissionScope),
    [UserRole.ARTIST]: [
        PermissionScope.USER_READ,
        PermissionScope.USER_WRITE,
        PermissionScope.ARTIST_READ,
        PermissionScope.ARTIST_WRITE,
        PermissionScope.FUNDING_READ,
        PermissionScope.FUNDING_WRITE,
        PermissionScope.COMMUNITY_READ,
        PermissionScope.COMMUNITY_WRITE,
        PermissionScope.EVENT_READ,
        PermissionScope.EVENT_WRITE,
        PermissionScope.PAYMENT_READ,
    ],
    [UserRole.FAN]: [
        PermissionScope.USER_READ,
        PermissionScope.USER_WRITE,
        PermissionScope.ARTIST_READ,
        PermissionScope.FUNDING_READ,
        PermissionScope.COMMUNITY_READ,
        PermissionScope.COMMUNITY_WRITE,
        PermissionScope.EVENT_READ,
        PermissionScope.PAYMENT_READ,
        PermissionScope.PAYMENT_WRITE,
    ],
};
