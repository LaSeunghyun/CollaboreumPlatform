import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { CommunityPost } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface PostCardProps {
  post: CommunityPost;
  onPostClick?: (post: CommunityPost) => void;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostClick,
  onLike,
  onDislike,
  onBookmark,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onReport,
  showActions = true,
  compact = false,
}) => {
  const handleLike = () => {
    if (onLike) onLike(post.id);
  };

  const handleDislike = () => {
    if (onDislike) onDislike(post.id);
  };

  const handleBookmark = () => {
    if (onBookmark) onBookmark(post.id);
  };

  const handleComment = () => {
    if (onComment) onComment(post.id);
  };

  const handleShare = () => {
    if (onShare) onShare(post.id);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(post.id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(post.id);
  };

  const handleReport = () => {
    if (onReport) onReport(post.id);
  };

  const handleCardClick = () => {
    if (onPostClick) onPostClick(post);
  };

  return (
    <Card
      className='cursor-pointer transition-shadow duration-200 hover:shadow-md'
      onClick={handleCardClick}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100'>
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className='h-10 w-10 rounded-full object-cover'
                />
              ) : (
                <span className='text-sm font-semibold text-primary-600'>
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className='flex items-center space-x-2'>
                <h4 className='font-semibold text-gray-900'>
                  {post.author.name}
                </h4>
                {post.author.isVerified && (
                  <span className='text-xs text-primary-600'>✓</span>
                )}
              </div>
              <p className='text-sm text-gray-500'>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {post.isPinned && (
              <span className='rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-600'>
                고정
              </span>
            )}
            {post.isHot && (
              <span className='rounded-full bg-danger-100 px-2 py-1 text-xs text-danger-600'>
                인기
              </span>
            )}
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => {}}
              aria-label='더보기'
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-3'>
          <div>
            <h3 className='mb-2 line-clamp-2 text-lg font-semibold text-gray-900'>
              {post.title}
            </h3>
            <p className='line-clamp-3 text-gray-700'>{post.content}</p>
          </div>

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {showActions && (
            <div className='flex items-center justify-between border-t border-gray-100 pt-3'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${
                    post.isLiked ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <ThumbsUp className='h-4 w-4' />
                  <span>{post.likes}</span>
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleDislike}
                  className={`flex items-center space-x-1 ${
                    post.isDisliked ? 'text-danger-600' : 'text-gray-500'
                  }`}
                >
                  <ThumbsDown className='h-4 w-4' />
                  <span>{post.dislikes}</span>
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleComment}
                  className='flex items-center space-x-1 text-gray-500'
                >
                  <MessageCircle className='h-4 w-4' />
                  <span>{post.comments}</span>
                </Button>

                <div className='flex items-center space-x-1 text-gray-500'>
                  <Eye className='h-4 w-4' />
                  <span>{post.views}</span>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBookmark}
                  className={`${
                    post.isBookmarked ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <Bookmark className='h-4 w-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleShare}
                  className='text-gray-500'
                >
                  <Share2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
