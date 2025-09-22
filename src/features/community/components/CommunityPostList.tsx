// 커뮤니티 게시글 목록 컴포넌트 (API-first + UI 규칙 + 테스트)
import React from 'react';
import {
  useCommunityPosts,
  useLikeCommunityPost,
  type CommunityPostListQuery,
} from '../index';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  // SkeletonCard,
  ProjectListSkeleton,
  EmptyState,
  ErrorMessage,
} from '../../../shared/ui';
import { Heart, MessageCircle, Eye, Calendar, User, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CommunityPostListProps {
  query?: CommunityPostListQuery;
  onPostClick?: (postId: string) => void;
  onCreatePost?: () => void;
}

export function CommunityPostList({
  query = {},
  onPostClick,
  onCreatePost,
}: CommunityPostListProps) {
  const { data, isLoading, error, refetch } = useCommunityPosts(query);

  const likePostMutation = useLikeCommunityPost();

  // 로딩 상태
  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  // 에러 상태
  if (error) {
    return <ErrorMessage error={error} onRetry={() => refetch()} />;
  }

  // 빈 상태
  if (!data || !(data as any)?.posts || (data as any).posts.length === 0) {
    return (
      <EmptyState
        title='게시글이 없습니다'
        description='첫 번째 게시글을 작성해보세요.'
        action={
          onCreatePost
            ? {
                label: '게시글 작성',
                onClick: onCreatePost,
              }
            : undefined
        }
      />
    );
  }

  const handlePostClick = (postId: string) => {
    onPostClick?.(postId);
  };

  const handleLikeClick = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likePostMutation.mutate(postId);
  };

  return (
    <div className='space-y-4'>
      {(data as any).posts.map((post: any) => (
        <Card
          key={post.id}
          className='cursor-pointer transition-shadow hover:shadow-md'
          onClick={() => handlePostClick(post.id)}
        >
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center space-x-2'>
                  {post.isPinned && (
                    <Badge variant='destructive' size='sm'>
                      고정
                    </Badge>
                  )}
                  {post.isHot && (
                    <Badge variant='default' size='sm'>
                      인기
                    </Badge>
                  )}
                  <Badge variant='outline' size='sm'>
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className='line-clamp-2 text-lg'>
                  {post.title}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <p className='mb-4 line-clamp-2 text-sm text-neutral-600'>
              {post.content}
            </p>

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1'>
                {post.tags.map((tag: any) => (
                  <Badge key={tag} variant='secondary' size='sm'>
                    <Tag className='mr-1 h-3 w-3' />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 작성자 정보 */}
            <div className='mb-4 flex items-center space-x-2 text-sm text-neutral-500'>
              <User className='h-4 w-4' />
              <span>{post.author.name}</span>
              <span>•</span>
              <Calendar className='h-4 w-4' />
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            {/* 통계 */}
            <div className='flex items-center space-x-4 text-sm text-neutral-500'>
              <Button
                variant='ghost'
                size='sm'
                onClick={e => handleLikeClick(post.id, e)}
                className='h-8 px-2'
              >
                <Heart className='mr-1 h-4 w-4' />
                {post.likes}
              </Button>

              <Button variant='ghost' size='sm' className='h-8 px-2'>
                <MessageCircle className='mr-1 h-4 w-4' />
                {post.replies}
              </Button>

              <Button variant='ghost' size='sm' className='h-8 px-2'>
                <Eye className='mr-1 h-4 w-4' />
                {post.views}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
