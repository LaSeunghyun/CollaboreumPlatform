import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SignupPage from '@/components/SignupPage';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services/authService';
import { UserRole } from '@/shared/types';

export const SignupRoute: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SignupPage
      error={error}
      isLoading={isLoading}
      onBack={() => navigate(-1)}
      onSignup={async data => {
        try {
          setError(undefined);
          setIsLoading(true);

          const auth = await authService.signup({
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            username: data.name,
            displayName: data.name,
            role: data.role === 'artist' ? UserRole.ARTIST : UserRole.FAN,
          });

          login(auth.accessToken, auth.user);
          navigate('/');
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : '회원가입 중 오류가 발생했습니다.',
          );
        } finally {
          setIsLoading(false);
        }
      }}
      onLoginClick={() => navigate('/login')}
      onSocialSignup={provider => {
        console.info(`소셜 회원가입 시도: ${provider}`);
      }}
    />
  );
};
