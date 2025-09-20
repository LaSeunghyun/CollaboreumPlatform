import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { FundingProject } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Users, Calendar, Target } from 'lucide-react';

interface ProjectGridProps {
  projects: FundingProject[];
  isLoading?: boolean;
  onProjectClick?: (projectId: string) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  isLoading = false,
  onProjectClick,
}) => {
  const handleProjectClick = (project: FundingProject) => {
    if (onProjectClick) {
      onProjectClick(project.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'bg-primary-100 text-primary-700';
      case 'succeeded':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-danger-100 text-danger-700';
      case 'executing':
        return 'bg-warning-100 text-warning-700';
      case 'distributing':
        return 'bg-secondary-100 text-secondary-700';
      case 'closed':
        return 'bg-neutral-100 text-neutral-700';
      default:
        return 'bg-neutral-100 text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collecting':
        return '모금 중';
      case 'succeeded':
        return '성공';
      case 'failed':
        return '실패';
      case 'executing':
        return '집행 중';
      case 'distributing':
        return '분배 중';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className='pb-3'>
              <Skeleton className='mb-2 h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Skeleton className='h-40 w-full rounded-2xl' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-2/3' />
                <Skeleton className='h-8 w-full rounded-2xl' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className='py-12 text-center'>
        <div className='mb-4 text-muted-foreground'>
          <Target className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
          <p className='text-lg font-medium'>프로젝트가 없습니다</p>
          <p className='text-sm'>새로운 펀딩 프로젝트를 확인해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {projects.map(project => (
        <Card
          key={project.id}
          className='hover:shadow-apple-lg group cursor-pointer transition-all duration-200'
          onClick={() => handleProjectClick(project)}
        >
          <CardHeader className='pb-3'>
            <div className='mb-2 flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary-600'>
                  {project.title}
                </h3>
                <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                  {project.shortDescription}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {getStatusText(project.status)}
              </span>
            </div>

            <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
              <div className='flex items-center space-x-1'>
                <Users className='h-4 w-4' />
                <span>{project.backerCount}명</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Calendar className='h-4 w-4' />
                <span>
                  {project.endDate
                    ? formatDistanceToNow(new Date(project.endDate), {
                        addSuffix: true,
                        locale: ko,
                      })
                    : '종료일 미정'}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <div className='space-y-4'>
              {/* 프로젝트 이미지 */}
              {project.images.length > 0 && (
                <div className='relative h-40 overflow-hidden rounded-2xl bg-neutral-100'>
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
                  />
                  {project.isFeatured && (
                    <div className='absolute left-2 top-2 rounded-full bg-primary-600 px-2 py-1 text-xs font-medium text-white'>
                      추천
                    </div>
                  )}
                </div>
              )}

              {/* 진행률 바 */}
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>진행률</span>
                  <span className='font-medium text-foreground'>
                    {project.progress}%
                  </span>
                </div>
                <div className='bg-muted/70 h-2 w-full rounded-full'>
                  <div
                    className='h-2 rounded-full bg-primary-600 transition-all duration-300'
                    style={{ width: `${Math.min(project.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* 금액 정보 */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>모금액</span>
                  <span className='font-semibold text-foreground'>
                    {formatCurrency(project.currentAmount)}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>목표액</span>
                  <span className='text-sm text-muted-foreground'>
                    {formatCurrency(project.targetAmount)}
                  </span>
                </div>
              </div>

              {/* 태그 */}
              {project.tags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className='rounded-full bg-neutral-100 px-2 py-1 text-xs text-muted-foreground'
                    >
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className='text-muted-foreground/70 text-xs'>
                      +{project.tags.length - 3}개
                    </span>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className='pt-2'>
                <Button
                  className='w-full'
                  variant='solid'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    handleProjectClick(project);
                  }}
                >
                  {project.status === 'collecting' ? '후원하기' : '자세히 보기'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectGrid;
