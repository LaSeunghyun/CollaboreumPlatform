import { Card, CardContent } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui';

export const FanProfileLoading = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl space-y-6 p-6'>
        <Card>
          <CardContent className='space-y-4 p-6'>
            <Skeleton className='h-10 w-1/3' />
            <Skeleton className='h-6 w-1/2' />
            <Skeleton className='h-16 w-full' />
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <Card>
            <CardContent className='space-y-4 p-6'>
              <Skeleton className='h-6 w-1/4' />
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-2/3' />
            </CardContent>
          </Card>
          <Card>
            <CardContent className='space-y-4 p-6'>
              <Skeleton className='h-6 w-1/4' />
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-2/3' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
