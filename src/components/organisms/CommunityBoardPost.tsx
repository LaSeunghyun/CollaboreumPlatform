import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import { ShareButton } from '../atoms/ShareButton';
import { useCategories } from '../../lib/api/useCategories';
import { getCategoryInfo } from '../../utils/categoryUtils';

interface CommunityBoardPostProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  category: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  isHot?: boolean;
  rank?: number;
  onClick?: () => void;
}

export const CommunityBoardPost: React.FC<CommunityBoardPostProps> = ({
  id,
  title,
  content,
  author,
  category,
  createdAt,
  views,
  likes,
  comments,
  isPinned,
  isHot,
  rank,
  onClick,
}) => {
  const { data: categories = [] } = useCategories();

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMins > 0) return `${diffMins}분 전`;
    return '방금 전';
  };

  return (
    <>
      {/* Desktop/Tablet Layout - IssueLink 스타일 */}
      <div
        className='group hidden cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50 md:block'
        onClick={onClick}
      >
        <div className='p-4'>
          <div className='flex items-start gap-4'>
            {/* 순위 표시 */}
            {rank && (
              <div className='w-8 flex-shrink-0 text-center'>
                <span className='text-sm font-medium text-gray-500'>
                  #{rank}
                </span>
              </div>
            )}

            {/* 카테고리 및 핫 배지 */}
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              {isPinned && (
                <Badge
                  variant='secondary'
                  className='bg-red-100 px-2 py-1 text-xs text-red-700'
                >
                  📌 고정
                </Badge>
              )}
              {isHot && (
                <Badge
                  variant='secondary'
                  className='bg-orange-100 px-2 py-1 text-xs text-orange-700'
                >
                  🔥 HOT
                </Badge>
              )}
              <Badge
                className={`${getCategoryInfo(category, categories).color} px-2 py-1 text-xs`}
              >
                {getCategoryInfo(category, categories).label}
              </Badge>
            </div>
          </div>

          {/* 제목과 내용 */}
          <div className='mt-3'>
            <h3 className='mb-2 line-clamp-2 text-lg font-medium transition-colors hover:text-blue-600'>
              {title}
            </h3>
            <p className='line-clamp-2 text-sm leading-relaxed text-gray-600'>
              {content}
            </p>
          </div>

          {/* 하단 정보 */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={author.avatar} />
                  <AvatarFallback className='text-xs'>
                    {author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='flex items-center gap-1'>
                  <span className='text-sm text-gray-600'>{author.name}</span>
                  {author.isVerified && (
                    <div className='flex h-3 w-3 items-center justify-center rounded-full bg-blue-500'>
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
              </div>
              <span className='text-sm text-gray-500'>
                {timeAgo(createdAt)}
              </span>
            </div>

            <div className='flex items-center gap-4 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <Eye className='h-4 w-4' />
                <span className='tabular-nums'>{views.toLocaleString()}</span>
              </div>
              <div className='flex items-center gap-1'>
                <ThumbsUp className='h-4 w-4' />
                <span className='tabular-nums'>{likes.toLocaleString()}</span>
              </div>
              <div className='flex items-center gap-1'>
                <MessageCircle className='h-4 w-4' />
                <span className='tabular-nums'>
                  {comments.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - IssueLink 스타일 */}
      <div
        className='group cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50 md:hidden'
        onClick={onClick}
      >
        <div className='p-4'>
          <div className='flex items-start gap-3'>
            {/* 순위 표시 */}
            {rank && (
              <div className='w-6 flex-shrink-0 text-center'>
                <span className='text-xs font-medium text-gray-500'>
                  #{rank}
                </span>
              </div>
            )}

            <div className='min-w-0 flex-1'>
              {/* 카테고리 및 핫 배지 */}
              <div className='mb-2 flex flex-wrap items-center gap-1'>
                {isPinned && (
                  <Badge
                    variant='secondary'
                    className='bg-red-100 px-1.5 py-0.5 text-xs text-red-700'
                  >
                    📌
                  </Badge>
                )}
                {isHot && (
                  <Badge
                    variant='secondary'
                    className='bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700'
                  >
                    🔥
                  </Badge>
                )}
                <Badge
                  className={`${getCategoryInfo(category, categories).color} px-1.5 py-0.5 text-xs`}
                >
                  {getCategoryInfo(category, categories).label}
                </Badge>
              </div>

              {/* 제목 */}
              <h3 className='mb-2 line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-blue-600'>
                {title}
              </h3>

              {/* 하단 정보 */}
              <div className='flex items-center justify-between text-xs text-gray-500'>
                <div className='flex items-center gap-2'>
                  <span>{author.name}</span>
                  {author.isVerified && (
                    <div className='flex h-3 w-3 items-center justify-center rounded-full bg-blue-500'>
                      <svg
                        className='h-1.5 w-1.5 text-white'
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
                  <span>·</span>
                  <span>{timeAgo(createdAt)}</span>
                </div>

                <div className='flex items-center gap-3'>
                  <span className='flex items-center gap-1'>
                    <Eye className='h-3 w-3' />
                    <span className='tabular-nums'>
                      {views > 999 ? `${Math.floor(views / 1000)}k` : views}
                    </span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <MessageCircle className='h-3 w-3' />
                    <span className='tabular-nums'>{comments}</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <ThumbsUp className='h-3 w-3' />
                    <span className='tabular-nums'>{likes}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
