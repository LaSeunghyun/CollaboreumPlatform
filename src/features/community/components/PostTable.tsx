import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';

import { CommunityPost } from '../types';

interface PostTableProps {
  posts: CommunityPost[];
  onPostClick?: (post: CommunityPost) => void;
}

const PostTable: React.FC<PostTableProps> = ({ posts, onPostClick }) => {
  const getViews = (post: CommunityPost) => {
    if (typeof post.views === 'number') {
      return post.views;
    }

    if (typeof post.viewCount === 'number') {
      return post.viewCount;
    }

    return 0;
  };

  const resolvedPosts = useMemo(() => {
    return posts.map(post => {
      const commentCount =
        typeof post.comments === 'number'
          ? post.comments
          : typeof post.replies === 'number'
            ? post.replies
            : 0;

      return {
        ...post,
        commentCount,
      };
    });
  }, [posts]);

  const renderOrder = (post: CommunityPost, index: number) => {
    if (post.isPinned) {
      return <span className='font-semibold text-primary-600'>공지</span>;
    }

    return resolvedPosts.length - index;
  };

  const formatDate = (value: string) => {
    try {
      return format(new Date(value), 'yy/MM/dd HH:mm', { locale: ko });
    } catch (error) {
      return value;
    }
  };

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <Table>
        <TableHeader className='bg-gray-50'>
          <TableRow>
            <TableHead className='w-20 text-center text-sm font-medium text-gray-600'>
              번호
            </TableHead>
            <TableHead className='text-sm font-medium text-gray-600'>제목</TableHead>
            <TableHead className='w-32 text-center text-sm font-medium text-gray-600'>
              글쓴이
            </TableHead>
            <TableHead className='w-32 text-center text-sm font-medium text-gray-600'>
              작성일
            </TableHead>
            <TableHead className='w-20 text-center text-sm font-medium text-gray-600'>
              조회
            </TableHead>
            <TableHead className='w-20 text-center text-sm font-medium text-gray-600'>
              추천
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resolvedPosts.map((post, index) => (
            <TableRow
              key={post.id}
              className='transition-colors hover:bg-gray-50'
              data-post-id={post.id}
            >
              <TableCell className='text-center text-sm text-gray-500'>
                {renderOrder(post, index)}
              </TableCell>
              <TableCell className='max-w-0'>
                <div className='flex items-center gap-2'>
                  {post.category && (
                    <Badge variant='outline' size='sm' className='shrink-0 text-xs'>
                      {post.category}
                    </Badge>
                  )}
                  <Link
                    to={`/community/${post.id}`}
                    onClick={() => onPostClick?.(post)}
                    className='truncate text-sm font-medium text-gray-900 hover:text-primary-600'
                  >
                    {post.title}
                  </Link>
                  {post.commentCount > 0 && (
                    <span className='text-xs text-primary-600'>[{post.commentCount}]</span>
                  )}
                  {post.isHot && (
                    <Badge
                      variant='outline'
                      tone='danger'
                      size='sm'
                      className='shrink-0 text-xs'
                    >
                      인기
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className='text-center text-sm text-gray-600'>
                {post.author?.name || post.author?.username || '익명'}
              </TableCell>
              <TableCell className='text-center text-sm text-gray-600'>
                {formatDate(post.createdAt)}
              </TableCell>
              <TableCell className='text-center text-sm text-gray-600'>
                {getViews(post).toLocaleString()}
              </TableCell>
              <TableCell className='text-center text-sm text-gray-600'>
                {post.likes.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PostTable;
