import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services/authService';

export const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // 리다이렉트 메시지 가져오기
  const redirectMessage = location.state?.message;
  const redirectTo = location.state?.from || '/';

  return (
    <LoginPage
      error={error}
      isLoading={isLoading}
      redirectMessage={redirectMessage}
      onBack={() => navigate(-1)}
      onLogin={async ({ email, password, remember }) => {
        try {
          setIsLoading(true);
          setError(undefined);

          const auth = await authService.login({ email, password });

          login(auth.accessToken, auth.user);

          if (remember) {
            localStorage.setItem('rememberEmail', email);
          } else {
            localStorage.removeItem('rememberEmail');
          }

          navigate(redirectTo);
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
        console.info(`소셜 로그인 시도: ${provider}`);
      }}
    />
  );
};
