import { ChangeEvent, FC, FormEvent } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { getFirstChar, getUsername } from '@/utils/typeGuards';
import { CommunityCommentNode } from '../hooks/useCommunityPostDetail';

interface CommentThreadProps {
  comments: CommunityCommentNode[];
  replyingTo: string | null;
  replyContent: string;
  allowReply: boolean;
  onReplyChange: (value: string) => void;
  onReplySubmit: (event: FormEvent<HTMLFormElement>, parentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  canDeleteComment: (authorId: string) => boolean;
  isSubmittingReply: boolean;
}

export const CommentThread: FC<CommentThreadProps> = ({
  comments,
  replyingTo,
  replyContent,
  allowReply,
  onReplyChange,
  onReplySubmit,
  onDeleteComment,
  onStartReply,
  onCancelReply,
  canDeleteComment,
  isSubmittingReply,
}) => {
  if (!comments.length) {
    return (
      <p className='py-8 text-center text-gray-500'>
        아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
      </p>
    );
  }

  const renderReplies = (replies: CommunityCommentNode[]) => {
    if (!replies.length) {
      return null;
    }

    return (
      <div className='ml-8 mt-3 space-y-3 border-l-2 border-gray-200 pl-4'>
        {replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            replyingTo={replyingTo}
            replyContent={replyContent}
            allowReply={allowReply}
            onReplyChange={onReplyChange}
            onReplySubmit={onReplySubmit}
            onDeleteComment={onDeleteComment}
            onStartReply={onStartReply}
            onCancelReply={onCancelReply}
            canDeleteComment={canDeleteComment}
            isSubmittingReply={isSubmittingReply}
            renderReplies={renderReplies}
          />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replyingTo={replyingTo}
          replyContent={replyContent}
          allowReply={allowReply}
          onReplyChange={onReplyChange}
          onReplySubmit={onReplySubmit}
          onDeleteComment={onDeleteComment}
          onStartReply={onStartReply}
          onCancelReply={onCancelReply}
          canDeleteComment={canDeleteComment}
          isSubmittingReply={isSubmittingReply}
          renderReplies={renderReplies}
        />
      ))}
    </div>
  );
};

interface CommentItemProps {
  comment: CommunityCommentNode;
  replyingTo: string | null;
  replyContent: string;
  allowReply: boolean;
  onReplyChange: (value: string) => void;
  onReplySubmit: (event: FormEvent<HTMLFormElement>, parentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  canDeleteComment: (authorId: string) => boolean;
  isSubmittingReply: boolean;
  renderReplies: (replies: CommunityCommentNode[]) => JSX.Element | null;
}

const CommentItem: FC<CommentItemProps> = ({
  comment,
  replyingTo,
  replyContent,
  allowReply,
  onReplyChange,
  onReplySubmit,
  onDeleteComment,
  onStartReply,
  onCancelReply,
  canDeleteComment,
  isSubmittingReply,
  renderReplies,
}) => {
  const handleReplySubmit = (event: FormEvent<HTMLFormElement>) => {
    onReplySubmit(event, comment.id);
  };

  const handleReplyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onReplyChange(event.target.value);
  };

  return (
    <div className='flex gap-3 rounded-lg bg-gray-50 p-4'>
      <Avatar className='h-10 w-10'>
        <AvatarFallback>{getFirstChar(comment.author || 'U')}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>
              {getUsername(comment.author || 'Unknown')}
            </span>
            <span className='text-xs text-gray-500'>
              {comment.timeAgo || '방금 전'}
            </span>
          </div>
          {canDeleteComment(comment.authorId || '') && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDeleteComment(comment.id)}
              className='h-auto p-1 text-red-500 hover:text-red-700'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
        <p className='text-gray-700'>{comment.content || ''}</p>

        {allowReply && (
          <div className='mt-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onStartReply(comment.id)}
              className='text-sm text-blue-600 hover:text-blue-700'
            >
              답글 달기
            </Button>
          </div>
        )}

        {replyingTo === comment.id && (
          <form onSubmit={handleReplySubmit} className='mt-3'>
            <div className='flex gap-2'>
              <Input
                value={replyContent}
                onChange={handleReplyChange}
                placeholder={`${getUsername(comment.author || 'Unknown')}님에게 답글 달기...`}
                maxLength={500}
                disabled={isSubmittingReply}
                className='flex-1'
              />
              <Button
                type='submit'
                disabled={!replyContent.trim() || isSubmittingReply}
                size='sm'
              >
                {isSubmittingReply ? '작성 중...' : '답글'}
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onCancelReply}
              >
                취소
              </Button>
            </div>
            <div className='mt-1 text-right text-xs text-gray-500'>
              {replyContent.length}/500
            </div>
          </form>
        )}

        {renderReplies(comment.replies)}
      </div>
    </div>
  );
};
