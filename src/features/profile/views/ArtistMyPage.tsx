import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  User,
  Lock,
  Trash2,
  Plus,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingState, ErrorState } from '@/components/organisms/States';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import { ProfileEditForm } from '../components/ProfileEditForm';
import type { Project, Revenue, UserProfile } from '../types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { artistAPI } from '@/services/api/artist';
import { dynamicConstantsService } from '@/services/constantsService';
import { Button } from '@/shared/ui/Button';
import type { ApiResponse } from '@/types';

type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusBadgeConfig = {
  label: string;
  variant: StatusBadgeVariant;
};

export const ArtistMyPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [statusConfig, setStatusConfig] = useState<Record<string, StatusBadgeConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        setProfile({
          id: user.id,
          username: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio || '',
          avatar: user.avatar,
          createdAt: new Date(user.createdAt || new Date()),
          lastLoginAt: new Date(),
          status: 'active',
        });

        const projectsResponse = await artistAPI.getProjects(user.id);
        if (projectsResponse && Array.isArray(projectsResponse)) {
          setProjects(projectsResponse);
        }

        const statusConfigData =
          await dynamicConstantsService.getProjectStatusConfig();
        setStatusConfig(statusConfigData);
      } catch (err) {
        console.error('아티스트 데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setProjects([]);
        setRevenues([]);
        setStatusConfig({
          pending: { label: '승인 대기', variant: 'secondary' },
          active: { label: '진행중', variant: 'default' },
          completed: { label: '완료', variant: 'outline' },
          failed: { label: '실패', variant: 'destructive' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [user]);

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    if (!profile) {
      alert('프로필 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const response = (await artistAPI.updateArtistProfile(
        profile.id,
        data,
      )) as ApiResponse<unknown>;

      if (response && response.success) {
        setProfile(prev => (prev ? { ...prev, ...data } : null));
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary' as StatusBadgeVariant,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <LoadingState title='데이터를 불러오는 중...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <ErrorState
          title='데이터 로드 실패'
          description={error}
          action={{
            label: '다시 시도',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <ErrorState
          title='프로필을 찾을 수 없습니다'
          description='사용자 정보를 불러올 수 없습니다.'
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>아티스트 마이페이지</h1>
        <p className='text-gray-600'>프로젝트와 수익을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='profile'>프로필</TabsTrigger>
          <TabsTrigger value='projects'>프로젝트</TabsTrigger>
          <TabsTrigger value='revenue'>수익 관리</TabsTrigger>
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
                  <div>
                    <p className='text-sm text-gray-500'>상태</p>
                    <Badge
                      variant={
                        profile.status === 'active' ? 'default' : 'destructive'
                      }
                    >
                      {profile.status === 'active' ? '활성' : '정지'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span>총 프로젝트</span>
                    <span className='font-bold'>{projects.length}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>성공한 프로젝트</span>
                    <span className='font-bold text-green-600'>
                      {projects.filter(project => project.status === 'completed').length}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>총 수익</span>
                    <span className='font-bold text-blue-600'>
                      {revenues
                        .reduce((sum, revenue) => sum + revenue.amount, 0)
                        .toLocaleString()}
                      원
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='projects' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>내 프로젝트</span>
                <Button>
                  <Plus className='mr-2 h-4 w-4' /> 새 프로젝트 만들기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {projects.map(project => (
                  <div key={project.id} className='rounded-lg border p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='font-semibold'>{project.title}</h3>
                        <p className='mt-1 text-sm text-gray-600'>
                          카테고리: {project.category}
                        </p>
                        <p className='mt-1 text-sm text-gray-600'>
                          목표 금액: {project.goalAmount.toLocaleString()}원
                        </p>
                        <div className='mt-2 h-2 w-full rounded-full bg-gray-200'>
                          <div
                            className='h-full rounded-full bg-blue-500'
                            style={{
                              width: `${Math.min(
                                (project.currentAmount / project.goalAmount) * 100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                        <p className='mt-1 text-sm text-gray-600'>
                          달성률:{' '}
                          {Math.round(
                            (project.currentAmount / project.goalAmount) * 100,
                          )}
                          %
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-blue-600'>
                          {project.currentAmount.toLocaleString()}원
                        </div>
                        {getStatusBadge(project.status)}
                        <p className='mt-2 text-sm text-gray-500'>
                          시작일: {format(project.createdAt, 'PPP', { locale: ko })}
                        </p>
                        <p className='text-sm text-gray-500'>
                          마감일: {format(project.endDate, 'PPP', { locale: ko })}
                        </p>
                      </div>
                    </div>
                    <div className='mt-4 flex gap-2'>
                      <Button variant='outline' className='flex-1'>
                        <Eye className='mr-2 h-4 w-4' /> 상세보기
                      </Button>
                      <Button variant='outline' className='flex-1'>
                        편집
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='revenue' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>수익 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {revenues.map(revenue => (
                  <div key={revenue.id} className='rounded-lg border p-4'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-semibold'>{revenue.projectTitle}</h3>
                        <p className='mt-1 text-sm text-gray-600'>
                          분배일: {format(revenue.distributedAt, 'PPP', { locale: ko })}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-blue-600'>
                          {revenue.amount.toLocaleString()}원
                        </div>
                        <Badge
                          variant={
                            revenue.status === 'completed' ? 'default' : 'secondary'
                          }
                        >
                          {revenue.status === 'completed' ? '완료' : '대기 중'}
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

export default ArtistMyPage;
