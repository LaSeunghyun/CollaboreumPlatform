import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/Tabs';
import { ErrorMessage, ProjectListSkeleton, Skeleton } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { userProfileAPI } from '@/services/api/user';
import {
  User as UserIcon,
  Bookmark,
  DollarSign,
  Eye,
  Settings,
} from 'lucide-react';

interface FanMyPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    following?: number;
    totalPledges?: number;
    totalAmount?: number;
  };
  onEditProfile?: () => void;
  onViewProject?: (projectId: string) => void;
  onFollowArtist?: (artistId: string) => void;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const FanMyPage: React.FC<FanMyPageProps> = ({
  user,
  onEditProfile,
  onViewProject,
  onFollowArtist,
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const userId = user?.id ?? authUser?.id ?? '';
  const hasUser = Boolean(userId);

  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['fan', 'profile', userId],
    queryFn: () => userProfileAPI.getUserProfile(userId),
    enabled: hasUser,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: backingsResponse,
    isLoading: backingsLoading,
    error: backingsError,
    refetch: refetchBackings,
  } = useQuery({
    queryKey: ['fan', 'backings', userId],
    queryFn: () => userProfileAPI.getUserBackings(userId, { limit: 20 }),
    enabled: hasUser,
    staleTime: 5 * 60 * 1000,
  });

  const profile = useMemo(() => {
    if (!hasUser) return null;
    const apiProfile =
      (profileResponse as any)?.data ?? profileResponse ?? null;

    if (apiProfile) {
      return {
        id: apiProfile.id ?? apiProfile.userId ?? userId,
        name:
          apiProfile.name ??
          apiProfile.username ??
          user?.name ??
          authUser?.name ??
          '이름 없음',
        email: apiProfile.email ?? user?.email ?? authUser?.email ?? '',
        avatar: apiProfile.avatar ?? user?.avatar,
        bio: apiProfile.bio ?? user?.bio ?? '',
        following:
          apiProfile.followingCount ??
          apiProfile.following?.length ??
          user?.following ??
          0,
        totalPledges: apiProfile.totalPledges ?? user?.totalPledges ?? 0,
        totalAmount:
          apiProfile.totalAmount ??
          apiProfile.totalBackingAmount ??
          user?.totalAmount ??
          0,
        followingArtists: apiProfile.following ?? [],
      };
    }

    if (user) {
      return {
        ...user,
        followingArtists: [],
        following: user.following ?? 0,
        totalPledges: user.totalPledges ?? 0,
        totalAmount: user.totalAmount ?? 0,
      };
    }

    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar,
        bio: authUser.bio ?? '',
        following: 0,
        totalPledges: 0,
        totalAmount: 0,
        followingArtists: [],
      };
    }

    return null;
  }, [authUser, hasUser, profileResponse, user, userId]);

  const backings = useMemo(() => {
    const raw = (backingsResponse as any)?.data ?? backingsResponse ?? [];
    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.backings)) {
      return raw.backings;
    }

    if (Array.isArray(raw?.items)) {
      return raw.items;
    }

    return [];
  }, [backingsResponse]);

  const totalBackingAmount = useMemo(() => {
    return backings.reduce(
      (sum: number, pledge: any) =>
        sum + toNumber(pledge.amount ?? pledge.totalAmount ?? pledge.price),
      0,
    );
  }, [backings]);

  const totalBackingCount = backings.length;

  const aggregatedProfile = useMemo(() => {
    if (!profile) return null;
    const followingArtists = Array.isArray((profile as any).followingArtists)
      ? (profile as any).followingArtists
      : [];

    return {
      ...profile,
      followingArtists,
      following: profile.following ?? followingArtists.length,
      totalPledges: profile.totalPledges ?? totalBackingCount,
      totalAmount: profile.totalAmount ?? totalBackingAmount,
    };
  }, [profile, totalBackingAmount, totalBackingCount]);

  const monthlyBackings = useMemo(() => {
    const now = new Date();
    return backings.filter((pledge: any) => {
      const date = parseDate(
        pledge.pledgeDate ?? pledge.createdAt ?? pledge.date,
      );
      if (!date) return false;
      return differenceInCalendarDays(now, date) <= 30;
    });
  }, [backings]);

  const monthlyBackingAmount = monthlyBackings.reduce(
    (sum: number, pledge: any) =>
      sum + toNumber(pledge.amount ?? pledge.totalAmount ?? pledge.price),
    0,
  );

  const followingArtists = useMemo(() => {
    if (!aggregatedProfile) return [];
    const raw = aggregatedProfile.followingArtists;

    if (Array.isArray(raw)) {
      return raw;
    }

    return [];
  }, [aggregatedProfile]);

  const recentActivities = useMemo(() => {
    return backings.slice(0, 3).map((pledge: any) => ({
      id: String(
        pledge.id ??
          pledge.projectId ??
          Math.random().toString(36).slice(2, 10),
      ),
      title: `${pledge.projectTitle ?? pledge.project?.title ?? '프로젝트'}에 후원했습니다`,
      timestamp:
        pledge.pledgeDate ?? pledge.createdAt ?? pledge.updatedAt ?? null,
    }));
  }, [backings]);

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(toNumber(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-success-100 text-success-700';
      case 'pending':
      case 'processing':
        return 'bg-warning-100 text-warning-700';
      case 'cancelled':
      case 'refunded':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return '완료';
      case 'pending':
      case 'processing':
        return '대기중';
      case 'cancelled':
        return '취소됨';
      case 'refunded':
        return '환불됨';
      default:
        return status;
    }
  };

  if (!hasUser) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-3xl p-6'>
          <Card>
            <CardContent className='space-y-4 p-8 text-center'>
              <h2 className='text-2xl font-semibold text-gray-900'>
                로그인이 필요합니다
              </h2>
              <p className='text-gray-600'>
                팬 마이페이지를 확인하려면 먼저 로그인해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl p-6'>
        {/* 프로필 헤더 */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            {profileLoading ? (
              <div className='space-y-4'>
                <Skeleton className='h-10 w-1/3' />
                <Skeleton className='h-6 w-1/2' />
                <Skeleton className='h-16 w-full' />
              </div>
            ) : profileError ? (
              <ErrorMessage
                error={profileError as Error}
                onRetry={() => refetchProfile()}
              />
            ) : aggregatedProfile ? (
              <div className='flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0'>
                <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary-100'>
                  {aggregatedProfile.avatar ? (
                    <img
                      src={aggregatedProfile.avatar}
                      alt={aggregatedProfile.name}
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
                        {aggregatedProfile.name}
                      </h1>
                      <p className='text-gray-600'>{aggregatedProfile.email}</p>
                      <p className='mt-2 text-gray-700'>
                        {aggregatedProfile.bio || '소개 정보가 없습니다.'}
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
                        {aggregatedProfile.following ?? followingArtists.length}
                      </div>
                      <div className='text-sm text-gray-600'>팔로잉</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {aggregatedProfile.totalPledges}
                      </div>
                      <div className='text-sm text-gray-600'>후원 횟수</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {formatCurrency(aggregatedProfile.totalAmount)}
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

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>개요</TabsTrigger>
            <TabsTrigger value='pledges'>후원 내역</TabsTrigger>
            <TabsTrigger value='following'>팔로잉</TabsTrigger>
            <TabsTrigger value='favorites'>즐겨찾기</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>최근 활동</h3>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    <div className='space-y-4'>
                      {recentActivities.map((activity: any) => (
                        <div
                          key={activity.id}
                          className='flex items-center space-x-3'
                        >
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100'>
                            <DollarSign className='h-4 w-4 text-primary-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium'>
                              {activity.title}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {activity.timestamp
                                ? formatDistanceToNow(
                                    parseDate(activity.timestamp) ?? new Date(),
                                    { addSuffix: true },
                                  )
                                : '날짜 정보 없음'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500'>
                      최근 활동 내역이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className='text-lg font-semibold'>이번 달 활동</h3>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>후원 횟수</span>
                      <span className='font-semibold'>
                        {monthlyBackings.length}회
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>후원 금액</span>
                      <span className='font-semibold'>
                        {formatCurrency(monthlyBackingAmount)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>총 팔로잉</span>
                      <span className='font-semibold text-green-600'>
                        {(
                          aggregatedProfile?.following ??
                          followingArtists.length
                        ).toLocaleString()}
                        명
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        총 후원 프로젝트
                      </span>
                      <span className='font-semibold text-blue-600'>
                        {aggregatedProfile?.totalPledges?.toLocaleString() ??
                          '0'}
                        개
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='pledges' className='mt-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>후원 내역</h3>
              {backingsLoading ? (
                <ProjectListSkeleton />
              ) : backingsError ? (
                <ErrorMessage
                  error={backingsError as Error}
                  onRetry={() => refetchBackings()}
                />
              ) : backings.length > 0 ? (
                backings.map((pledge: any) => {
                  const projectTitle =
                    pledge.projectTitle ??
                    pledge.project?.title ??
                    '이름 없는 프로젝트';
                  const artistName =
                    pledge.artistName ??
                    pledge.project?.artist?.name ??
                    pledge.artist?.name ??
                    '알 수 없음';
                  const rewardTitle =
                    pledge.rewardTitle ?? pledge.reward?.title ?? '';
                  const projectId = String(
                    pledge.projectId ?? pledge.project?.id ?? pledge.id,
                  );
                  const pledgeDate = parseDate(
                    pledge.pledgeDate ?? pledge.createdAt ?? pledge.date,
                  );
                  const status = pledge.status ?? pledge.state ?? 'completed';

                  return (
                    <Card
                      key={`${projectId}-${pledgeDate?.toISOString() ?? ''}`}
                      className='transition-shadow hover:shadow-md'
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h4 className='mb-2 text-lg font-semibold text-gray-900'>
                              {projectTitle}
                            </h4>
                            <p className='mb-2 text-sm text-gray-600'>
                              by {artistName}
                            </p>
                            {rewardTitle && (
                              <p className='mb-2 text-sm text-gray-700'>
                                {rewardTitle}
                              </p>
                            )}
                            <div className='flex items-center space-x-4 text-sm text-gray-500'>
                              <span>
                                후원일:{' '}
                                {pledgeDate
                                  ? pledgeDate.toLocaleDateString()
                                  : '정보 없음'}
                              </span>
                              <span>•</span>
                              <span className='font-medium text-gray-900'>
                                {formatCurrency(
                                  pledge.amount ?? pledge.totalAmount,
                                )}
                              </span>
                            </div>
                          </div>
                          <div className='flex flex-col items-end space-y-2'>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}
                            >
                              {getStatusText(status)}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => onViewProject?.(projectId)}
                            >
                              <Eye className='mr-1 h-4 w-4' />
                              보기
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className='text-sm text-gray-500'>후원 내역이 없습니다.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='following' className='mt-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>팔로잉 중인 아티스트</h3>
              {followingArtists.length > 0 ? (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {followingArtists.map((artist: any) => {
                    const artistId = String(
                      artist.id ??
                        artist.artistId ??
                        Math.random().toString(36).slice(2, 10),
                    );
                    const followers = toNumber(
                      artist.followers ??
                        artist.followersCount ??
                        artist.followerCount,
                    );

                    return (
                      <Card
                        key={artistId}
                        className='transition-shadow hover:shadow-md'
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
                              {artist.avatar ? (
                                <img
                                  src={artist.avatar}
                                  alt={artist.name ?? '아티스트'}
                                  className='h-12 w-12 rounded-full object-cover'
                                />
                              ) : (
                                <UserIcon className='h-6 w-6 text-primary-600' />
                              )}
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-gray-900'>
                                {artist.name ?? '이름 없는 아티스트'}
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {followers.toLocaleString()}명 팔로워
                              </p>
                            </div>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => onFollowArtist?.(artistId)}
                            >
                              팔로우
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className='text-sm text-gray-500'>
                  팔로잉 중인 아티스트가 없습니다.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='favorites' className='mt-6'>
            <Card>
              <CardHeader>
                <h3 className='text-lg font-semibold'>즐겨찾기</h3>
              </CardHeader>
              <CardContent>
                <div className='py-12 text-center'>
                  <Bookmark className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <p className='text-gray-500'>
                    즐겨찾기한 프로젝트가 없습니다
                  </p>
                  <Button
                    className='mt-4'
                    onClick={() => setActiveTab('overview')}
                  >
                    프로젝트 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FanMyPage;
