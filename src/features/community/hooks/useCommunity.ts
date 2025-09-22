import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityPostAPI, communityCommentAPI } from '../../../services/api';
import {
    PostListParams,
    CommentListParams,
    CreatePostData,
    CreateCommentData,
    UpdatePostData,
    UpdateCommentData,
    PostListResponse,
    CommentListResponse,
    PostDetailResponse,
    CategoryListResponse,
    // CommunityPost,
    // CommunityComment,
    CommunityStats
} from '../types/index';

// 게시글 목록 조회
export const useCommunityPosts = (params: PostListParams = {}) => {
    return useQuery<PostListResponse>({
        queryKey: ['community', 'posts', params],
        queryFn: () => communityPostAPI.getPosts(params) as Promise<PostListResponse>,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
};

// 게시글 상세 조회
export const useCommunityPost = (postId: string) => {
    return useQuery<PostDetailResponse>({
        queryKey: ['community', 'post', postId],
        queryFn: () => communityPostAPI.getPost(postId) as Promise<PostDetailResponse>,
        enabled: !!postId,
        staleTime: 5 * 60 * 1000,
    });
};

// 게시글 생성
export const useCreateCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostData) => communityPostAPI.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
            queryClient.invalidateQueries({ queryKey: ['community', 'stats'] });
        },
    });
};

// 게시글 수정
export const useUpdateCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: UpdatePostData }) =>
            communityPostAPI.updatePost(postId, data),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 게시글 삭제
export const useDeleteCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => communityPostAPI.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
            queryClient.invalidateQueries({ queryKey: ['community', 'stats'] });
        },
    });
};

// 게시글 좋아요/싫어요
export const useLikeCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, action }: { postId: string; action: 'like' | 'dislike' | 'unlike' | 'undislike' }) =>
            communityPostAPI.togglePostReaction(postId, action),
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

// 게시글 북마크
export const useBookmarkCommunityPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, action }: { postId: string; action: 'bookmark' | 'unbookmark' }) =>
            communityPostAPI.bookmarkPost(postId, action),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// 댓글 목록 조회
export const useCommunityComments = (params: CommentListParams) => {
    return useQuery<CommentListResponse>({
        queryKey: ['community', 'comments', params],
        queryFn: () => communityCommentAPI.getComments(params.postId) as Promise<CommentListResponse>,
        enabled: !!params.postId,
        staleTime: 2 * 60 * 1000, // 2분
    });
};

// 댓글 생성
export const useCreateCommunityComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommentData) => communityCommentAPI.createComment(data.postId, data),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments', { postId }] });
            queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 댓글 수정
export const useUpdateCommunityComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId, data }: { postId: string; commentId: string; data: UpdateCommentData }) =>
            communityCommentAPI.updateComment(postId, commentId, data),
        onSuccess: (_, { commentId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments'] });
        },
    });
};

// 댓글 삭제
export const useDeleteCommunityComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => communityCommentAPI.deleteComment(postId, commentId),
        onSuccess: (_, commentId) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments'] });
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
        },
    });
};

// 댓글 좋아요/싫어요
export const useLikeCommunityComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, action }: { commentId: string; action: 'like' | 'dislike' | 'unlike' | 'undislike' }) =>
            communityCommentAPI.likeComment(commentId, action as 'like' | 'unlike'),
        onSuccess: (_, { commentId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'comments'] });
        },
    });
};

// 카테고리 목록 조회
export const useCommunityCategories = () => {
    return useQuery<CategoryListResponse>({
        queryKey: ['community', 'categories'],
        queryFn: () => communityPostAPI.getCategories() as Promise<CategoryListResponse>,
        staleTime: 30 * 60 * 1000, // 30분
    });
};

// 커뮤니티 통계 조회
export const useCommunityStats = (options?: { enabled?: boolean }) => {
    return useQuery<CommunityStats>({
        queryKey: ['community', 'stats'],
        queryFn: () => communityPostAPI.getStats() as Promise<CommunityStats>,
        staleTime: 10 * 60 * 1000, // 10분
        enabled: options?.enabled ?? true,
    });
};

// 내 게시글 조회
export const useMyCommunityPosts = (params: Omit<PostListParams, 'author'> = {}) => {
    return useQuery<PostListResponse>({
        queryKey: ['community', 'my-posts', params],
        queryFn: () => communityPostAPI.getMyPosts(params) as Promise<PostListResponse>,
        staleTime: 5 * 60 * 1000,
    });
};

// 내 댓글 조회
export const useMyCommunityComments = (params: Omit<CommentListParams, 'postId'> = {}) => {
    return useQuery<CommentListResponse>({
        queryKey: ['community', 'my-comments', params],
        queryFn: () => communityCommentAPI.getMyComments(params) as Promise<CommentListResponse>,
        staleTime: 5 * 60 * 1000,
    });
};

// 북마크한 게시글 조회
export const useBookmarkedPosts = (params: Omit<PostListParams, 'bookmarked'> = {}) => {
    return useQuery<PostListResponse>({
        queryKey: ['community', 'bookmarked', params],
        queryFn: () => communityPostAPI.getBookmarkedPosts(params) as Promise<PostListResponse>,
        staleTime: 5 * 60 * 1000,
    });
};
