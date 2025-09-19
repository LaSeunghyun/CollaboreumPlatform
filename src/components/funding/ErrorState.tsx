import { Target } from 'lucide-react';
import { ErrorStateProps } from '@/types/funding';
import { Button } from '@/shared/ui';

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
    <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
            <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
                <Target className='h-10 w-10 text-destructive' />
            </div>
            <h3 className='mb-2 text-xl font-semibold text-foreground'>
                데이터를 불러올 수 없습니다
            </h3>
            <p className='mb-6 text-muted-foreground' aria-live='polite'>
                {error}
            </p>
            <Button onClick={onRetry} className='hover:bg-primary/90 bg-primary'>
                다시 시도
            </Button>
        </div>
    </div>
);
