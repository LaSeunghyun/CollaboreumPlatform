import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Lock, Trash2 } from 'lucide-react';
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
import type { Backing, UserProfile } from '../types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/api/user';
import { Button } from '@/shared/ui/Button';

export const FanMyPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    role: 'fan',
    bio: '',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    status: 'active',
  });
  const [backings, setBackings] = useState<Backing[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user) {
      setProfile(prev => ({
        ...prev,
        id: '',
        username: '',
        email: '',
        avatar: undefined,
        bio: '',
      }));
      return;
    }

    setProfile(prev => ({
      ...prev,
      id: user.id,
      username: user.name || prev.username,
      email: user.email || prev.email,
      avatar: user.avatar ?? prev.avatar,
      bio: user.bio ?? prev.bio ?? '',
      role: user.role,
      createdAt: user.createdAt ? new Date(user.createdAt) : prev.createdAt,
      lastLoginAt: new Date(),
    }));
  }, [user]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setBackings([]);
      return;
    }

    let cancelled = false;

    const fetchBackingInfo = async () => {
      try {
        const response = (await userAPI.getInvestments(userId)) as any;
        if (!cancelled) {
          if (response.success) {
            setBackings(response.data || []);
          } else {
            setBackings([]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('백킹 정보 로드 실패:', err);
          setBackings([]);
        }
      }
    };

    fetchBackingInfo();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));

    try {
      const targetId = user?.id || profile.id;
      if (!targetId) {
        alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
        return;
      }

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
        <h1 className='mb-2 text-3xl font-bold'>팬 마이페이지</h1>
        <p className='text-gray-600'>후원 내역과 프로필을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='profile'>프로필</TabsTrigger>
          <TabsTrigger value='backings'>후원 내역</TabsTrigger>
          <TabsTrigger value='settings'>설정</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='mt-6'>
          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    프로필 정보
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>후원 통계</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span>총 후원 프로젝트</span>
                    <span className='font-bold'>{backings.length}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>총 후원 금액</span>
                    <span className='font-bold text-blue-600'>
                      {backings
                        .reduce((sum, backing) => sum + backing.amount, 0)
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>성공한 프로젝트</span>
                    <span className='font-bold text-green-600'>
                      {
                        backings.filter(
                          backing => backing.projectStatus === 'completed',
                        ).length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='backings' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>후원 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {backings.map(backing => (
                  <div key={backing.id} className='rounded-lg border p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='font-semibold'>{backing.projectTitle}</h3>
                        <p className='mt-1 text-sm text-gray-600'>
                          후원일: {format(backing.backedAt, 'PPP', { locale: ko })}
                        </p>
                        {backing.reward && (
                          <p className='mt-1 text-sm text-blue-600'>
                            리워드: {backing.reward}
                          </p>
                        )}
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-blue-600'>
                          {backing.amount.toLocaleString()}원
                        </div>
                        <Badge
                          variant={
                            backing.projectStatus === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {backing.projectStatus === 'completed' ? '성공' : '진행중'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <Trash2 className='h-5 w-5' />
                  계정 삭제
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-gray-600'>
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button variant='solid' tone='danger'>계정 삭제</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FanMyPage;
