import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Checkbox } from '@/shared/ui/Checkbox';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
  onLogin?: (credentials: {
    email: string;
    password: string;
    remember: boolean;
  }) => void;
  onSignupClick?: () => void;
  onForgotPassword?: () => void;
  onSocialLogin?: (provider: 'google' | 'kakao' | 'naver') => void;
  isLoading?: boolean;
  error?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  onLogin,
  onSignupClick,
  onForgotPassword,
  onSocialLogin,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(formData);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        {/* 헤더 */}
        <div className='text-center'>
          {onBack && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='absolute left-4 top-4'
            >
              <ArrowLeft className='mr-1 h-4 w-4' />
              뒤로
            </Button>
          )}
          <h1 className='text-3xl font-bold text-gray-900'>로그인</h1>
          <p className='mt-2 text-sm text-gray-600'>
            계정이 없으신가요?{' '}
            <button
              onClick={onSignupClick}
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              회원가입
            </button>
          </p>
        </div>

        <Card>
          <CardContent className='p-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* 에러 메시지 */}
              {error && (
                <div className='rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700'>
                  {error}
                </div>
              )}

              {/* 이메일 */}
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  이메일
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder='이메일을 입력하세요'
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  비밀번호
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder='비밀번호를 입력하세요'
                    className='pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* 로그인 옵션 */}
              <div className='flex items-center justify-between'>
                <label className='flex items-center space-x-2'>
                  <Checkbox
                    checked={formData.remember}
                    onCheckedChange={checked =>
                      handleInputChange('remember', checked as boolean)
                    }
                  />
                  <span className='text-sm text-gray-700'>
                    로그인 상태 유지
                  </span>
                </label>
                <button
                  type='button'
                  onClick={onForgotPassword}
                  className='text-sm text-primary-600 hover:text-primary-500'
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* 로그인 버튼 */}
              <Button
                type='submit'
                className='w-full'
                disabled={!isFormValid || isLoading}
                loading={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            {/* 소셜 로그인 */}
            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='bg-white px-2 text-gray-500'>또는</span>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-3 gap-3'>
                <Button
                  variant='outline'
                  onClick={() => onSocialLogin?.('google')}
                  className='flex items-center justify-center'
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                </Button>
                <Button
                  variant='outline'
                  onClick={() => onSocialLogin?.('kakao')}
                  className='flex items-center justify-center'
                >
                  <span className='font-bold text-yellow-600'>K</span>
                </Button>
                <Button
                  variant='outline'
                  onClick={() => onSocialLogin?.('naver')}
                  className='flex items-center justify-center'
                >
                  <span className='font-bold text-green-600'>N</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
