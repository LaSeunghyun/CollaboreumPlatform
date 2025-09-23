import { Settings, User as UserIcon } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { ErrorMessage, Skeleton } from '@/shared/ui';

import { FanProfile } from '../hooks/useFanProfile';

interface FanProfileHeaderProps {
  profile: FanProfile | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onEditProfile?: () => void;
}

export const FanProfileHeader = ({
  profile,
  isLoading,
  error,
  onRetry,
  onEditProfile,
}: FanProfileHeaderProps) => {
  return (
    <Card className='mb-6'>
      <CardContent className='p-6'>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-10 w-1/3' />
            <Skeleton className='h-6 w-1/2' />
            <Skeleton className='h-16 w-full' />
          </div>
        ) : error ? (
          <ErrorMessage error={error as Error} onRetry={onRetry} />
        ) : profile ? (
          <div className='flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0'>
            <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary-100'>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className='h-24 w-24 rounded-full object-cover'
                />
              ) : (
                <UserIcon className='h-12 w-12 text-primary-600' />
              )}
            </div>

            <div className='flex-1'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    {profile.name}
                  </h1>
                  <p className='text-gray-600'>{profile.email}</p>
                  <p className='mt-2 text-gray-700'>
                    {profile.bio || '소개 정보가 없습니다.'}
                  </p>
                </div>
                <div className='mt-4 md:mt-0'>
                  <Button
                    onClick={onEditProfile}
                    variant='outline'
                    className='flex items-center space-x-2'
                  >
                    <Settings className='h-4 w-4' />
                    <span>프로필 편집</span>
                  </Button>
                </div>
              </div>

              <div className='mt-4 flex space-x-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {profile.following.toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-600'>팔로잉</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {profile.totalPledges.toLocaleString()}
                  </div>
                  <div className='text-sm text-gray-600'>후원 횟수</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {profile.formattedTotalAmount}
                  </div>
                  <div className='text-sm text-gray-600'>총 후원액</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className='text-gray-500'>프로필 정보를 불러올 수 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
};
