import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { FundingProjectCard } from '@/components/molecules/FundingProjectCard';
import { ErrorState, SkeletonGrid } from '@/components/organisms/States';
import { Plus } from 'lucide-react';

interface AccountProjectsTabProps {
  projects: Array<any>;
  isLoading: boolean;
  error: unknown;
  onCreateProject: () => void;
}

export const AccountProjectsTab: React.FC<AccountProjectsTabProps> = ({
  projects,
  isLoading,
  error,
  onCreateProject,
}) => {
  if (isLoading) {
    return <SkeletonGrid count={3} cols={3} />;
  }

  if (error) {
    return <ErrorState title='프로젝트 정보를 불러올 수 없습니다' />;
  }

  if (projects.length === 0) {
    return (
      <Card className='border-dashed'>
        <CardContent className='space-y-6 p-12 text-center'>
          <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Plus className='h-8 w-8 text-indigo' />
          </div>
          <div>
            <h3 className='mb-2 text-xl font-semibold'>아직 프로젝트가 없습니다</h3>
            <p className='mb-6 text-muted-foreground'>
              창의적인 아이디어를 현실로 만들어보세요.
              <br />첫 번째 프로젝트를 시작해보세요!
            </p>
          </div>
          <Button variant='indigo' onClick={onCreateProject}>
            <Plus className='mr-2 h-4 w-4' />첫 프로젝트 만들기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {projects.map(project => (
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
          <Button variant='indigo' onClick={onCreateProject}>
            프로젝트 만들기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
