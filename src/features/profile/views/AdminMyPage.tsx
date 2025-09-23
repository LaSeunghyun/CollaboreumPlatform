import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Shield, Lock, LogOut, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import { ProfileEditForm } from '../components/ProfileEditForm';
import type { UserProfile } from '../types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api/user';
import { Button } from '@/shared/ui/Button';

export const AdminMyPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: 'admin1',
    username: '관리자',
    email: 'admin@example.com',
    role: 'admin',
    bio: '플랫폼 관리자입니다.',
    createdAt: new Date('2023-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    status: 'active',
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile(prev => ({
      ...prev,
      id: user.id,
      username: user.name || prev.username,
      email: user.email || prev.email,
      avatar: user.avatar ?? prev.avatar,
      bio: user.bio ?? prev.bio,
      role: user.role,
      createdAt: user.createdAt ? new Date(user.createdAt) : prev.createdAt,
      lastLoginAt: new Date(),
    }));
  }, [user]);

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));

    try {
      const targetId = user?.id || profile.id;
      const response = (await userAPI.updateProfile(targetId, data)) as any;

      if (response.success) {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>관리자 마이페이지</h1>
        <p className='text-gray-600'>관리자 계정을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile'>프로필</TabsTrigger>
          <TabsTrigger value='settings'>설정</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='mt-6'>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5' />
                    관리자 프로필
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm profile={profile} onSave={handleProfileSave} />
                </CardContent>
              </Card>
            </div>

            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>계정 정보</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-sm text-gray-500'>이메일</p>
                    <p className='font-medium'>{profile.email}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>가입일</p>
                    <p className='font-medium'>
                      {format(profile.createdAt, 'PPP', { locale: ko })}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>마지막 로그인</p>
                    <p className='font-medium'>
                      {format(profile.lastLoginAt, 'PPP', { locale: ko })}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>권한</p>
                    <Badge variant='default' className='bg-red-600'>
                      관리자
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>관리자 기능</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Button variant='outline' className='w-full justify-start'>
                    <Users className='mr-2 h-4 w-4' />
                    사용자 관리
                  </Button>
                  <Button variant='outline' className='w-full justify-start'>
                    <TrendingUp className='mr-2 h-4 w-4' />
                    프로젝트 승인
                  </Button>
                  <Button variant='outline' className='w-full justify-start'>
                    <Shield className='mr-2 h-4 w-4' />
                    콘텐츠 검토
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='settings' className='mt-6'>
          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lock className='h-5 w-5' />
                  비밀번호 변경
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <LogOut className='h-5 w-5' />
                  로그아웃
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-gray-600'>현재 세션에서 로그아웃합니다.</p>
                <Button variant='outline'>로그아웃</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMyPage;
