import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { ApiResponse } from '@/shared/types';
import { AuthResponse } from '@/features/auth/types';

export const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoginPage
      error={error}
      isLoading={isLoading}
      onLogin={async ({ email, password, remember }) => {
        try {
          setIsLoading(true);
          setError(undefined);

          const response = (await authAPI.login({
            email,
            password,
          })) as ApiResponse<AuthResponse>;

          if (response.success && response.data) {
            // 토큰을 localStorage에 저장
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            login(response.data.accessToken, response.data.user);

            if (remember) {
              localStorage.setItem('rememberEmail', email);
            } else {
              localStorage.removeItem('rememberEmail');
            }

            navigate('/');
          } else {
            throw new Error(response.error || '로그인에 실패했습니다');
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : '로그인 중 오류가 발생했습니다.',
          );
        } finally {
          setIsLoading(false);
        }
      }}
      onSignupClick={() => navigate('/signup')}
      onForgotPassword={() => navigate('/account/password-reset')}
      onSocialLogin={provider => {
        // TODO: 소셜 로그인 구현
        console.warn(`소셜 로그인 시도: ${provider}`);
      }}
    />
  );
};
