import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Input } from '@/shared/ui/shadcn/input';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Button } from '@/shared/ui/Button';
import { getFirstChar } from '@/utils/typeGuards';
import type { UserProfile } from '../types/profile';

export interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
    avatar: profile.avatar || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      username: profile.username,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
    });
  }, [profile.avatar, profile.bio, profile.username]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '자기소개는 500자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    await Promise.resolve(onSave(formData));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    setFormData({
      username: profile.username,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>프로필 이미지</label>
        <div className='flex items-center gap-4'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>{getFirstChar(profile.username)}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              value={formData.avatar}
              onChange={event =>
                setFormData(prev => ({ ...prev, avatar: event.target.value }))
              }
              placeholder='이미지 URL을 입력하세요'
            />
            <p className='mt-1 text-sm text-gray-500'>
              프로필 이미지 URL을 입력하세요
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>사용자명 *</label>
        <Input
          value={formData.username}
          onChange={event =>
            setFormData(prev => ({ ...prev, username: event.target.value }))
          }
          className={errors.username ? 'border-red-500' : ''}
        />
        {errors.username && (
          <p className='mt-1 text-sm text-red-500'>{errors.username}</p>
        )}
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>자기소개</label>
        <Textarea
          value={formData.bio}
          onChange={event =>
            setFormData(prev => ({ ...prev, bio: event.target.value }))
          }
          placeholder='자기소개를 입력하세요'
          rows={4}
          maxLength={500}
          className={errors.bio ? 'border-red-500' : ''}
        />
        <div className='mt-1 flex items-center justify-between'>
          {errors.bio && <p className='text-sm text-red-500'>{errors.bio}</p>}
          <span className='text-sm text-gray-500'>
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      <div className='flex gap-2 pt-4'>
        <Button type='submit' className='flex-1' disabled={isSubmitting}>
          저장
        </Button>
        <Button
          type='button'
          variant='outline'
          className='flex-1'
          onClick={handleCancel}
        >
          취소
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
