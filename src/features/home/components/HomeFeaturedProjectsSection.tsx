import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FundingProjectCard } from '@/components/molecules/FundingProjectCard';
import { SkeletonGrid } from '@/components/organisms/States';
import type { ProjectSummary } from '../types';

interface HomeFeaturedProjectsSectionProps {
  projects: ProjectSummary[];
  isLoading: boolean;
  hasError: boolean;
  onReload: () => void;
  onProjectSelect: (projectId: string) => void;
  onCreateProject: () => void;
}

export const HomeFeaturedProjectsSection: React.FC<
  HomeFeaturedProjectsSectionProps
> = ({
  projects,
  isLoading,
  hasError,
  onReload,
  onProjectSelect,
  onCreateProject,
}) => {
  return (
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

      {isLoading ? (
        <SkeletonGrid count={3} cols={3} />
      ) : hasError ? (
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
                서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
            <Button className='hover:bg-sky/90 bg-sky' onClick={onReload}>
              <TrendingUp className='mr-2 h-4 w-4' />
              새로고침
            </Button>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
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
                첫 번째 프로젝트를 시작해보세요! 창의적인 아이디어를 현실로
                만들어보세요.
              </p>
            </div>
            <Button
              className='hover:bg-sky/90 bg-sky'
              onClick={onCreateProject}
            >
              <TrendingUp className='mr-2 h-4 w-4' />
              프로젝트 시작하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3'>
          {projects.slice(0, 3).map(project => (
            <FundingProjectCard
              key={project.id}
              {...project}
              onClick={() => onProjectSelect(project.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
