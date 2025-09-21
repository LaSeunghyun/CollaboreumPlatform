import React, { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import {
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Heart,
  MessageSquare,
  Award,
} from 'lucide-react';
import { FundingProjectCard } from '../../components/molecules/FundingProjectCard';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import {
  useUserProfile,
  useUserProjects,
  useUserBackings,
} from '../../lib/api/useUser';
import {
  LoadingState,
  ErrorState,
  SkeletonGrid,
} from '../../components/organisms/States';

// 타입 정의 (간단하게 any 대신 명확하게)
type UserProfile = {
  avatar?: string;
  name?: string;
  email?: string;
  followers?: number;
  following?: number;
};

type UserProjects = {
  data?: {
    projects?: Array<any>;
  };
  projects?: Array<any>;
};

type UserBackings = {
  backings?: Array<any>;
};

export const AccountPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 실제로는 인증 상태에서 가져와야 함
  const [activeTab, setActiveTab] = useState('my-projects');

  // API 훅들
  const {
    data: userProfileRaw,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile('current-user');
  const {
    data: userProjectsRaw,
    isLoading: projectsLoading,
    error: projectsError,
  } = useUserProjects('current-user');
  const {
    data: userBackingsRaw,
    isLoading: backingsLoading,
    error: backingsError,
  } = useUserBackings('current-user');

  // 안전하게 데이터 구조 분해
  const userProfile: UserProfile = (userProfileRaw as UserProfile) || {};
  const userProjects: UserProjects = (userProjectsRaw as UserProjects) || {};
  const userBackings: UserBackings = (userBackingsRaw as UserBackings) || {};

  const handleLogout = () => {
    setIsLoggedIn(false);
    // 실제 로그아웃 로직
  };

  const handleCreateProject = () => {
    // 프로젝트 생성 페이지로 이동
    window.location.href = '/funding/create';
  };

  if (!isLoggedIn) {
    return (
      <div className='py-12 text-center'>
        <h2 className='mb-4 text-2xl font-bold'>로그인이 필요합니다</h2>
        <p className='mb-6 text-muted-foreground'>
          마이페이지를 이용하려면 로그인해주세요.
        </p>
        <Button variant='indigo'>로그인하기</Button>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>마이페이지</h1>
          <p className='text-muted-foreground'>
            내 활동과 프로젝트를 관리하세요
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='sm'>
            <Settings className='mr-2 h-4 w-4' />
            설정
          </Button>
          <Button variant='outline' size='sm' onClick={handleLogout}>
            <LogOut className='mr-2 h-4 w-4' />
            로그아웃
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardContent className='p-6'>
          {profileLoading ? (
            <div className='flex items-center gap-4'>
              <div className='h-16 w-16 animate-pulse rounded-full bg-muted' />
              <div className='space-y-2'>
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                <div className='h-3 w-48 animate-pulse rounded bg-muted' />
                <div className='h-3 w-24 animate-pulse rounded bg-muted' />
              </div>
            </div>
          ) : profileError ? (
            <ErrorState title='프로필 정보를 불러올 수 없습니다' />
          ) : (
            (() => {
              const hasProfile = userProfile.name && userProfile.email;
              return !hasProfile ? (
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
                  <Button
                    variant='indigo'
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    프로필 등록하기
                  </Button>
                </div>
              ) : (
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

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <BarChart3 className='h-4 w-4 text-indigo' />
              <span className='text-sm text-muted-foreground'>
                진행 중인 프로젝트
              </span>
            </div>
            <p className='text-2xl font-bold'>
              {(userProjects.data?.projects || userProjects.projects)?.filter(
                (p: any) => p.status === 'ongoing',
              ).length ?? 0}
              개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <Heart className='h-4 w-4 text-red-500' />
              <span className='text-sm text-muted-foreground'>
                후원한 프로젝트
              </span>
            </div>
            <p className='text-2xl font-bold'>
              {userBackings.backings?.length ?? 0}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <MessageSquare className='h-4 w-4 text-sky' />
              <span className='text-sm text-muted-foreground'>
                커뮤니티 활동
              </span>
            </div>
            <p className='text-2xl font-bold'>0개</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <Award className='h-4 w-4 text-yellow-500' />
              <span className='text-sm text-muted-foreground'>달성한 목표</span>
            </div>
            <p className='text-2xl font-bold'>0개</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList>
          <TabsTrigger value='my-projects'>내 프로젝트</TabsTrigger>
          <TabsTrigger value='backed-projects'>후원한 프로젝트</TabsTrigger>
          <TabsTrigger value='community-activity'>커뮤니티 활동</TabsTrigger>
          <TabsTrigger value='settings'>설정</TabsTrigger>
        </TabsList>

        <TabsContent value='my-projects' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>내 프로젝트</h3>
            <Button variant='indigo' onClick={handleCreateProject}>
              <Plus className='mr-2 h-4 w-4' />새 프로젝트
            </Button>
          </div>

          {projectsLoading ? (
            <SkeletonGrid count={3} cols={3} />
          ) : projectsError ? (
            <ErrorState title='프로젝트 정보를 불러올 수 없습니다' />
          ) : (
            (() => {
              const projects =
                userProjects.data?.projects || userProjects.projects || [];
              return projects.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                      <Plus className='h-8 w-8 text-indigo' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 프로젝트가 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        창의적인 아이디어를 현실로 만들어보세요.
                        <br />첫 번째 프로젝트를 시작해보세요!
                      </p>
                    </div>
                    <Button variant='indigo' onClick={handleCreateProject}>
                      <Plus className='mr-2 h-4 w-4' />첫 프로젝트 만들기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {projects.map((project: any) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}

                  <Card className='border-dashed'>
                    <CardContent className='space-y-4 p-6 text-center'>
                      <div className='bg-indigo/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
                        <Plus className='h-6 w-6 text-indigo' />
                      </div>
                      <div>
                        <h3 className='mb-2 font-medium'>새 프로젝트 시작</h3>
                        <p className='text-sm text-muted-foreground'>
                          창의적인 아이디어를 현실로 만들어보세요
                        </p>
                      </div>
                      <Button variant='indigo' onClick={handleCreateProject}>
                        프로젝트 만들기
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          )}
        </TabsContent>

        <TabsContent value='backed-projects' className='space-y-6'>
          {backingsLoading ? (
            <SkeletonGrid count={3} cols={3} />
          ) : backingsError ? (
            <ErrorState title='후원 정보를 불러올 수 없습니다' />
          ) : (
            (() => {
              const backings = userBackings.backings || [];
              return backings.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='bg-sky/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                      <Heart className='h-8 w-8 text-sky' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 후원한 프로젝트가 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        마음에 드는 프로젝트를 찾아서 후원해보세요.
                        <br />
                        창의적인 프로젝트들이 여러분을 기다리고 있습니다!
                      </p>
                    </div>
                    <Button
                      className='hover:bg-sky/90 bg-sky'
                      onClick={() => (window.location.href = '/funding')}
                    >
                      <Heart className='mr-2 h-4 w-4' />
                      프로젝트 둘러보기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {backings.map((backing: any) => (
                    <FundingProjectCard
                      key={backing.project.id}
                      {...backing.project}
                    />
                  ))}
                </div>
              );
            })()
          )}
        </TabsContent>

        <TabsContent value='community-activity' className='space-y-6'>
          <Card>
            <CardContent className='p-0'>
              <div className='divide-y'>
                {/* 커뮤니티 활동 목록 */}
                <div className='p-6 text-center text-muted-foreground'>
                  <MessageSquare className='mx-auto mb-2 h-8 w-8' />
                  <p>커뮤니티 활동 내역이 없습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
