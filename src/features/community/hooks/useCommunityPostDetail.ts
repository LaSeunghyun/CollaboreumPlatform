import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useCreateComment, useCreateReply, useDeleteComment } from '@/lib/api/useCommunityComments';
import { usePostReaction } from '@/lib/api/useCommunityReactions';
import { communityPostAPI } from '@/services/api/community';
import { useDeleteCommunityPost } from '@/features/community/hooks/useCommunityPosts';

export interface CommunityCommentNode {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timeAgo: string;
  createdAt: Date;
  replies: CommunityCommentNode[];
  parentId?: string;
}

export interface CommunityPostDetailData {
  id: string;
  title: string;
  category: string;
  author: string;
  authorId: string;
  content: string;
  images: string[];
  timeAgo: string;
  replies: number;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isHot: boolean;
  viewCount: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  comments: CommunityCommentNode[];
}

interface UseCommunityPostDetailOptions {
  onBack?: () => void;
}

const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

const safeDate = (value: unknown): Date => {
  if (value instanceof Date && isValidDate(value)) {
    return value;
  }

  const parsed = value ? new Date(value as string) : new Date();
  return isValidDate(parsed) ? parsed : new Date();
};

const toStringSafe = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const transformComments = (comments: unknown[]): CommunityCommentNode[] => {
  if (!Array.isArray(comments)) return [];

  return comments
    .filter(comment => comment && typeof comment === 'object')
    .map(comment => {
      const commentRecord = comment as Record<string, unknown>;
      const createdAt = safeDate(commentRecord.createdAt);

      const replies = Array.isArray(commentRecord.replies)
        ? transformComments(commentRecord.replies)
        : [];

      const authorField = commentRecord.author;
      const authorName =
        typeof authorField === 'string'
          ? authorField
          : typeof authorField === 'object' && authorField
          ? (authorField as Record<string, unknown>).name ||
            (authorField as Record<string, unknown>).username ||
            toStringSafe((authorField as Record<string, unknown>).id)
          : toStringSafe(commentRecord.authorName);

      const authorId =
        toStringSafe(commentRecord.authorId) ||
        (typeof authorField === 'string'
          ? authorField
          : toStringSafe((authorField as Record<string, unknown>).id));

      return {
        id: toStringSafe(commentRecord.id || commentRecord._id),
        author: authorName || 'Unknown',
        authorId,
        content: toStringSafe(commentRecord.content),
        timeAgo:
          toStringSafe(commentRecord.timeAgo) ||
          formatDistanceToNow(createdAt, { addSuffix: true, locale: ko }),
        createdAt,
        replies,
        parentId: commentRecord.parentId
          ? toStringSafe(commentRecord.parentId)
          : undefined,
      };
    });
};

const extractPostDetail = (
  data: Record<string, unknown>,
  postId: string,
): CommunityPostDetailData => {
  const createdAt = safeDate(data.createdAt);
  const updatedAt = safeDate(data.updatedAt);

  const authorField = data.author;
  const authorName =
    typeof authorField === 'string'
      ? authorField
      : typeof authorField === 'object' && authorField
      ? ((authorField as Record<string, unknown>).name as string) || 'Unknown'
      : 'Unknown';

  const authorId =
    typeof authorField === 'string'
      ? authorField
      : toStringSafe((authorField as Record<string, unknown>).id || authorField);

  const likesRaw = data.likes;
  const dislikesRaw = data.dislikes;

  const likes = Array.isArray(likesRaw)
    ? likesRaw.length
    : typeof likesRaw === 'number'
    ? likesRaw
    : 0;

  const dislikes = Array.isArray(dislikesRaw)
    ? dislikesRaw.length
    : typeof dislikesRaw === 'number'
    ? dislikesRaw
    : 0;

  const replies = Array.isArray(data.comments)
    ? (data.comments as unknown[]).length
    : (data.replies as number) || 0;

  return {
    id: toStringSafe(data.id || data._id) || postId,
    title: toStringSafe(data.title),
    category: toStringSafe(data.category),
    author: authorName,
    authorId,
    content: toStringSafe(data.content),
    images: Array.isArray(data.images)
      ? (data.images as string[])
      : [],
    timeAgo: formatDistanceToNow(createdAt, { addSuffix: true, locale: ko }),
    replies,
    likes,
    dislikes,
    isLiked: Boolean(data.isLiked),
    isDisliked: Boolean(data.isDisliked),
    isHot: likes > 20,
    viewCount:
      (typeof data.viewCount === 'number' && data.viewCount) ||
      (typeof data.views === 'number' && data.views) ||
      0,
    views:
      (typeof data.views === 'number' && data.views) ||
      (typeof data.viewCount === 'number' && data.viewCount) ||
      0,
    createdAt,
    updatedAt,
    comments: Array.isArray(data.comments)
      ? transformComments(data.comments as unknown[])
      : [],
  };
};

