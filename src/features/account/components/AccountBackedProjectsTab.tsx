import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { FundingProjectCard } from '@/components/molecules/FundingProjectCard';
import { ErrorState, SkeletonGrid } from '@/components/organisms/States';
import { Heart } from 'lucide-react';

interface AccountBackedProjectsTabProps {
  backings: Array<any>;
  isLoading: boolean;
  error: unknown;
}

export const AccountBackedProjectsTab: React.FC<AccountBackedProjectsTabProps> = ({
  backings,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return <SkeletonGrid count={3} cols={3} />;
  }

  if (error) {
    return <ErrorState title='후원 정보를 불러올 수 없습니다' />;
  }

  if (backings.length === 0) {
    return (
      <Card className='border-dashed'>
        <CardContent className='space-y-6 p-12 text-center'>
          <div className='bg-sky/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Heart className='h-8 w-8 text-sky' />
          </div>
          <div>
            <h3 className='mb-2 text-xl font-semibold'>아직 후원한 프로젝트가 없습니다</h3>
            <p className='mb-6 text-muted-foreground'>
              마음에 드는 프로젝트를 찾아서 후원해보세요.
              <br />창의적인 프로젝트들이 여러분을 기다리고 있습니다!
            </p>
          </div>
          <Button
            className='bg-sky hover:bg-sky/90'
            onClick={() => (window.location.href = '/funding')}
          >
            <Heart className='mr-2 h-4 w-4' />프로젝트 둘러보기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {backings.map(backing => (
        <FundingProjectCard key={backing.project.id} {...backing.project} />
      ))}
    </div>
  );
};
