import { Card } from '@/shared/ui';

export const ProjectCardSkeleton = () => (
    <Card className='overflow-hidden rounded-3xl'>
        <div className='aspect-video animate-pulse bg-muted' />
        <CardContent className='p-6'>
            <div className='mb-4 flex items-center gap-4'>
                <div className='h-12 w-12 animate-pulse rounded-full bg-muted' />
                <div className='flex-1'>
                    <div className='mb-2 h-4 animate-pulse rounded bg-muted' />
                    <div className='h-3 w-2/3 animate-pulse rounded bg-muted' />
                </div>
            </div>
            <div className='mb-4 space-y-2'>
                <div className='h-3 animate-pulse rounded bg-muted' />
                <div className='h-3 w-3/4 animate-pulse rounded bg-muted' />
            </div>
            <div className='mb-6 flex gap-2'>
                <div className='h-6 w-16 animate-pulse rounded bg-muted' />
                <div className='h-6 w-20 animate-pulse rounded bg-muted' />
                <div className='h-6 w-14 animate-pulse rounded bg-muted' />
            </div>
            <div className='mb-6 grid grid-cols-3 gap-4'>
                <div className='text-center'>
                    <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
                    <div className='h-3 animate-pulse rounded bg-muted' />
                </div>
                <div className='text-center'>
                    <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
                    <div className='h-3 animate-pulse rounded bg-muted' />
                </div>
                <div className='text-center'>
                    <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
                    <div className='h-3 animate-pulse rounded bg-muted' />
                </div>
            </div>
            <div className='flex gap-3'>
                <div className='h-10 flex-1 animate-pulse rounded-xl bg-muted' />
                <div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
                <div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
            </div>
        </CardContent>
    </Card>
);
