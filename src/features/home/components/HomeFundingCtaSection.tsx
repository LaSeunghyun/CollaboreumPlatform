import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/components/ui/card';

interface HomeFundingCtaSectionProps {
  onExploreProjects: () => void;
}

export const HomeFundingCtaSection: React.FC<HomeFundingCtaSectionProps> = ({
  onExploreProjects,
}) => {
  return (
    <section className='space-y-6'>
      <div className='space-y-4 text-center'>
        <h2 className='text-3xl font-bold'>투명한 펀딩 시스템</h2>
        <p className='mx-auto max-w-3xl text-lg text-muted-foreground'>
          모든 비용 사용 내역을 공개하고, 투명한 수익 분배를 통해 신뢰할 수 있는 크리에이터 경제를 구축합니다.
        </p>
      </div>

      <Card className='border-dashed'>
        <CardContent className='space-y-6 p-12 text-center'>
          <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <TrendingUp className='h-8 w-8 text-indigo' />
          </div>
          <div>
            <h3 className='mb-2 text-xl font-semibold'>펀딩 시스템 준비 중</h3>
            <p className='mb-6 text-muted-foreground'>
              투명한 펀딩 시스템이 곧 출시됩니다.
              <br />프로젝트 집행 관리, 비용 공개, 수익 분배 기능을 제공할 예정입니다.
            </p>
          </div>
          <Button variant='indigo' onClick={onExploreProjects}>
            <TrendingUp className='mr-2 h-4 w-4' />
            프로젝트 둘러보기
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
