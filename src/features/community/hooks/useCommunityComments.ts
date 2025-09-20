// 커뮤니티 댓글 React Query 훅들
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import type {
    CommunityComment,
    CommunityPost,
    CommunityPostListResponse,
    CreateCommunityCommentData
} from '../types'

// 댓글 목록 조회
export const useCommunityComments = (postId: string) => {
    return useQuery({
        queryKey: ['community', 'comments', postId],
        queryFn: () => communityApi.getComments(postId),
        enabled: !!postId,
        staleTime: 5 * 60 * 1000, // 5분
    })
}

// 댓글 생성
export const useCreateCommunityComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCommunityCommentData) => communityApi.createComment(data),
        onSuccess: (newComment) => {
            // 해당 게시글의 댓글 목록 무효화
            queryClient.invalidateQueries({
                queryKey: ['community', 'comments', newComment.postId]
            })
            // 게시글의 댓글 수 업데이트
            queryClient.setQueriesData<CommunityPostListResponse | undefined>(
                { queryKey: ['community', 'posts'] },
                (old) =>
                    old?.posts
                        ? {
                              ...old,
                              posts: old.posts.map((post: CommunityPost) =>
                                  post.id === newComment.postId
                                      ? { ...post, replies: post.replies + 1 }
                                      : post
                              ),
                          }
                        : old
            )
        },
    })
}

// 댓글 수정
export const useUpdateCommunityComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, commentId, content }: { postId: string; commentId: string; content: string }) =>
            communityApi.updateComment(postId, commentId, content),
        onSuccess: (updatedComment) => {
            // 해당 게시글의 댓글 목록 무효화
            queryClient.invalidateQueries({
                queryKey: ['community', 'comments', updatedComment.postId]
            })
        },
    })
}

// 댓글 삭제
export const useDeleteCommunityComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            communityApi.deleteComment(postId, commentId),
        onSuccess: (_, { commentId }) => {
            // 모든 댓글 쿼리에서 해당 댓글 제거
            queryClient.setQueriesData(
                { queryKey: ['community', 'comments'] },
                (old: CommunityComment[] | undefined) => {
                    if (old) {
                        return old.filter(comment => comment.id !== commentId)
                    }
                    return old
                }
            )
        },
    })
}

// 댓글 좋아요
export const useLikeCommunityComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            communityApi.likeComment(postId, commentId),
        onSuccess: (data, { commentId }) => {
            // 모든 댓글 쿼리에서 해당 댓글의 좋아요 수 업데이트
            queryClient.setQueriesData(
                { queryKey: ['community', 'comments'] },
                (old: CommunityComment[] | undefined) => {
                    if (old) {
                        return old.map(comment =>
                            comment.id === commentId ? { ...comment, likes: data.likes } : comment
                        )
                    }
                    return old
                }
            )
        },
    })
}
