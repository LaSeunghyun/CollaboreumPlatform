import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/shared/ui/Button';
import type { PasswordChangeFormValues } from '../types/profile';

export interface PasswordChangeFormProps {
  onSubmit?: (values: PasswordChangeFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<PasswordChangeFormValues>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      await Promise.resolve(onSubmit(formData));
    } else {
      // TODO: Replace alert with integration when password change API is ready
      alert('비밀번호 변경 기능은 준비 중입니다.');
    }

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>현재 비밀번호 *</label>
        <Input
          type='password'
          value={formData.currentPassword}
          onChange={event =>
            setFormData(prev => ({ ...prev, currentPassword: event.target.value }))
          }
          className={errors.currentPassword ? 'border-red-500' : ''}
        />
        {errors.currentPassword && (
          <p className='mt-1 text-sm text-red-500'>{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>새 비밀번호 *</label>
        <Input
          type='password'
          value={formData.newPassword}
          onChange={event =>
            setFormData(prev => ({ ...prev, newPassword: event.target.value }))
          }
          className={errors.newPassword ? 'border-red-500' : ''}
        />
        {errors.newPassword && (
          <p className='mt-1 text-sm text-red-500'>{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>새 비밀번호 확인 *</label>
        <Input
          type='password'
          value={formData.confirmPassword}
          onChange={event =>
            setFormData(prev => ({ ...prev, confirmPassword: event.target.value }))
          }
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className='mt-1 text-sm text-red-500'>{errors.confirmPassword}</p>
        )}
      </div>

      <div className='pt-4'>
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          비밀번호 변경
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;
