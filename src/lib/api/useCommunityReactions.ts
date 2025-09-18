import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityPostAPI, communityCommentAPI } from '../../services/api';

// 게시글 반응 훅
export const usePostReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, reaction }: { postId: string; reaction: 'like' | 'dislike' | 'unlike' | 'undislike' }) =>
            communityPostAPI.togglePostReaction(postId, reaction),
        onSuccess: (data: any, { postId }) => {
            // 게시글 상세 캐시 업데이트
            queryClient.setQueryData(['community', 'post', postId], (old: any) => {
                if (old) {
                    return {
                        ...old,
                        likes: data.likes || old.likes,
                        dislikes: data.dislikes || old.dislikes,
                        isLiked: data.isLiked ?? old.isLiked,
                        isDisliked: data.isDisliked ?? old.isDisliked,
                    };
                }
                return old;
            });

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

    return useMutation({
        mutationFn: (postId: string) => communityPostAPI.incrementPostViews(postId),
        onSuccess: (data: any, postId) => {
            // 게시글 상세 캐시 업데이트
            queryClient.setQueryData(['community', 'post', postId], (old: any) => {
                if (old) {
                    return {
                        ...old,
                        views: data.views || old.views,
                        viewCount: data.views || old.viewCount,
                    };
                }
                return old;
            });
        },
    });
};
