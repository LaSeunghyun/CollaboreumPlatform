import React, { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Search,
  TrendingUp,
  Clock,
  Users2,
  Heart,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { ArtistCard } from '../../components/molecules/ArtistCard';
import { FundingProjectCard } from '../../components/molecules/FundingProjectCard';
import { StatCard } from '../../components/ui/StatCard';
import { usePopularArtists } from '../../lib/api/useArtists';
import { useProjects } from '../../lib/api/useProjects';
import { useNotices } from '../../lib/api/useNotices';
import { useCategories } from '../../lib/api/useCategories';
import { getCategoryInfo } from '../../utils/categoryUtils';
import { useCommunityPosts } from '../../features/community/hooks/useCommunityPosts';
import { LoadingState, SkeletonGrid } from '../../components/organisms/States';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../../services/api';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

export const HomePage: React.FC = () => {
  const { requireAuth } = useAuthRedirect();
  const [searchQuery, setSearchQuery] = useState('');

  // API 훅들 - 에러 발생 시 빈 데이터로 fallback
  const {
    data: popularArtists,
    isLoading: artistsLoading,
    error: artistsError,
  } = usePopularArtists(3);
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects({
    limit: 3,
    sortBy: 'popularity',
  });
  const {
    data: notices,
    isLoading: noticesLoading,
    error: noticesError,
  } = useNotices({
    limit: 2,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const {
    data: communityPosts,
    isLoading: communityLoading,
    error: communityError,
  } = useCommunityPosts({
    limit: 4,
    sortBy: 'likes',
    order: 'desc',
  });
  const { data: categories = [] } = useCategories();

  // 플랫폼 통계 조회 - 에러 발생 시 기본값 사용
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: statsAPI.getPlatformStats,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1, // 재시도 1회만
    retryDelay: 1000,
  });

  // 기본 통계 데이터 (API 실패 시 사용)
  const defaultStats = {
    totalArtists: 0,
    totalProjects: 0,
    totalFunding: 0,
    totalUsers: 0,
  };

  const handleSearch = () => {
    // 검색 로직 구현
  };

  return (
    <ErrorBoundary>
      <div className='space-y-8 md:space-y-12'>
        {/* Hero Section */}
        <section className='relative flex min-h-screen items-center justify-center space-y-8 overflow-hidden py-8 text-center md:space-y-12 md:py-12'>
          {/* 좌우 상단에서 가운데로 갈수록 색이 생기는 그라데이션 배경 */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/40' />
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20' />

          {/* 중앙으로 수렴하는 원형 그라데이션 효과 */}
          <div className='pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]' />
          <div className='pointer-events-none absolute right-0 top-0 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.15),transparent_70%)]' />

          {/* 부드러운 색상 오버레이 */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40' />

          <div className='relative z-10 space-y-8 px-4 md:space-y-12'>
            <div className='space-y-6 md:space-y-8'>
              {/* Status Badge - 강조된 스타일 */}
              <div className='mb-8 inline-flex items-center gap-3 rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 text-base font-semibold text-blue-700 shadow-lg backdrop-blur-sm'>
                <span className='h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500'></span>
                <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent'>
                  새로운 창작 생태계가 시작됩니다
                </span>
              </div>

              <div className='space-y-4 md:space-y-6'>
                <h1 className='text-4xl font-bold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl xl:text-7xl'>
                  <span className='block bg-gradient-to-r from-indigo via-sky to-indigo bg-clip-text text-transparent'>
                    아티스트와 팬이 함께 만드는
                  </span>
                  <span className='mt-2 block bg-gradient-to-r from-sky via-indigo to-sky bg-clip-text text-transparent'>
                    크리에이티브 생태계
                  </span>
                </h1>

                <div className='mx-auto max-w-4xl space-y-3 pt-4 md:space-y-4'>
                  <p className='text-foreground/90 text-xl font-medium leading-relaxed md:text-2xl lg:text-3xl'>
                    독립 아티스트의 꿈을 현실로 만들고
                    <br />
                    팬들과 함께 성장하는 새로운 플랫폼
                  </p>
                  <p className='text-muted-foreground/80 text-lg leading-relaxed md:text-xl'>
                    신뢰와 투명성을 바탕으로 건강한 예술 생태계를 구축합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className='mx-auto flex max-w-3xl flex-col gap-4 pt-2 md:gap-5'>
              <div className='relative w-full'>
                <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground' />
                <Input
                  placeholder='아티스트, 프로젝트를 검색해보세요...'
                  className='focus:border-indigo/50 h-12 w-full rounded-2xl border-2 bg-white/80 pl-12 text-base shadow-sm backdrop-blur md:h-14 md:text-lg'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                size='lg'
                className='hover-scale transition-button h-12 w-full rounded-2xl bg-indigo px-8 text-base font-semibold text-white shadow-lg hover:bg-indigo-hover sm:w-auto md:h-14 md:px-10 md:text-lg'
                onClick={handleSearch}
              >
                지금 시작하기
              </Button>
            </div>

            {/* Enhanced Stats Grid */}
            <div className='mx-auto grid max-w-5xl grid-cols-2 gap-4 pt-8 md:pt-12 lg:grid-cols-4 lg:gap-8'>
              <StatCard
                label='아티스트'
                value={
                  statsLoading
                    ? '...'
                    : (
                        (platformStats as any)?.data?.totalArtists ||
                        defaultStats.totalArtists
                      ).toLocaleString()
                }
                icon={Users2}
                iconColor='text-indigo'
              />
              <StatCard
                label='진행 프로젝트'
                value={
                  statsLoading
                    ? '...'
                    : (
                        (platformStats as any)?.data?.totalProjects ||
                        defaultStats.totalProjects
                      ).toLocaleString()
                }
                icon={TrendingUp}
                iconColor='text-sky'
              />
              <StatCard
                label='총 후원금액'
                value={
                  statsLoading
                    ? '...'
                    : `₩${((platformStats as any)?.data?.totalFunding || defaultStats.totalFunding).toLocaleString()}`
                }
                icon={Heart}
                iconColor='text-red-500'
              />
            </div>
          </div>
        </section>

        {/* Featured Artists */}
        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>주목받는 아티스트</h2>
            <Button variant='outline' size='sm'>
              더보기
            </Button>
          </div>

          {artistsLoading ? (
            <SkeletonGrid count={3} cols={3} />
          ) : artistsError ? (
            <Card className='border-dashed'>
              <CardContent className='space-y-6 p-12 text-center'>
                <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                  <Users2 className='h-8 w-8 text-indigo' />
                </div>
                <div>
                  <h3 className='mb-2 text-xl font-semibold'>
                    아티스트 정보를 불러올 수 없습니다
                  </h3>
                  <p className='mb-6 text-muted-foreground'>
                    서버에 연결할 수 없습니다.
                    <br />
                    잠시 후 다시 시도해주세요.
                  </p>
                </div>
                <Button
                  variant='indigo'
                  onClick={() => window.location.reload()}
                >
                  <Users2 className='mr-2 h-4 w-4' />
                  새로고침
                </Button>
              </CardContent>
            </Card>
          ) : (
            (() => {
              const artists =
                (popularArtists as any)?.data?.artists ||
                (popularArtists as any)?.artists ||
                [];
              return artists.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                      <Users2 className='h-8 w-8 text-indigo' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 등록된 아티스트가 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        첫 번째 아티스트가 되어보세요!
                        <br />
                        창의적인 작품을 세상에 알려보세요.
                      </p>
                    </div>
                    <Button
                      variant='indigo'
                      onClick={() =>
                        requireAuth(() => {
                          window.location.href = '/signup';
                        })
                      }
                    >
                      <Users2 className='mr-2 h-4 w-4' />
                      아티스트 등록하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3'>
                  {artists.slice(0, 3).map((artist: any) => (
                    <ArtistCard
                      key={artist.id}
                      {...artist}
                      onClick={() =>
                        requireAuth(() => {
                          window.location.href = `/artists/${artist.id}`;
                        })
                      }
                    />
                  ))}
                </div>
              );
            })()
          )}
        </section>

        {/* Featured Projects */}
        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>진행 중인 프로젝트</h2>
            <div className='flex gap-2'>
              <Badge variant='secondary' className='bg-indigo/10 text-indigo'>
                <TrendingUp className='mr-1 h-3 w-3' />
                인기순
              </Badge>
              <Badge variant='outline'>
                <Clock className='mr-1 h-3 w-3' />
                마감임박
              </Badge>
            </div>
          </div>

          {projectsLoading ? (
            <SkeletonGrid count={3} cols={3} />
          ) : projectsError ? (
            <Card className='border-dashed'>
              <CardContent className='space-y-6 p-12 text-center'>
                <div className='bg-sky/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                  <TrendingUp className='h-8 w-8 text-sky' />
                </div>
                <div>
                  <h3 className='mb-2 text-xl font-semibold'>
                    프로젝트 정보를 불러올 수 없습니다
                  </h3>
                  <p className='mb-6 text-muted-foreground'>
                    서버에 연결할 수 없습니다.
                    <br />
                    잠시 후 다시 시도해주세요.
                  </p>
                </div>
                <Button
                  className='hover:bg-sky/90 bg-sky'
                  onClick={() => window.location.reload()}
                >
                  <TrendingUp className='mr-2 h-4 w-4' />
                  새로고침
                </Button>
              </CardContent>
            </Card>
          ) : (
            (() => {
              const projectList =
                (projects as any)?.data?.projects ||
                (projects as any)?.projects ||
                [];
              return projectList.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='bg-sky/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                      <TrendingUp className='h-8 w-8 text-sky' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 진행 중인 프로젝트가 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        첫 번째 프로젝트를 시작해보세요!
                        <br />
                        창의적인 아이디어를 현실로 만들어보세요.
                      </p>
                    </div>
                    <Button
                      className='hover:bg-sky/90 bg-sky'
                      onClick={() =>
                        requireAuth(() => {
                          window.location.href = '/funding/create';
                        })
                      }
                    >
                      <TrendingUp className='mr-2 h-4 w-4' />
                      프로젝트 시작하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3'>
                  {(Array.isArray(projectList) ? projectList : [])
                    .slice(0, 3)
                    .map((project: any) => (
                      <FundingProjectCard
                        key={project.id}
                        {...project}
                        onClick={() =>
                          requireAuth(() => {
                            window.location.href = `/projects/${project.id}`;
                          })
                        }
                      />
                    ))}
                </div>
              );
            })()
          )}
        </section>

        {/* Notice Preview */}
        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>중요 공지사항</h2>
            <Button variant='outline' size='sm'>
              전체보기
            </Button>
          </div>

          {noticesLoading ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <LoadingState title='공지사항 로딩 중...' />
              <LoadingState title='공지사항 로딩 중...' />
            </div>
          ) : noticesError ? (
            <Card className='border-dashed'>
              <CardContent className='space-y-6 p-12 text-center'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
                  <AlertCircle className='h-8 w-8 text-yellow-600' />
                </div>
                <div>
                  <h3 className='mb-2 text-xl font-semibold'>
                    공지사항을 불러올 수 없습니다
                  </h3>
                  <p className='mb-6 text-muted-foreground'>
                    서버에 연결할 수 없습니다.
                    <br />
                    잠시 후 다시 시도해주세요.
                  </p>
                </div>
                <Button
                  className='bg-yellow-600 hover:bg-yellow-700'
                  onClick={() => window.location.reload()}
                >
                  <AlertCircle className='mr-2 h-4 w-4' />
                  새로고침
                </Button>
              </CardContent>
            </Card>
          ) : (
            (() => {
              const noticeList =
                (notices as any)?.data?.posts || (notices as any)?.posts || [];
              return noticeList.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
                      <AlertCircle className='h-8 w-8 text-yellow-600' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 공지지사항이 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        새로운 소식과 업데이트를 기다리고 있습니다.
                        <br />곧 유용한 정보를 제공해드릴 예정입니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {(Array.isArray(noticeList) ? noticeList : [])
                    .slice(0, 2)
                    .map((notice: any) => (
                      <Card
                        key={notice.id}
                        className='cursor-pointer border-l-4 border-l-indigo transition-all duration-200 hover:shadow-md'
                      >
                        <CardContent className='p-5'>
                          <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                              <Badge className='bg-indigo text-xs text-white'>
                                공지사항
                              </Badge>
                              {notice.isImportant && (
                                <Badge
                                  variant='secondary'
                                  className='bg-red-100 text-xs text-red-700'
                                >
                                  중요
                                </Badge>
                              )}
                              {notice.isPinned && (
                                <Badge
                                  variant='secondary'
                                  className='bg-yellow-100 text-xs text-yellow-700'
                                >
                                  📌
                                </Badge>
                              )}
                            </div>
                            <h3 className='line-clamp-2 font-medium'>
                              {notice.title}
                            </h3>
                            <p className='line-clamp-2 text-sm text-muted-foreground'>
                              {notice.content}
                            </p>
                            <div className='flex items-center justify-between pt-2 text-xs text-muted-foreground'>
                              <span className='font-medium'>
                                Collaboreum 운영팀
                              </span>
                              <div className='flex items-center gap-3'>
                                <span>
                                  조회 {notice.views?.toLocaleString() || 0}
                                </span>
                                <span>
                                  {new Date(
                                    notice.createdAt,
                                  ).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              );
            })()
          )}
        </section>

        {/* Community Preview */}
        <section className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>커뮤니티 인기글</h2>
            <Button variant='outline' size='sm'>
              더보기
            </Button>
          </div>

          {communityLoading ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <LoadingState title='커뮤니티 로딩 중...' />
              <LoadingState title='커뮤니티 로딩 중...' />
            </div>
          ) : communityError ? (
            <Card className='border-dashed'>
              <CardContent className='space-y-6 p-12 text-center'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                  <MessageSquare className='h-8 w-8 text-green-600' />
                </div>
                <div>
                  <h3 className='mb-2 text-xl font-semibold'>
                    커뮤니티 정보를 불러올 수 없습니다
                  </h3>
                  <p className='mb-6 text-muted-foreground'>
                    서버에 연결할 수 없습니다.
                    <br />
                    잠시 후 다시 시도해주세요.
                  </p>
                </div>
                <Button
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => window.location.reload()}
                >
                  <MessageSquare className='mr-2 h-4 w-4' />
                  새로고침
                </Button>
              </CardContent>
            </Card>
          ) : (
            (() => {
              const postList =
                (communityPosts as any)?.data?.posts ||
                (communityPosts as any)?.posts ||
                [];
              return postList.length === 0 ? (
                <Card className='border-dashed'>
                  <CardContent className='space-y-6 p-12 text-center'>
                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                      <MessageSquare className='h-8 w-8 text-green-600' />
                    </div>
                    <div>
                      <h3 className='mb-2 text-xl font-semibold'>
                        아직 커뮤니티 글이 없습니다
                      </h3>
                      <p className='mb-6 text-muted-foreground'>
                        첫 번째 글을 작성해보세요!
                        <br />
                        아티스트들과 소통하고 경험을 공유해보세요.
                      </p>
                    </div>
                    <Button
                      className='bg-green-600 hover:bg-green-700'
                      onClick={() =>
                        requireAuth(() => {
                          window.location.href = '/community/create';
                        })
                      }
                    >
                      <MessageSquare className='mr-2 h-4 w-4' />첫 글 작성하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {postList.slice(0, 4).map((post: any) => (
                    <Card
                      key={post.id}
                      className='cursor-pointer transition-shadow hover:shadow-md'
                    >
                      <CardContent className='p-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='secondary'
                              className={`text-xs ${getCategoryInfo(post.category, categories).color}`}
                            >
                              {getCategoryInfo(post.category, categories).label}
                            </Badge>
                            {post.isHot && (
                              <Badge
                                variant='secondary'
                                className='bg-red-100 text-xs text-red-700'
                              >
                                🔥 HOT
                              </Badge>
                            )}
                          </div>
                          <h3 className='line-clamp-2 font-medium'>
                            {post.title}
                          </h3>
                          <p className='line-clamp-2 text-sm text-muted-foreground'>
                            {post.content}
                          </p>
                          <div className='flex items-center justify-between text-xs text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                              <span>
                                {typeof post.author === 'string'
                                  ? post.author
                                  : post.author?.name || 'Unknown'}
                              </span>
                              {post.author?.isVerified && (
                                <div className='flex h-3 w-3 items-center justify-center rounded-full bg-sky'>
                                  <svg
                                    className='h-2 w-2 text-white'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                  >
                                    <path
                                      fillRule='evenodd'
                                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                      clipRule='evenodd'
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className='flex items-center gap-2'>
                              <span>
                                👍{' '}
                                {typeof post.likes === 'number'
                                  ? post.likes
                                  : Array.isArray(post.likes)
                                    ? post.likes.length
                                    : 0}
                              </span>
                              <span>
                                💬{' '}
                                {typeof post.comments === 'number'
                                  ? post.comments
                                  : Array.isArray(post.comments)
                                    ? post.comments.length
                                    : 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()
          )}
        </section>

        {/* Funding System Features */}
        <section className='space-y-6'>
          <div className='space-y-4 text-center'>
            <h2 className='text-3xl font-bold'>투명한 펀딩 시스템</h2>
            <p className='mx-auto max-w-3xl text-lg text-muted-foreground'>
              모든 비용 사용 내역을 공개하고, 투명한 수익 분배를 통해 신뢰할 수
              있는 크리에이터 경제를 구축합니다.
            </p>
          </div>

          <Card className='border-dashed'>
            <CardContent className='space-y-6 p-12 text-center'>
              <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <TrendingUp className='h-8 w-8 text-indigo' />
              </div>
              <div>
                <h3 className='mb-2 text-xl font-semibold'>
                  펀딩 시스템 준비 중
                </h3>
                <p className='mb-6 text-muted-foreground'>
                  투명한 펀딩 시스템이 곧 출시됩니다.
                  <br />
                  프로젝트 집행 관리, 비용 공개, 수익 분배 기능을 제공할
                  예정입니다.
                </p>
              </div>
              <Button
                variant='indigo'
                onClick={() =>
                  requireAuth(() => {
                    window.location.href = '/projects';
                  })
                }
              >
                <TrendingUp className='mr-2 h-4 w-4' />
                프로젝트 둘러보기
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </ErrorBoundary>
  );
};
