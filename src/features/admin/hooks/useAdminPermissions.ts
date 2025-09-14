import { useAuth } from '../../../contexts/AuthContext';
import { AdminPermissions } from '../types';

// 기본 권한 정의
const defaultPermissions: AdminPermissions = {
    userManagement: false,
    artistApproval: false,
    fundingOversight: false,
    financeAccess: false,
    communityModeration: false,
    systemAdmin: false,
};

// 역할별 권한 매핑
const rolePermissions: Record<string, AdminPermissions> = {
    super_admin: {
        userManagement: true,
        artistApproval: true,
        fundingOversight: true,
        financeAccess: true,
        communityModeration: true,
        systemAdmin: true,
    },
    operator: {
        userManagement: true,
        artistApproval: true,
        fundingOversight: true,
        financeAccess: false,
        communityModeration: true,
        systemAdmin: false,
    },
    finance: {
        userManagement: false,
        artistApproval: false,
        fundingOversight: true,
        financeAccess: true,
        communityModeration: false,
        systemAdmin: false,
    },
    community_manager: {
        userManagement: true,
        artistApproval: true,
        fundingOversight: false,
        financeAccess: false,
        communityModeration: true,
        systemAdmin: false,
    },
};

export function useAdminPermissions() {
    const { user } = useAuth();

    // 사용자 역할에 따른 권한 계산
    const permissions = user?.role ? rolePermissions[user.role] || defaultPermissions : defaultPermissions;

    // 권한 체크 헬퍼 함수들
    const canManageUsers = permissions.userManagement;
    const canApproveArtists = permissions.artistApproval;
    const canOverseeFunding = permissions.fundingOversight;
    const canAccessFinance = permissions.financeAccess;
    const canModerateCommunity = permissions.communityModeration;
    const canAccessSystem = permissions.systemAdmin;

    // 특정 기능에 대한 권한 체크
    const hasPermission = (permission: keyof AdminPermissions) => {
        return permissions[permission];
    };

    // 여러 권한 중 하나라도 있으면 true
    const hasAnyPermission = (permissions: (keyof AdminPermissions)[]) => {
        return permissions.some(permission => hasPermission(permission));
    };

    // 모든 권한이 있어야 true
    const hasAllPermissions = (permissions: (keyof AdminPermissions)[]) => {
        return permissions.every(permission => hasPermission(permission));
    };

    return {
        permissions,
        canManageUsers,
        canApproveArtists,
        canOverseeFunding,
        canAccessFinance,
        canModerateCommunity,
        canAccessSystem,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
