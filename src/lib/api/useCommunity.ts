import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityPostAPI, communityCommentAPI } from '../../services/api';
import type {
    CommunityPostListQuery,
    CreateCommunityPostData,
    UpdateCommunityPostData,
    CreateCommunityCommentData,
} from '@/features/community/types';

type UpdateCommunityCommentData = Pick<CreateCommunityCommentData, 'content'>;

// 커뮤니티 게시글 목록 조회
export const useCommunityPosts = (params?: CommunityPostListQuery) => {
    return useQuery({
        queryKey: ['community', 'posts', params],
        queryFn: () => communityPostAPI.getPosts(params),
        staleTime: 2 * 60 * 1000, // 2분
        gcTime: 5 * 60 * 1000, // 5분
    });
};

// 커뮤니티 게시글 상세 조회
export const useCommunityPost = (postId: string) => {
    return useQuery({
        queryKey: ['community', 'post', postId],
        queryFn: () => communityPostAPI.getPostById(postId),
        enabled: !!postId,
        staleTime: 2 * 60 * 1000,
    });
};

// 커뮤니티 게시글 생성
export const useCreateCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommunityPostData) => communityPostAPI.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 커뮤니티 게시글 수정
export const useUpdateCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: UpdateCommunityPostData }) =>
            communityPostAPI.updatePost(postId, data),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 커뮤니티 게시글 삭제
export const useDeleteCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => communityPostAPI.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 커뮤니티 게시글 반응 (좋아요/싫어요)
export const useTogglePostReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, reaction }: { postId: string; reaction: 'like' | 'dislike' }) =>
            communityPostAPI.togglePostReaction(postId, reaction),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 커뮤니티 게시글 조회수 증가
export const useIncrementPostViews = () => {
    return useMutation({
        mutationFn: (postId: string) => communityPostAPI.incrementPostViews(postId),
    });
};

// 댓글 목록 조회
export const useComments = (postId: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}) => {
    return useQuery({
        queryKey: ['community', 'comments', postId, params],
        queryFn: () => communityCommentAPI.getComments(postId, params),
        enabled: !!postId,
        staleTime: 1 * 60 * 1000, // 1분
    });
};

// 댓글 작성
export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: Omit<CreateCommunityCommentData, 'postId'> }) =>
            communityCommentAPI.createComment(postId, data),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 댓글 수정
export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId, data }: { postId: string; commentId: string; data: UpdateCommunityCommentData }) =>
            communityCommentAPI.updateComment(postId, commentId, data),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
        },
    });
};

// 댓글 삭제
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            communityCommentAPI.deleteComment(postId, commentId),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 댓글 반응 (좋아요/싫어요)
export const useToggleCommentReaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId, reaction }: { postId: string; commentId: string; reaction: 'like' | 'dislike' }) =>
            communityCommentAPI.toggleCommentReaction(postId, commentId, reaction),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
        },
    });
};
