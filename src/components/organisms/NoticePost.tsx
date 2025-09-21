import React from 'react';
import { Badge } from '../ui/badge';
import { Eye, Calendar, AlertCircle } from 'lucide-react';

interface NoticePostProps {
  id: string;
  title: string;
  content: string;
  isImportant?: boolean;
  isPinned?: boolean;
  createdAt: string;
  views: number;
  onClick?: () => void;
}

export const NoticePost: React.FC<NoticePostProps> = ({
  title,
  content,
  isImportant,
  isPinned,
  createdAt,
  views,
  onClick,
}) => {
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
    <div
      className='hover:bg-surface/50 cursor-pointer border-b border-border transition-colors last:border-b-0'
      onClick={onClick}
    >
      <div className='space-y-4 p-6'>
        <div className='flex items-start gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            {isPinned && (
              <Badge
                variant='secondary'
                className='bg-indigo/10 text-xs text-indigo'
              >
                📌 고정
              </Badge>
            )}
            {isImportant && (
              <Badge
                variant='secondary'
                className='bg-red-100 text-xs text-red-700'
              >
                <AlertCircle className='mr-1 h-3 w-3' />
                중요
              </Badge>
            )}
            <Badge className='bg-indigo text-xs text-white'>공지사항</Badge>
          </div>
        </div>

        <div className='space-y-3'>
          <h3 className='line-clamp-2 text-lg font-medium transition-colors hover:text-indigo'>
            {title}
          </h3>
          <p className='line-clamp-3 leading-relaxed text-muted-foreground'>
            {content}
          </p>
        </div>

        <div className='flex items-center justify-between pt-2'>
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <div className='bg-indigo/10 flex h-6 w-6 items-center justify-center rounded-full'>
                <span className='text-xs font-medium text-indigo'>공</span>
              </div>
              <span className='font-medium'>Collaboreum 운영팀</span>
              <Badge
                variant='secondary'
                className='bg-sky/10 px-2 py-0.5 text-xs text-sky'
              >
                ✓ OFFICIAL
              </Badge>
            </div>
          </div>

          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              <span>{timeAgo(createdAt)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Eye className='h-4 w-4' />
              <span className='tabular-nums'>{views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
