import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityCommentAPI } from '../../services/api';

// 댓글 생성 훅
export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content, parentId }: {
            postId: string;
            content: string;
            parentId?: string
        }) =>
            communityCommentAPI.createComment(postId, { content, parentId }),
        onSuccess: (data, { postId }) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
            // 게시글 상세 캐시 무효화 (댓글 수 업데이트)
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 댓글 삭제 훅
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            communityCommentAPI.deleteComment(postId, commentId),
        onSuccess: (data, { postId }) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
            // 게시글 상세 캐시 무효화 (댓글 수 업데이트)
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 대댓글 작성 훅
export const useCreateReply = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            parentCommentId,
            content
        }: {
            postId: string;
            parentCommentId: string;
            content: string
        }) =>
            communityCommentAPI.createComment(postId, { content, parentId: parentCommentId }),
        onSuccess: (data, { postId }) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
            // 게시글 상세 캐시 무효화 (댓글 수 업데이트)
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};
