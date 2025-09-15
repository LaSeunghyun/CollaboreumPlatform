// 커뮤니티 게시글 React Query 훅들
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import type {
    CommunityPostListQuery,
    CreateCommunityPostData,
    UpdateCommunityPostData,
    CommunityPost
} from '../types'

// 게시글 목록 조회
export const useCommunityPosts = (query: CommunityPostListQuery = {}) => {
    return useQuery({
        queryKey: ['community', 'posts', query],
        queryFn: () => communityApi.getPosts(query),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 1, // 재시도 1회만
        retryDelay: 1000
    })
}

// 게시글 상세 조회
export const useCommunityPost = (postId: string) => {
    return useQuery({
        queryKey: ['community', 'post', postId],
        queryFn: () => communityApi.getPost(postId),
        enabled: !!postId,
        staleTime: 5 * 60 * 1000,
    })
}

// 게시글 생성
export const useCreateCommunityPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCommunityPostData) => communityApi.createPost(data),
        onSuccess: () => {
            // 게시글 목록 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
            // 인기 게시글 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'popular'] })
            // 최신 게시글 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'recent'] })
        },
    })
}

// 게시글 수정
export const useUpdateCommunityPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, data }: { postId: string; data: UpdateCommunityPostData }) =>
            communityApi.updatePost(postId, data),
        onSuccess: (updatedPost) => {
            // 특정 게시글 캐시 업데이트
            queryClient.setQueryData(['community', 'post', updatedPost.id], updatedPost)
            // 게시글 목록 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
        },
    })
}

// 게시글 삭제
export const useDeleteCommunityPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (postId: string) => communityApi.deletePost(postId),
        onSuccess: (_, postId) => {
            // 특정 게시글 캐시 제거
            queryClient.removeQueries({ queryKey: ['community', 'post', postId] })
            // 게시글 목록 무효화
            queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
        },
    })
}

// 게시글 좋아요
export const useLikeCommunityPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (postId: string) => communityApi.likePost(postId),
        onSuccess: (data, postId) => {
            // 특정 게시글의 좋아요 수 업데이트
            queryClient.setQueryData(['community', 'post', postId], (old: CommunityPost | undefined) => {
                if (old) {
                    return { ...old, likes: data.likes }
                }
                return old
            })
            // 게시글 목록의 좋아요 수 업데이트
            queryClient.setQueriesData(
                { queryKey: ['community', 'posts'] },
                (old: any) => {
                    if (old?.posts) {
                        return {
                            ...old,
                            posts: old.posts.map((post: CommunityPost) =>
                                post.id === postId ? { ...post, likes: data.likes } : post
                            ),
                        }
                    }
                    return old
                }
            )
        },
    })
}

// 게시글 조회수 증가
export const useViewCommunityPost = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (postId: string) => communityApi.viewPost(postId),
        onSuccess: (data, postId) => {
            // 특정 게시글의 조회수 업데이트
            queryClient.setQueryData(['community', 'post', postId], (old: CommunityPost | undefined) => {
                if (old) {
                    return { ...old, views: data.views }
                }
                return old
            })
        },
    })
}

// 인기 게시글 조회
export const usePopularCommunityPosts = (limit: number = 10) => {
    return useQuery({
        queryKey: ['community', 'posts', 'popular', limit],
        queryFn: () => communityApi.getPopularPosts(limit),
        staleTime: 10 * 60 * 1000, // 10분
    })
}

// 최신 게시글 조회
export const useRecentCommunityPosts = (limit: number = 10) => {
    return useQuery({
        queryKey: ['community', 'posts', 'recent', limit],
        queryFn: () => communityApi.getRecentPosts(limit),
        staleTime: 5 * 60 * 1000, // 5분
    })
}
