import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { LoadingState } from '@/components/organisms/States';
import type { NoticeSummary } from '../types';

interface HomeNoticesSectionProps {
  notices: NoticeSummary[];
  isLoading: boolean;
  hasError: boolean;
  onReload: () => void;
  onViewAll?: () => void;
}

export const HomeNoticesSection: React.FC<HomeNoticesSectionProps> = ({
  notices,
  isLoading,
  hasError,
  onReload,
  onViewAll,
}) => {
  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>중요 공지사항</h2>
        <Button variant='outline' size='sm' onClick={onViewAll}>
          전체보기
        </Button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <LoadingState title='공지사항 로딩 중...' />
          <LoadingState title='공지사항 로딩 중...' />
        </div>
      ) : hasError ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
              <AlertCircle className='h-8 w-8 text-yellow-600' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>
                공지사항을 불러올 수 없습니다
              </h3>
              <p className='mb-6 text-muted-foreground'>
                서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
            <Button
              className='bg-yellow-600 hover:bg-yellow-700'
              onClick={onReload}
            >
              <AlertCircle className='mr-2 h-4 w-4' />
              새로고침
            </Button>
          </CardContent>
        </Card>
      ) : notices.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
              <AlertCircle className='h-8 w-8 text-yellow-600' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>
                아직 공지지사항이 없습니다
              </h3>
              <p className='mb-6 text-muted-foreground'>
                새로운 소식과 업데이트를 기다리고 있습니다. 곧 유용한 정보를
                제공해드릴 예정입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {notices.slice(0, 2).map(notice => (
            <Card
              key={notice.id}
              className='cursor-pointer border-l-4 border-l-indigo transition-all duration-200 hover:shadow-md'
            >
              <CardContent className='p-5'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-indigo text-xs text-white'>
                      공지사항
                    </Badge>
                    {notice.isImportant && (
                      <Badge
                        variant='secondary'
                        className='bg-red-100 text-xs text-red-700'
                      >
                        중요
                      </Badge>
                    )}
                    {notice.isPinned && (
                      <Badge
                        variant='secondary'
                        className='bg-yellow-100 text-xs text-yellow-700'
                      >
                        📌
                      </Badge>
                    )}
                  </div>
                  <h3 className='line-clamp-2 font-medium'>{notice.title}</h3>
                  <p className='line-clamp-2 text-sm text-muted-foreground'>
                    {notice.content}
                  </p>
                  <div className='flex items-center justify-between pt-2 text-xs text-muted-foreground'>
                    <span className='font-medium'>Collaboreum 운영팀</span>
                    <div className='flex items-center gap-3'>
                      <span>조회 {notice.views.toLocaleString()}</span>
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString(
                          'ko-KR',
                          {
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
