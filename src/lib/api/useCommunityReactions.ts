import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityPostAPI, communityCommentAPI } from '../../services/api';
import type { CommunityPost } from '@/features/community';

interface PostReactionResponse {
    likes: number;
    dislikes: number;
    isLiked: boolean;
    isDisliked: boolean;
}

interface PostViewsResponse {
    views: number;
}

// 게시글 반응 훅
export const usePostReaction = () => {
    const queryClient = useQueryClient();

    return useMutation<PostReactionResponse, unknown, { postId: string; reaction: 'like' | 'dislike' | 'unlike' | 'undislike' }>(
        {
            mutationFn: ({ postId, reaction }) =>
                communityPostAPI.togglePostReaction(postId, reaction) as Promise<PostReactionResponse>,
            onSuccess: ({ likes, dislikes, isLiked, isDisliked }, { postId }) => {
                // 게시글 상세 캐시 업데이트
                queryClient.setQueryData<CommunityPost | undefined>(
                    ['community', 'post', postId],
                    (old) => {
                        if (!old) {
                            return old;
                        }

                        return {
                            ...old,
                            likes,
                            dislikes,
                            isLiked,
                            isDisliked,
                        };
                    }
                );

                // 게시글 목록 캐시 무효화
                queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
            },
        }
    );
};

// 댓글 반응 훅
export const useCommentReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            commentId,
            reaction
        }: {
            postId: string;
            commentId: string;
            reaction: 'like' | 'dislike' | 'unlike'
        }) =>
            communityCommentAPI.toggleCommentReaction(postId, commentId, reaction),
        onSuccess: (data, { postId }) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
        },
    });
};

// 게시글 조회수 증가 훅
export const useIncrementPostViews = () => {
    const queryClient = useQueryClient();

    return useMutation<PostViewsResponse, unknown, string>({
        mutationFn: (postId: string) =>
            communityPostAPI.incrementPostViews(postId) as Promise<PostViewsResponse>,
        onSuccess: ({ views }, postId) => {
            // 게시글 상세 캐시 업데이트
            queryClient.setQueryData<CommunityPost | undefined>(
                ['community', 'post', postId],
                (old) => {
                    if (!old) {
                        return old;
                    }

                    return {
                        ...old,
                        views,
                        viewCount: views,
                    };
                }
            );
        },
    });
};
