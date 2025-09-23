import { Eye } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';

import { FanProfileBacking } from '../hooks/useFanProfile';

interface FanProfileBackingsTableProps {
  backings: FanProfileBacking[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onViewProject?: (projectId: string) => void;
}

export const FanProfileBackingsTable = ({
  backings,
  isLoading,
  error,
  onRetry,
  onViewProject,
}: FanProfileBackingsTableProps) => {
  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error as Error} onRetry={onRetry} />;
  }

  if (backings.length === 0) {
    return <p className='text-sm text-gray-500'>후원 내역이 없습니다.</p>;
  }

  return (
    <div className='space-y-4'>
      {backings.map(pledge => (
        <Card key={pledge.id} className='transition-shadow hover:shadow-md'>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h4 className='mb-2 text-lg font-semibold text-gray-900'>
                  {pledge.projectTitle}
                </h4>
                <p className='mb-2 text-sm text-gray-600'>
                  by {pledge.artistName}
                </p>
                {pledge.rewardTitle && (
                  <p className='mb-2 text-sm text-gray-700'>
                    {pledge.rewardTitle}
                  </p>
                )}
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <span>후원일: {pledge.pledgeDateLabel}</span>
                  <span>•</span>
                  <span className='font-medium text-gray-900'>
                    {pledge.formattedAmount}
                  </span>
                </div>
              </div>
              <div className='flex flex-col items-end space-y-2'>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${pledge.statusColorClass}`}
                >
                  {pledge.statusText}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onViewProject?.(pledge.projectId)}
                >
                  <Eye className='mr-1 h-4 w-4' />
                  보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
