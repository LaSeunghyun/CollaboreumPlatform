import { FC } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CommentComposer } from '@/features/community/components/CommentComposer';
import { CommentThread } from '@/features/community/components/CommentThread';
import { DeletePostDialog } from '@/features/community/components/DeletePostDialog';
import { PostHeader } from '@/features/community/components/PostHeader';
import { ReactionBar } from '@/features/community/components/ReactionBar';
import { useCommunityPostDetail } from '@/features/community/hooks/useCommunityPostDetail';

interface CommunityPostDetailProps {
  postId: string;
  onBack?: () => void;
}

export const CommunityPostDetail: FC<CommunityPostDetailProps> = ({
  postId,
  onBack,
}) => {
  const { user } = useAuth();
  const {
    post,
    isLoading,
    error,
    state: { comment, replyingTo, replyContent, copiedLink, showDeleteDialog },
    status: {
      isLiked,
      isDisliked,
      isLiking,
      isDisliking,
      isSubmittingComment,
      isSubmittingReply,
      isDeletingPost,
    },
    setComment,
    setReplyingTo,
    setReplyContent,
    setShowDeleteDialog,
    actions: {
      handleBack,
      handleCopyLink,
      handleSocialShare,
      handleLike,
      handleDislike,
      handleCommentSubmit,
      handleCommentDelete,
      handleReplySubmit,
      cancelReply,
      handleDeletePost,
    },
    permissions: { canDeleteComment, canDeletePost },
  } = useCommunityPostDetail(postId, { onBack });

  const handleCommentChange = (value: string) => setComment(value);
  const handleReplyChange = (value: string) => setReplyContent(value);
  const handleStartReply = (commentId: string) => setReplyingTo(commentId);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <span className='text-gray-500'>게시글을 불러오는 중입니다...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='space-y-4 text-center'>
          <p className='text-gray-600'>{error}</p>
          <Button onClick={handleBack} variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' /> 뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='space-y-4 text-center'>
          <p className='text-gray-600'>게시글 정보를 찾을 수 없습니다.</p>
          <Button onClick={handleBack} variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' /> 뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  const commentsCount =
    typeof post.replies === 'number' ? post.replies : post.comments.length;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-4xl px-4'>
        <Button onClick={handleBack} variant='outline' className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          이전 페이지로 돌아가기
        </Button>

        <Card className='mb-6'>
          <PostHeader
            post={post}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
            onShare={handleSocialShare}
            canDelete={canDeletePost}
            onRequestDelete={() => setShowDeleteDialog(true)}
          />
          <CardContent>
            <div className='prose mb-6 max-w-none'>
              <p className='whitespace-pre-wrap text-gray-700'>
                {post.content || '내용 없음'}
              </p>
            </div>

            {post.images.length > 0 && (
              <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`이미지 ${index + 1}`}
                    className='h-64 w-full rounded-lg object-cover'
                  />
                ))}
              </div>
            )}

            <ReactionBar
              likes={post.likes}
              dislikes={post.dislikes}
              commentsCount={commentsCount}
              isLiked={isLiked}
              isDisliked={isDisliked}
              isLiking={isLiking}
              isDisliking={isDisliking}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>댓글 ({commentsCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {user && (
              <CommentComposer
                user={{ name: user.name, avatar: user.avatar }}
                value={comment}
                onChange={handleCommentChange}
                onSubmit={handleCommentSubmit}
                isSubmitting={isSubmittingComment}
              />
            )}

            <CommentThread
              comments={post.comments}
              replyingTo={replyingTo}
              replyContent={replyContent}
              allowReply={Boolean(user)}
              onReplyChange={handleReplyChange}
              onReplySubmit={handleReplySubmit}
              onDeleteComment={handleCommentDelete}
              onStartReply={handleStartReply}
              onCancelReply={cancelReply}
              canDeleteComment={canDeleteComment}
              isSubmittingReply={isSubmittingReply}
            />
          </CardContent>
        </Card>
      </div>

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeletePost}
        isDeleting={isDeletingPost}
      />
    </div>
  );
};
