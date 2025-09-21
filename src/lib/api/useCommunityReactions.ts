import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityPostAPI, communityCommentAPI } from '../../services/api';

interface PostReactionResponse {
  likes?: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface PostViewResponse {
  views?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const updatePostCache = (
  previous: unknown,
  updater: (draft: Record<string, unknown>) => void,
): unknown => {
  if (!isRecord(previous)) {
    return previous;
  }

  if (isRecord(previous.data)) {
    const nextData = { ...previous.data };
    updater(nextData);
    return { ...previous, data: nextData };
  }

  const next = { ...previous };
  updater(next);
  return next;
};

// 게시글 반응 훅
export const usePostReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PostReactionResponse,
    Error,
    { postId: string; reaction: 'like' | 'dislike' | 'unlike' | 'undislike' }
  >({
    mutationFn: ({
      postId,
      reaction,
    }: {
      postId: string;
      reaction: 'like' | 'dislike' | 'unlike' | 'undislike';
    }) =>
      communityPostAPI.togglePostReaction(
        postId,
        reaction,
      ) as Promise<PostReactionResponse>,
    onSuccess: (data: PostReactionResponse, { postId }) => {
      // 게시글 상세 캐시 업데이트
      queryClient.setQueryData(['community', 'post', postId], previous =>
        updatePostCache(previous, draft => {
          if (typeof data.likes === 'number') {
            draft.likes = data.likes;
          }
          if (typeof data.dislikes === 'number') {
            draft.dislikes = data.dislikes;
          }
          if (typeof data.isLiked === 'boolean') {
            draft.isLiked = data.isLiked;
          }
          if (typeof data.isDisliked === 'boolean') {
            draft.isDisliked = data.isDisliked;
          }
        }),
      );

      // 게시글 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
};

// 댓글 반응 훅
export const useCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      reaction,
    }: {
      postId: string;
      commentId: string;
      reaction: 'like' | 'dislike' | 'unlike';
    }) =>
      communityCommentAPI.toggleCommentReaction(postId, commentId, reaction),
    onSuccess: (data, { postId }) => {
      // 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
    },
  });
};

// 게시글 조회수 증가 훅
export const useIncrementPostViews = () => {
  const queryClient = useQueryClient();

  return useMutation<PostViewResponse, Error, string>({
    mutationFn: (postId: string) =>
      communityPostAPI.incrementPostViews(postId) as Promise<PostViewResponse>,
    onSuccess: (data: PostViewResponse, postId) => {
      // 게시글 상세 캐시 업데이트
      queryClient.setQueryData(['community', 'post', postId], previous =>
        updatePostCache(previous, draft => {
          if (typeof data.views === 'number') {
            draft.views = data.views;
            draft.viewCount = data.views;
          }
        }),
      );
    },
  });
};
