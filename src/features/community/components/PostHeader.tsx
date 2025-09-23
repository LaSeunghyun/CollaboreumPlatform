import { FC } from 'react';
import { Eye, MoreVertical, Share2, Trash2, Copy } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/shadcn/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

import { getUsername } from '@/utils/typeGuards';
import { CommunityPostDetailData } from '../hooks/useCommunityPostDetail';

interface PostHeaderProps {
  post: CommunityPostDetailData;
  copiedLink: boolean;
  onCopyLink: () => void;
  onShare: (platform: 'twitter' | 'facebook' | 'kakao') => void;
  canDelete: boolean;
  onRequestDelete: () => void;
}

export const PostHeader: FC<PostHeaderProps> = ({
  post,
  copiedLink,
  onCopyLink,
  onShare,
  canDelete,
  onRequestDelete,
}) => {
  return (
    <CardHeader>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <div className='mb-3 flex items-center gap-2'>
            {post.category && <Badge variant='secondary'>{post.category}</Badge>}
            {post.isHot && <Badge variant='destructive'>HOT</Badge>}
          </div>
          <CardTitle className='mb-2 text-2xl'>{post.title || '제목 없음'}</CardTitle>
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
            <span>작성자: {getUsername(post.author)}</span>
            <span>{post.timeAgo}</span>
            <span className='flex items-center gap-1'>
              <Eye className='h-4 w-4' />
              {post.viewCount}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onCopyLink}
            className='h-8 px-3'
          >
            {copiedLink ? (
              <div className='flex items-center gap-1 text-green-600'>
                <div className='h-2 w-2 rounded-full bg-green-600' />
                복사됨
              </div>
            ) : (
              <div className='flex items-center gap-1'>
                <Copy className='h-4 w-4' />
                링크 복사
              </div>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 px-3'>
                <Share2 className='mr-1 h-4 w-4' />
                공유
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onShare('twitter')}>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 rounded bg-blue-500' />
                  트위터
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare('facebook')}>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 rounded bg-blue-600' />
                  페이스북
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare('kakao')}>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 rounded bg-yellow-400' />
                  카카오톡
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={onRequestDelete}
                  className='text-red-600 focus:text-red-600'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
