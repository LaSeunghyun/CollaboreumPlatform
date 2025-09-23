import { FC } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

import { Button } from '@/shared/ui/Button';

interface ReactionBarProps {
  likes: number;
  dislikes: number;
  commentsCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isLiking: boolean;
  isDisliking: boolean;
  onLike: () => void;
  onDislike: () => void;
}

export const ReactionBar: FC<ReactionBarProps> = ({
  likes,
  dislikes,
  commentsCount,
  isLiked,
  isDisliked,
  isLiking,
  isDisliking,
  onLike,
  onDislike,
}) => {
  return (
    <div className='flex items-center gap-4 border-t border-gray-200 py-4'>
      <Button
        variant='ghost'
        onClick={onLike}
        disabled={isLiking}
        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        좋아요 {likes}
      </Button>
      <Button
        variant='ghost'
        onClick={onDislike}
        disabled={isDisliking}
        className={`flex items-center gap-2 ${isDisliked ? 'text-blue-500' : ''}`}
      >
        <svg
          className={`h-5 w-5 ${isDisliked ? 'fill-current' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 13l3 3 7-7'
          />
        </svg>
        싫어요 {dislikes}
      </Button>
      <div className='flex items-center gap-2 text-gray-500'>
        <MessageCircle className='h-5 w-5' />
        댓글 {commentsCount}
      </div>
    </div>
  );
};
