import { Target } from 'lucide-react';

export const EmptyState = () => (
    <div className='py-20 text-center'>
        <div className='glass-morphism rounded-3xl p-12'>
            <Target className='mx-auto mb-6 h-20 w-20 text-muted-foreground' />
            <h3 className='mb-4 text-2xl font-semibold text-foreground'>
                검색 결과가 없습니다
            </h3>
            <p className='text-lg text-muted-foreground'>
                다른 검색어나 카테고리를 시도해보세요
            </p>
        </div>
    </div>
);
