import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/shared/ui/Button';
import { ErrorState } from '@/components/organisms/States';
import { Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountProfileCardProps {
  userProfile: UserProfile;
  isLoading: boolean;
  error: unknown;
  onEditProfile: () => void;
}

export const AccountProfileCard: React.FC<AccountProfileCardProps> = ({
  userProfile,
  isLoading,
  error,
  onEditProfile,
}) => {
  return (
    <Card>
      <CardContent className='p-6'>
        {isLoading ? (
          <div className='flex items-center gap-4'>
            <div className='h-16 w-16 animate-pulse rounded-full bg-muted' />
            <div className='space-y-2'>
              <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              <div className='h-3 w-48 animate-pulse rounded bg-muted' />
              <div className='h-3 w-24 animate-pulse rounded bg-muted' />
            </div>
          </div>
        ) : error ? (
          <ErrorState title='프로필 정보를 불러올 수 없습니다' />
        ) : (
          (() => {
            const hasProfile = userProfile.name && userProfile.email;
            if (!hasProfile) {
              return (
                <div className='space-y-4 text-center'>
                  <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                    <Settings className='h-8 w-8 text-muted-foreground' />
                  </div>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold'>
                      프로필을 완성해주세요
                    </h3>
                    <p className='mb-4 text-sm text-muted-foreground'>
                      프로필을 등록하면 더 나은 서비스를 이용할 수 있습니다.
                    </p>
                  </div>
                  <Button variant='indigo' onClick={onEditProfile}>
                    <Settings className='mr-2 h-4 w-4' />
                    프로필 등록하기
                  </Button>
                </div>
              );
            }

            return (
              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>
                    {userProfile.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <h3 className='text-xl font-semibold'>
                    {userProfile.name || '사용자'}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {userProfile.email || 'user@example.com'}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <span>팔로워 {userProfile.followers ?? 0}명</span>
                    <span>팔로잉 {userProfile.following ?? 0}명</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
};
