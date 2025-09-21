import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 인증이 필요한 액션을 처리하는 훅
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트하고,
 * 로그인 후 원래 페이지로 돌아올 수 있도록 함
 */
export const useAuthRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 인증이 필요한 액션을 실행하기 전에 호출
   * @param action - 인증된 사용자일 때 실행할 함수
   * @param redirectTo - 로그인 후 리다이렉트할 경로 (기본값: 현재 경로)
   * @param requireRole - 특정 역할이 필요한 경우
   */
  const requireAuth = (
    action: () => void,
    redirectTo?: string,
    requireRole?: 'artist' | 'admin' | 'fan',
  ) => {
    // 인증되지 않은 경우
    if (!isAuthenticated) {
      const currentPath = redirectTo || location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // 특정 역할이 필요한 경우
    if (requireRole && user?.role !== requireRole) {
      alert(`${getRoleDisplayName(requireRole)} 권한이 필요합니다.`);
      return;
    }

    // 모든 조건을 만족한 경우 액션 실행
    action();
  };

  /**
   * 인증이 필요한 액션을 비동기로 실행
   * @param action - 인증된 사용자일 때 실행할 비동기 함수
   * @param redirectTo - 로그인 후 리다이렉트할 경로 (기본값: 현재 경로)
   * @param requireRole - 특정 역할이 필요한 경우
   */
  const requireAuthAsync = async (
    action: () => Promise<void>,
    redirectTo?: string,
    requireRole?: 'artist' | 'admin' | 'fan',
  ) => {
    // 인증되지 않은 경우
    if (!isAuthenticated) {
      const currentPath = redirectTo || location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // 특정 역할이 필요한 경우
    if (requireRole && user?.role !== requireRole) {
      alert(`${getRoleDisplayName(requireRole)} 권한이 필요합니다.`);
      return;
    }

    // 모든 조건을 만족한 경우 액션 실행
    await action();
  };

  /**
   * 인증 상태를 확인하고 boolean 반환
   * @param requireRole - 특정 역할이 필요한 경우
   */
  const checkAuth = (requireRole?: 'artist' | 'admin' | 'fan'): boolean => {
    if (!isAuthenticated) {
      return false;
    }

    if (requireRole && user?.role !== requireRole) {
      return false;
    }

    return true;
  };

  /**
   * 인증이 필요한 액션을 실행하되, 실패 시 로그인 페이지로 리다이렉트
   * @param action - 실행할 함수
   * @param fallback - 인증 실패 시 실행할 함수 (선택사항)
   */
  const executeWithAuth = (action: () => void, fallback?: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      if (fallback) {
        fallback();
      } else {
        const currentPath = location.pathname + location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  };

  return {
    requireAuth,
    requireAuthAsync,
    checkAuth,
    executeWithAuth,
    isAuthenticated,
    user,
  };
};

// 역할 표시명 변환 함수
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'artist':
      return '아티스트';
    case 'admin':
      return '관리자';
    case 'fan':
      return '팬';
    default:
      return role;
  }
};
