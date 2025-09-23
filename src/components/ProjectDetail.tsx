import React, { useState, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import { Heart, Star, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import { PaymentModal, SecretPerksEditor } from '@/features/funding/components';
import { fundingAPI } from '@/api/modules/funding';
import { interactionAPI } from '@/api/modules/interaction';
import { useCategories } from '@/lib/api/useCategories';
import { getCategoryColor } from '@/constants/categories';
import { getFirstChar } from '@/utils/typeGuards';
import { ApiResponse } from '@/types';
import { cn } from '@/shared/lib/cn';

interface ProjectDetailProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [secretPerks, setSecretPerks] = useState('');
  const [isSavingSecretPerks, setIsSavingSecretPerks] = useState(false);
  const [secretPerksMessage, setSecretPerksMessage] = useState<string | null>(
    null,
  );
  const [secretPerksStatus, setSecretPerksStatus] = useState<
    'success' | 'error' | null
  >(null);

  // 카테고리 API 훅 사용
  const { data: categoriesData } = useCategories();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await fundingAPI.getProject(projectId.toString());

        if (projectData) {
          setProject(projectData);
          const perks = Array.isArray((projectData as any).secretPerks)
            ? ((projectData as any).secretPerks as string[]).join('\n')
            : ((projectData as any).secretPerks ?? '');
          setSecretPerks(perks);
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        setError('프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleBackProject = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const response = (await fundingAPI.backProject(projectId.toString(), {
        amount: paymentData.amount,
        message: paymentData.message || '',
        rewardId: paymentData.rewardId,
      })) as ApiResponse<any>;

      if (response.success) {
        // 프로젝트 정보 새로고침
        const updatedProject = await fundingAPI.getProject(
          projectId.toString(),
        );
        if (updatedProject) {
          setProject(updatedProject);
        }
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('후원 처리 실패:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = (await fundingAPI.likeProject(
        projectId.toString(),
      )) as ApiResponse<any>;
      if (response.success) {
        // 좋아요 상태를 즉시 업데이트
        setIsLiked(!isLiked);
        // 프로젝트 정보 새로고침
        const updatedProject = await fundingAPI.getProject(
          projectId.toString(),
        );
        if (updatedProject) {
          setProject((prev: any) => ({
            ...prev,
            ...updatedProject,
            isLiked: !isLiked,
          }));
        }
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = (await fundingAPI.bookmarkProject(
        projectId.toString(),
      )) as ApiResponse<any>;
      if (response.success) {
        setIsBookmarked(!isBookmarked);
        // 프로젝트 정보 새로고침
        const updatedProject = await fundingAPI.getProject(
          projectId.toString(),
        );
        if (updatedProject) {
          setProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSecretPerksSave = async (value: string) => {
    const entries = value
      .split('\n')
      .map(perk => perk.trim())
      .filter(Boolean);

    setIsSavingSecretPerks(true);
    setSecretPerksMessage(null);
    setSecretPerksStatus(null);

    try {
      const response = (await fundingAPI.updateProject(projectId.toString(), {
        secretPerks: entries,
      })) as ApiResponse<any>;

      if (response?.success) {
        setSecretPerks(value);
        setProject((prev: any) =>
          prev
            ? {
                ...prev,
                secretPerks: entries,
              }
            : prev,
        );
        setSecretPerksStatus('success');
        setSecretPerksMessage('비밀 혜택이 저장되었습니다.');
      } else {
        setSecretPerksStatus('error');
        setSecretPerksMessage(
          '비밀 혜택 저장에 실패했습니다. 다시 시도해주세요.',
        );
      }
    } catch (error) {
      console.error('비밀 혜택 저장 실패:', error);
      setSecretPerksStatus('error');
      setSecretPerksMessage(
        '비밀 혜택 저장에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsSavingSecretPerks(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href,
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface'>
        <div className='text-center'>
          <div className='border-muted-foreground/30 mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-primary-500' />
          <p className='mt-4 text-sm text-muted-foreground'>
            프로젝트를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-surface'>
        <div className='space-y-4 text-center'>
          <p className='text-sm font-semibold text-danger-600'>
            {error || '프로젝트를 찾을 수 없습니다.'}
          </p>
          <Button variant='outline' tone='danger' onClick={onBack}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColorClass = (category: string) => {
    // API에서 카테고리 데이터를 가져왔다면 해당 색상 사용
    if ((categoriesData as any)?.data?.categories) {
      const categoryData = (categoriesData as any).data.categories.find(
        (cat: any) => cat.name === category || cat.label === category,
      );
      if (categoryData?.color) {
        return categoryData.color;
      }
    }

    // API 데이터가 없거나 해당 카테고리가 없으면 상수 파일의 색상 사용
    return getCategoryColor(category);
  };

  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Button
          variant='ghost'
          tone='default'
          onClick={onBack}
          className='mb-6 w-fit'
        >
          ← 프로젝트 목록으로
        </Button>

        <Card className='mb-8 overflow-hidden'>
          <div className='relative aspect-video'>
            <ImageWithFallback
              src={project.image}
              alt={project.title || '프로젝트 이미지'}
              className='h-full w-full object-cover'
            />
            {project.featured && (
              <Badge tone='warning' className='absolute left-4 top-4'>
                주목 프로젝트
              </Badge>
            )}
            <Badge
              className={cn(
                'absolute right-4 top-4',
                getCategoryColorClass(project.category),
              )}
            >
              {project.category || '기타'}
            </Badge>
          </div>

          <CardContent className='space-y-6 p-8'>
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
              <div className='flex-1 space-y-4'>
                <div className='space-y-3'>
                  <h1 className='text-3xl font-bold text-foreground'>
                    {project.title || '제목 없음'}
                  </h1>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage
                        src={project.artistAvatar}
                        alt={project.artist}
                      />
                      <AvatarFallback>
                        {getFirstChar(project.artist)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='space-y-1'>
                      <p className='font-medium text-foreground'>
                        by {project.artist}
                      </p>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Star className='h-4 w-4 text-warning-500' />
                        <span>{project.artistRating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className='text-base leading-relaxed text-muted-foreground'>
                  {project.description || '설명 없음'}
                </p>
              </div>

              <div className='flex gap-2 self-start'>
                <Button
                  variant={isLiked ? 'solid' : 'outline'}
                  tone={isLiked ? 'success' : 'default'}
                  size='sm'
                  onClick={handleLike}
                  aria-pressed={isLiked}
                >
                  <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                </Button>
                <Button
                  variant={isBookmarked ? 'solid' : 'outline'}
                  tone={isBookmarked ? 'info' : 'default'}
                  size='sm'
                  onClick={handleBookmark}
                  aria-pressed={isBookmarked}
                >
                  <Bookmark
                    className={cn('h-4 w-4', isBookmarked && 'fill-current')}
                  />
                </Button>
                <Button variant='outline' size='sm' onClick={handleShare}>
                  <Share2 className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='bg-card/60 rounded-3xl p-6'>
              <div className='grid gap-6 md:grid-cols-4'>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-foreground'>
                    ₩{project.currentAmount?.toLocaleString()}
                  </p>
                  <p className='text-sm text-muted-foreground'>현재 모금액</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-foreground'>
                    ₩{project.targetAmount?.toLocaleString()}
                  </p>
                  <p className='text-sm text-muted-foreground'>목표 금액</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-foreground'>
                    {typeof project.backers === 'number' ? project.backers : 0}
                  </p>
                  <p className='text-sm text-muted-foreground'>후원자 수</p>
                </div>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-foreground'>
                    {project.daysLeft}
                  </p>
                  <p className='text-sm text-muted-foreground'>일 남음</p>
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                  <span>진행률</span>
                  <span>
                    {getProgressPercentage(
                      project.currentAmount || 0,
                      project.targetAmount,
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(
                    project.currentAmount || 0,
                    project.targetAmount,
                  )}
                  className='h-3'
                />
              </div>
            </div>

            <div className='flex flex-col gap-3 md:flex-row'>
              <Button size='lg' className='flex-1' onClick={handleBackProject}>
                프로젝트 후원하기
              </Button>
              <Button
                variant='outline'
                tone='default'
                size='lg'
                onClick={async () => {
                  try {
                    const response = (await interactionAPI.followArtist(
                      project.artistId || project.artist.id,
                    )) as ApiResponse<any>;
                    if (response.success) {
                      alert('아티스트를 팔로우했습니다!');
                    }
                  } catch (followError) {
                    console.error('팔로우 실패:', followError);
                    alert('팔로우에 실패했습니다. 다시 시도해주세요.');
                  }
                }}
              >
                아티스트 팔로우
              </Button>
            </div>
          </CardContent>
        </Card>

        <SecretPerksEditor
          value={secretPerks}
          onChange={setSecretPerks}
          onSubmit={handleSecretPerksSave}
          isSaving={isSavingSecretPerks}
          className='mb-6'
        />
        {secretPerksMessage && (
          <p
            className={cn(
              'mb-8 text-sm font-medium',
              secretPerksStatus === 'success'
                ? 'text-success-600'
                : 'text-danger-600',
            )}
            role='status'
          >
            {secretPerksMessage}
          </p>
        )}

        <Tabs defaultValue='story' className='mb-8'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='story'>스토리</TabsTrigger>
            <TabsTrigger value='rewards'>후원 옵션</TabsTrigger>
            <TabsTrigger value='updates'>업데이트</TabsTrigger>
            <TabsTrigger value='comments'>댓글</TabsTrigger>
          </TabsList>

          <TabsContent value='story' className='mt-6'>
            <Card>
              <CardContent className='space-y-4 p-6'>
                <h3 className='text-xl font-semibold text-foreground'>
                  프로젝트 스토리
                </h3>
                <div className='prose max-w-none text-muted-foreground'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: project.story || project.description,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='rewards' className='mt-6'>
            <Card>
              <CardContent className='space-y-4 p-6'>
                <h3 className='text-xl font-semibold text-foreground'>
                  후원 옵션
                </h3>
                <div className='grid gap-4'>
                  {Array.isArray(project.rewards) &&
                    project.rewards.map((reward: any, index: number) => (
                      <div
                        key={index}
                        className='border-border/60 rounded-2xl border p-4'
                      >
                        <div className='mb-2 flex items-start justify-between'>
                          <h4 className='text-lg font-semibold text-foreground'>
                            ₩
                            {typeof reward.amount === 'number'
                              ? reward.amount.toLocaleString()
                              : '0'}
                          </h4>
                          <Badge variant='secondary'>
                            {typeof reward.backers === 'number'
                              ? reward.backers
                              : 0}
                            명 후원
                          </Badge>
                        </div>
                        <h5 className='mb-2 text-base font-medium text-foreground'>
                          {reward.title}
                        </h5>
                        <p className='mb-3 text-sm text-muted-foreground'>
                          {reward.description}
                        </p>
                        <Button size='sm' onClick={handleBackProject}>
                          이 옵션으로 후원하기
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='updates' className='mt-6'>
            <Card>
              <CardContent className='space-y-4 p-6'>
                <h3 className='text-xl font-semibold text-foreground'>
                  프로젝트 업데이트
                </h3>
                <div className='space-y-4'>
                  {project.updates?.map((update: any, index: number) => (
                    <div
                      key={index}
                      className='border-border/60 border-b pb-4 last:border-b-0'
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <h4 className='font-medium text-foreground'>
                          {update.title}
                        </h4>
                        <span className='text-sm text-muted-foreground'>
                          {update.date}
                        </span>
                      </div>
                      <p className='mb-2 text-sm text-muted-foreground'>
                        {update.content}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Heart className='h-4 w-4' />
                          <span>
                            {typeof update.likes === 'number'
                              ? update.likes
                              : 0}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <MessageCircle className='h-4 w-4' />
                          <span>{update.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='comments' className='mt-6'>
            <Card>
              <CardContent className='space-y-4 p-6'>
                <h3 className='text-xl font-semibold text-foreground'>댓글</h3>
                <div className='space-y-4'>
                  {(Array.isArray(project.comments)
                    ? project.comments
                    : []
                  ).map((comment: any, index: number) => (
                    <div key={index} className='flex gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.username}
                        />
                        <AvatarFallback>
                          {getFirstChar(comment.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-foreground'>
                            {comment.author.username}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showPaymentModal && (
        <PaymentModal
          project={project}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