export const useCommunityPostDetail = (
  postId: string,
  options: UseCommunityPostDetailOptions = {},
) => {
  const { user } = useAuth();
  const { requireAuth } = useAuthRedirect();
  const deletePostMutation = useDeleteCommunityPost();
  const postReactionMutation = usePostReaction();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const createReplyMutation = useCreateReply();

  const [post, setPost] = useState<CommunityPostDetailData | null>(null);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const postUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/community/post/${postId}`;
  }, [postId]);

  const fetchPostDetail = useCallback(
    async (withLoading: boolean = true) => {
      if (!postId || postId === 'undefined') {
        setError('유효하지 않은 게시글 ID입니다.');
        setIsLoading(false);
        return;
      }

      try {
        if (withLoading) {
          setIsLoading(true);
        }
        const response = await communityPostAPI.getPost(postId);
        const postData =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data: unknown }).data
            : response;

        if (postData && typeof postData === 'object') {
          const formattedPost = extractPostDetail(
            postData as Record<string, unknown>,
            postId,
          );
          setPost(formattedPost);
          setError('');
        } else {
          setError('포스트를 불러올 수 없습니다.');
          setPost(null);
        }
      } catch (err) {
        console.error('포스트 상세 조회 오류:', err);
        let errorMessage = '포스트 조회 중 오류가 발생했습니다.';
        if (err instanceof Error) {
          if (err.message.includes('서버 리소스가 부족합니다')) {
            errorMessage =
              '서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.';
          } else if (err.message.includes('요청 시간이 초과되었습니다')) {
            errorMessage =
              '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage =
              '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
          }
        }
        setPost(null);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const refreshPost = useCallback(() => fetchPostDetail(false), [fetchPostDetail]);

  const handleBack = useCallback(() => {
    if (options.onBack) {
      options.onBack();
      return;
    }

    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, [options]);

  const handleCopyLink = useCallback(async () => {
    if (typeof navigator === 'undefined' || !postUrl) return;

    try {
      await navigator.clipboard.writeText(postUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  }, [postUrl]);

  const handleSocialShare = useCallback(
    (platform: 'twitter' | 'facebook' | 'kakao') => {
      if (typeof window === 'undefined' || !postUrl) return;
      const title = post?.title || '게시글';

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              title,
            )}&url=${encodeURIComponent(postUrl)}`,
            '_blank',
          );
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              postUrl,
            )}`,
            '_blank',
          );
          break;
        case 'kakao':
          handleCopyLink();
          break;
        default:
          break;
      }
    },
    [handleCopyLink, post?.title, postUrl],
  );

  const handleLike = useCallback(() => {
    requireAuth(() => {
      if (!user || !post) return;

      const action = post.isLiked ? 'unlike' : 'like';
      postReactionMutation.mutate(
        { postId, reaction: action },
        {
          onSuccess: data => {
            setPost(prev =>
              prev
                ? {
                    ...prev,
                    likes: data.likes,
                    dislikes: data.dislikes,
                    isLiked: data.isLiked,
                    isDisliked: data.isDisliked,
                    isHot: data.likes > 20,
                  }
                : prev,
            );
          },
          onError: err => {
            console.error('좋아요 처리 오류:', err);
          },
        },
      );
    });
  }, [post, postId, postReactionMutation, requireAuth, user]);

  const handleDislike = useCallback(() => {
    requireAuth(() => {
      if (!user || !post) return;

      const action = post.isDisliked ? 'undislike' : 'dislike';
      postReactionMutation.mutate(
        { postId, reaction: action },
        {
          onSuccess: data => {
            setPost(prev =>
              prev
                ? {
                    ...prev,
                    likes: data.likes,
                    dislikes: data.dislikes,
                    isLiked: data.isLiked,
                    isDisliked: data.isDisliked,
                  }
                : prev,
            );
          },
          onError: err => {
            console.error('싫어요 처리 오류:', err);
          },
        },
      );
    });
  }, [post, postId, postReactionMutation, requireAuth, user]);

  const handleCommentSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!comment.trim() || !post) return;

      requireAuth(() => {
        if (!user) return;

        createCommentMutation.mutate(
          { postId, content: comment.trim() },
          {
            onSuccess: () => {
              setComment('');
              refreshPost();
            },
            onError: err => {
              console.error('댓글 작성 실패:', err);
            },
          },
        );
      });
    },
    [comment, createCommentMutation, post, postId, refreshPost, requireAuth, user],
  );

  const handleCommentDelete = useCallback(
    (commentId: string) => {
      requireAuth(() => {
        if (!user || !post) return;

        deleteCommentMutation.mutate(
          { postId, commentId },
          {
            onSuccess: () => {
              refreshPost();
            },
            onError: err => {
              console.error('댓글 삭제 실패:', err);
            },
          },
        );
      });
    },
    [deleteCommentMutation, post, postId, refreshPost, requireAuth, user],
  );

  const handleReplySubmit = useCallback(
    (event: FormEvent<HTMLFormElement>, parentCommentId: string) => {
      event.preventDefault();
      if (!replyContent.trim() || !post) return;

      requireAuth(() => {
        if (!user) return;

        createReplyMutation.mutate(
          { postId, parentCommentId, content: replyContent.trim() },
          {
            onSuccess: () => {
              setReplyContent('');
              setReplyingTo(null);
              refreshPost();
            },
            onError: err => {
              console.error('대댓글 작성 실패:', err);
            },
          },
        );
      });
    },
    [createReplyMutation, post, postId, refreshPost, replyContent, requireAuth, user],
  );

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
  }, []);

  const handleDeletePost = useCallback(async () => {
    if (!user || !post) return;

    try {
      await deletePostMutation.mutateAsync(postId);
      if (options.onBack) {
        options.onBack();
      }
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
    }
  }, [deletePostMutation, options, post, postId, user]);

  const canDeleteComment = useCallback(
    (commentAuthorId: string) => {
      return Boolean(
        user && post && (user.id === commentAuthorId || user.id === post.authorId),
      );
    },
    [post, user],
  );

  const canDeletePost = useMemo(() => {
    return Boolean(
      user && post && (user.id === post.authorId || user.role === 'admin'),
    );
  }, [post, user]);

  const isLiked = Boolean(post?.isLiked);
  const isDisliked = Boolean(post?.isDisliked);

  return {
    post,
    isLoading,
    error,
    state: {
      comment,
      replyingTo,
      replyContent,
      copiedLink,
      showDeleteDialog,
    },
    status: {
      isLiked,
      isDisliked,
      isLiking: postReactionMutation.isPending,
      isDisliking: postReactionMutation.isPending,
      isSubmittingComment: createCommentMutation.isPending,
      isSubmittingReply: createReplyMutation.isPending,
      isDeletingPost: deletePostMutation.isPending,
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
    permissions: {
      canDeleteComment,
      canDeletePost,
    },
  };
};

export type UseCommunityPostDetailReturn = ReturnType<typeof useCommunityPostDetail>;
