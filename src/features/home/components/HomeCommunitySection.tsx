import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { LoadingState } from '@/components/organisms/States';
import { getCategoryInfo } from '@/utils/categoryUtils';
import type { CategoryList, CommunityPostSummary } from '../types';

interface HomeCommunitySectionProps {
  posts: CommunityPostSummary[];
  categories: CategoryList;
  isLoading: boolean;
  hasError: boolean;
  onReload: () => void;
  onCreatePost: () => void;
  onViewAll?: () => void;
}

export const HomeCommunitySection: React.FC<HomeCommunitySectionProps> = ({
  posts,
  categories,
  isLoading,
  hasError,
  onReload,
  onCreatePost,
  onViewAll,
}) => {
  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>커뮤니티 인기글</h2>
        <Button variant='outline' size='sm' onClick={onViewAll}>
          더보기
        </Button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <LoadingState title='커뮤니티 로딩 중...' />
          <LoadingState title='커뮤니티 로딩 중...' />
        </div>
      ) : hasError ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <MessageSquare className='h-8 w-8 text-green-600' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>
                커뮤니티 정보를 불러올 수 없습니다
              </h3>
              <p className='mb-6 text-muted-foreground'>
                서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
            <Button
              className='bg-green-600 hover:bg-green-700'
              onClick={onReload}
            >
              <MessageSquare className='mr-2 h-4 w-4' />
              새로고침
            </Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <MessageSquare className='h-8 w-8 text-green-600' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>
                아직 커뮤니티 글이 없습니다
              </h3>
              <p className='mb-6 text-muted-foreground'>
                첫 번째 글을 작성해보세요! 아티스트들과 소통하고 경험을
                공유해보세요.
              </p>
            </div>
            <Button
              className='bg-green-600 hover:bg-green-700'
              onClick={onCreatePost}
            >
              <MessageSquare className='mr-2 h-4 w-4' />첫 글 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {posts.slice(0, 4).map(post => {
            const categoryInfo = getCategoryInfo(post.category, categories);

            return (
              <Card
                key={post.id}
                className='cursor-pointer transition-shadow hover:shadow-md'
              >
                <CardContent className='p-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className={`text-xs ${categoryInfo.color}`}
                      >
                        {categoryInfo.label}
                      </Badge>
                      {post.isHot && (
                        <Badge
                          variant='secondary'
                          className='bg-red-100 text-xs text-red-700'
                        >
                          🔥 HOT
                        </Badge>
                      )}
                    </div>
                    <h3 className='line-clamp-2 font-medium'>{post.title}</h3>
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                      {post.content}
                    </p>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div className='flex items-center gap-2'>
                        <span>{post.author.name}</span>
                        {post.author.isVerified && (
                          <div className='flex h-3 w-3 items-center justify-center rounded-full bg-sky'>
                            <svg
                              className='h-2 w-2 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <span>👍 {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};
