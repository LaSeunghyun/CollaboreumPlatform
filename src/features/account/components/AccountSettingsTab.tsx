import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import { Button } from '@/shared/ui/Button';
import { UserProfile } from '../types';

interface AccountSettingsTabProps {
  userProfile: UserProfile;
}

export const AccountSettingsTab: React.FC<AccountSettingsTabProps> = ({
  userProfile,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>계정 설정</CardTitle>
    </CardHeader>
    <CardContent className='space-y-4'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>이메일</label>
        <Input defaultValue={userProfile.email || 'user@example.com'} />
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>알림 설정</label>
        <div className='space-y-2'>
          <label className='flex items-center space-x-2'>
            <input type='checkbox' defaultChecked />
            <span className='text-sm'>프로젝트 업데이트 알림</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input type='checkbox' defaultChecked />
            <span className='text-sm'>커뮤니티 댓글 알림</span>
          </label>
        </div>
      </div>
      <Button variant='indigo'>설정 저장</Button>
    </CardContent>
  </Card>
);
