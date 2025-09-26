import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '@/shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback: _fallback,
  requireAuth = true,
  requiredRole,
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const { isAuthenticated, user } = useAuth();

  // 인증이 필요하지 않은 경우
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='mx-auto max-w-md p-8 text-center'>
          <div className='mb-6'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <svg
                className='h-8 w-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>
              로그인이 필요합니다
            </h2>
            <p className='text-gray-600'>
              이 페이지에 접근하려면 로그인이 필요합니다.
            </p>
          </div>

          <div className='space-y-3'>
            <button
              onClick={
                onNavigateToLogin || (() => (window.location.href = '/#login'))
              }
              className='w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700'
            >
              로그인하기
            </button>
            <button
              onClick={
                onNavigateToSignup ||
                (() => (window.location.href = '/#signup'))
              }
              className='w-full rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300'
            >
              회원가입하기
            </button>
          </div>

          <div className='mt-6 border-t border-gray-200 pt-6'>
            <button
              onClick={() => window.history.back()}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              ← 이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 특정 역할이 필요한 경우
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='mx-auto max-w-md p-8 text-center'>
          <div className='mb-6'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
              <svg
                className='h-8 w-8 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='mb-2 text-2xl font-bold text-gray-900'>
              접근 권한이 없습니다
            </h2>
            <p className='text-gray-600'>
              이 페이지에 접근하려면{' '}
              <strong>{getRoleDisplayName(requiredRole)}</strong> 권한이
              필요합니다.
            </p>
          </div>

          <div className='space-y-3'>
            <button
              onClick={() => (window.location.href = '/')}
              className='w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700'
            >
              홈으로 돌아가기
            </button>
          </div>

          <div className='mt-6 border-t border-gray-200 pt-6'>
            <button
              onClick={() => window.history.back()}
              className='text-sm text-gray-500 hover:text-gray-700'
            >
              ← 이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 모든 조건을 만족한 경우
  return <>{children}</>;
};

// 역할 표시명 변환 함수
const getRoleDisplayName = (role: UserRole): string => {
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
