import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthState, LoginCredentials, SignupData, PasswordResetRequest, PasswordReset } from '../types';
import { User } from '../../../shared/types';

// 쿼리 키
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
    permissions: () => [...authKeys.all, 'permissions'] as const,
};

/**
 * 인증 상태 관리 훅
 */
export function useAuth() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // 현재 사용자 정보 조회
    const {
        data: user,
        isLoading: isLoadingUser,
        error: userError,
    } = useQuery({
        queryKey: authKeys.user(),
        queryFn: authService.getCurrentUser,
        enabled: authService.isTokenValid(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5분
    });

    // 로그인 뮤테이션
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
        onError: (error) => {
            console.error('로그인 실패:', error);
        },
    });

    // 회원가입 뮤테이션
    const signupMutation = useMutation({
        mutationFn: authService.signup,
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data.user);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
        onError: (error) => {
            console.error('회원가입 실패:', error);
        },
    });

    // 로그아웃 뮤테이션
    const logoutMutation = useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.clear();
            navigate('/');
        },
        onError: (error) => {
            console.error('로그아웃 실패:', error);
            // 에러가 발생해도 로컬 상태는 정리
            queryClient.clear();
            navigate('/');
        },
    });

    // 토큰 갱신 뮤테이션
    const refreshTokenMutation = useMutation({
        mutationFn: authService.refreshToken,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
        onError: () => {
            // 토큰 갱신 실패 시 로그아웃
            queryClient.clear();
            navigate('/login');
        },
    });

    // 프로필 업데이트 뮤테이션
    const updateProfileMutation = useMutation({
        mutationFn: authService.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(authKeys.user(), updatedUser);
        },
        onError: (error) => {
            console.error('프로필 업데이트 실패:', error);
        },
    });

    // 비밀번호 변경 뮤테이션
    const changePasswordMutation = useMutation({
        mutationFn: authService.changePassword,
        onError: (error) => {
            console.error('비밀번호 변경 실패:', error);
        },
    });

    // 비밀번호 재설정 요청 뮤테이션
    const requestPasswordResetMutation = useMutation({
        mutationFn: authService.requestPasswordReset,
        onError: (error) => {
            console.error('비밀번호 재설정 요청 실패:', error);
        },
    });

    // 비밀번호 재설정 뮤테이션
    const resetPasswordMutation = useMutation({
        mutationFn: authService.resetPassword,
        onError: (error) => {
            console.error('비밀번호 재설정 실패:', error);
        },
    });

    // 인증 상태 계산
    const authState: AuthState = {
        user: user || null,
        token: authService.getAccessToken(),
        refreshToken: authService.getRefreshToken(),
        isAuthenticated: !!user && authService.isTokenValid(),
        isLoading: isLoadingUser,
    };

    return {
        // 상태
        ...authState,

        // 뮤테이션
        login: loginMutation.mutateAsync,
        signup: signupMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        refreshToken: refreshTokenMutation.mutateAsync,
        updateProfile: updateProfileMutation.mutateAsync,
        changePassword: changePasswordMutation.mutateAsync,
        requestPasswordReset: requestPasswordResetMutation.mutateAsync,
        resetPassword: resetPasswordMutation.mutateAsync,

        // 뮤테이션 상태
        isLoggingIn: loginMutation.isPending,
        isSigningUp: signupMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isRefreshingToken: refreshTokenMutation.isPending,
        isUpdatingProfile: updateProfileMutation.isPending,
        isChangingPassword: changePasswordMutation.isPending,
        isRequestingPasswordReset: requestPasswordResetMutation.isPending,
        isResettingPassword: resetPasswordMutation.isPending,

        // 에러
        loginError: loginMutation.error,
        signupError: signupMutation.error,
        logoutError: logoutMutation.error,
        refreshTokenError: refreshTokenMutation.error,
        updateProfileError: updateProfileMutation.error,
        changePasswordError: changePasswordMutation.error,
        requestPasswordResetError: requestPasswordResetMutation.error,
        resetPasswordError: resetPasswordMutation.error,
        userError,
    };
}

/**
 * 권한 확인 훅
 */
export function usePermissions() {
    const { user } = useAuth();

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;

        // 관리자는 모든 권한을 가짐
        if (user.role === 'admin') return true;

        // TODO: 실제 권한 체크 로직 구현
        // 현재는 역할 기반으로만 체크
        return true;
    };

    const hasRole = (role: string): boolean => {
        return user?.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return user ? roles.includes(user.role) : false;
    };

    return {
        hasPermission,
        hasRole,
        hasAnyRole,
        userRole: user?.role,
    };
}
