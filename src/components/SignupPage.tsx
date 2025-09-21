import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Checkbox } from '@/shared/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

interface SignupPageProps {
  onBack?: () => void;
  onSignup?: (data: SignupData) => void;
  onSocialSignup?: (provider: 'google' | 'kakao' | 'naver') => void;
  onLoginClick?: () => void;
  isLoading?: boolean;
  error?: string;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: 'artist' | 'fan';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({
  onBack,
  onSignup,
  onSocialSignup,
  onLoginClick,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'fan',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (
    field: keyof SignupData,
    value: string | boolean,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSignup) {
      onSignup(formData);
    }
  };

  const isFormValid =
    formData.email.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.agreeTerms &&
    formData.agreePrivacy &&
    formData.password === formData.confirmPassword;

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthText =
    ['매우 약함', '약함', '보통', '강함', '매우 강함'][strength] || '';
  const strengthColor =
    [
      'text-red-500',
      'text-orange-500',
      'text-yellow-500',
      'text-blue-500',
      'text-green-500',
    ][strength] || 'text-gray-500';

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
          <h1 className='text-3xl font-bold text-gray-900'>회원가입</h1>
          <p className='mt-2 text-sm text-gray-600'>
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onLoginClick}
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              로그인
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

              {/* 이름 */}
              <div className='space-y-2'>
                <label
                  htmlFor='name'
                  className='text-sm font-medium text-gray-700'
                >
                  이름 *
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='name'
                    type='text'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder='이름을 입력하세요'
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  이메일 *
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

              {/* 전화번호 */}
              <div className='space-y-2'>
                <label
                  htmlFor='phone'
                  className='text-sm font-medium text-gray-700'
                >
                  전화번호 *
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder='010-1234-5678'
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              {/* 역할 선택 */}
              <div className='space-y-2'>
                <label
                  htmlFor='role'
                  className='text-sm font-medium text-gray-700'
                >
                  회원 유형 *
                </label>
                <Select
                  value={formData.role}
                  onValueChange={value =>
                    handleInputChange('role', value as 'artist' | 'fan')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='회원 유형을 선택하세요' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='fan'>팬 (후원자)</SelectItem>
                    <SelectItem value='artist'>아티스트 (창작자)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 비밀번호 */}
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  비밀번호 *
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
                {formData.password && (
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <div className='h-2 flex-1 rounded-full bg-gray-200'>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            strength <= 2
                              ? 'bg-red-500'
                              : strength === 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${(strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${strengthColor}`}>
                        {strengthText}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      8자 이상, 대소문자, 숫자, 특수문자 포함
                    </p>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className='space-y-2'>
                <label
                  htmlFor='confirmPassword'
                  className='text-sm font-medium text-gray-700'
                >
                  비밀번호 확인 *
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    placeholder='비밀번호를 다시 입력하세요'
                    className='pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className='text-xs text-red-500'>
                      비밀번호가 일치하지 않습니다
                    </p>
                  )}
              </div>

              {/* 약관 동의 */}
              <div className='space-y-3'>
                <div className='flex items-start space-x-2'>
                  <Checkbox
                    checked={formData.agreeTerms}
                    onCheckedChange={checked =>
                      handleInputChange('agreeTerms', checked as boolean)
                    }
                    required
                  />
                  <label className='text-sm text-gray-700'>
                    <span className='text-red-500'>*</span>{' '}
                    <button
                      type='button'
                      className='text-primary-600 underline hover:text-primary-500'
                    >
                      이용약관
                    </button>
                    에 동의합니다
                  </label>
                </div>

                <div className='flex items-start space-x-2'>
                  <Checkbox
                    checked={formData.agreePrivacy}
                    onCheckedChange={checked =>
                      handleInputChange('agreePrivacy', checked as boolean)
                    }
                    required
                  />
                  <label className='text-sm text-gray-700'>
                    <span className='text-red-500'>*</span>{' '}
                    <button
                      type='button'
                      className='text-primary-600 underline hover:text-primary-500'
                    >
                      개인정보처리방침
                    </button>
                    에 동의합니다
                  </label>
                </div>

                <div className='flex items-start space-x-2'>
                  <Checkbox
                    checked={formData.agreeMarketing}
                    onCheckedChange={checked =>
                      handleInputChange('agreeMarketing', checked as boolean)
                    }
                  />
                  <label className='text-sm text-gray-700'>
                    마케팅 정보 수신에 동의합니다 (선택)
                  </label>
                </div>
              </div>

              {/* 회원가입 버튼 */}
              <Button
                type='submit'
                className='w-full'
                disabled={!isFormValid || isLoading}
                loading={isLoading}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </form>

            {/* 소셜 회원가입 */}
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
                  onClick={() => onSocialSignup?.('google')}
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
                  onClick={() => onSocialSignup?.('kakao')}
                  className='flex items-center justify-center'
                >
                  <span className='font-bold text-yellow-600'>K</span>
                </Button>
                <Button
                  variant='outline'
                  onClick={() => onSocialSignup?.('naver')}
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

export default SignupPage;
