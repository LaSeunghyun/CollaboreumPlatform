// 커뮤니티 API 서비스
import { apiCall } from '../../../services/api'
import type {
    CommunityPost,
    CommunityPostListQuery,
    CommunityPostListResponse,
    CreateCommunityPostData,
    UpdateCommunityPostData,
    CommunityComment,
    CreateCommunityCommentData,
    CommunityCategory
} from '../types'

const API_BASE = '/community'

const unwrapData = <T>(payload: any): T | null => {
    if (payload === null || payload === undefined) {
        return null
    }

    if (Array.isArray(payload)) {
        return payload as T
    }

    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
        const value = (payload as { data?: T }).data
        return (value ?? null) as T | null
    }

    return payload as T
}

export const communityApi = {
    // 게시글 목록 조회
    getPosts: async (query: CommunityPostListQuery = {}): Promise<CommunityPostListResponse> => {
        const params = new URLSearchParams()

        if (query.page) params.append('page', query.page.toString())
        if (query.limit) params.append('limit', query.limit.toString())
        if (query.category) params.append('category', query.category)
        if (query.search) params.append('search', query.search)
        if (query.sortBy) params.append('sortBy', query.sortBy)
        if (query.order) params.append('order', query.order)
        if (query.status) params.append('status', query.status)
        if (query.authorId) params.append('authorId', query.authorId)

        const queryString = params.toString()
        const endpoint = queryString ? `${API_BASE}/posts?${queryString}` : `${API_BASE}/posts`

        const response = await apiCall<{ posts?: any[]; pagination?: any }>(endpoint)

        const rawPosts = Array.isArray(response?.posts)
            ? response.posts
            : Array.isArray((response as any)?.data)
                ? (response as any).data
                : []

        // 데이터 변환 및 정규화
        const normalizedPosts = rawPosts.map(post => ({
            ...post,
            id: post.id || post._id,
            views: post.viewCount || post.views || 0,
            likes: Array.isArray(post.likes) ? post.likes.length : (post.likes || 0),
            dislikes: Array.isArray(post.dislikes) ? post.dislikes.length : (post.dislikes || 0),
            replies: Array.isArray(post.comments) ? post.comments.length : (post.replies || 0),
            author: typeof post.author === 'string' ? { id: post.author, name: post.authorName || 'Unknown', role: 'user' } : post.author,
            isHot: (Array.isArray(post.likes) ? post.likes.length : post.likes || 0) > 10 || (post.viewCount || post.views || 0) > 100,
            isPinned: false,
            status: 'published' as const,
            createdAt: post.createdAt || new Date().toISOString(),
            updatedAt: post.updatedAt || new Date().toISOString()
        }))

        const pagination = (response && typeof response === 'object' && 'pagination' in response)
            ? (response as any).pagination
            : undefined

        return {
            posts: normalizedPosts,
            pagination: pagination ?? {
                page: 1,
                limit: normalizedPosts.length,
                total: normalizedPosts.length,
                pages: 1
            }
        }
    },

    // 게시글 상세 조회
    getPost: async (postId: string): Promise<CommunityPost> => {
        try {
            const response = await apiCall<{ data?: any }>(`${API_BASE}/posts/${postId}`)
            const post = unwrapData<any>(response)

            if (!post) {
                throw new Error('게시글 데이터를 찾을 수 없습니다.')
            }

            // 데이터 변환 및 정규화
            const normalizedPost: CommunityPost = {
                ...post,
                id: post.id || post._id,
                views: post.viewCount || post.views || 0,
                likes: Array.isArray(post.likes) ? post.likes.length : (post.likes || 0),
                dislikes: Array.isArray(post.dislikes) ? post.dislikes.length : (post.dislikes || 0),
                replies: Array.isArray(post.comments) ? post.comments.length : (post.replies || 0),
                author: typeof post.author === 'string' ? { id: post.author, name: post.authorName || 'Unknown', role: 'user' } : post.author,
                isHot: post.likes > 10 || post.views > 100,
                isPinned: false,
                status: 'published' as const,
                createdAt: post.createdAt || new Date().toISOString(),
                updatedAt: post.updatedAt || new Date().toISOString()
            }

            return normalizedPost
        } catch (error) {
            console.error('게시글 상세 조회 실패:', error)
            throw error
        }
    },

    // 게시글 생성
    createPost: async (data: CreateCommunityPostData): Promise<CommunityPost> => {
        const response = await apiCall<{ data?: CommunityPost }>(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const result = unwrapData<CommunityPost>(response)
        if (!result) {
            throw new Error('게시글 생성 응답이 비어 있습니다.')
        }
        return result
    },

    // 게시글 수정
    updatePost: async (postId: string, data: UpdateCommunityPostData): Promise<CommunityPost> => {
        const response = await apiCall<{ data?: CommunityPost }>(`${API_BASE}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const result = unwrapData<CommunityPost>(response)
        if (!result) {
            throw new Error('게시글 수정 응답이 비어 있습니다.')
        }
        return result
    },

    // 게시글 삭제
    deletePost: async (postId: string): Promise<void> => {
        await apiCall<{ success: boolean; message: string }>(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
        })
    },

    // 게시글 좋아요
    likePost: async (postId: string): Promise<{ likes: number }> => {
        const response = await apiCall<{ data?: { likes: number; dislikes: number } }>(`${API_BASE}/posts/${postId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction: 'like' }),
        })
        const result = unwrapData<{ likes: number; dislikes: number }>(response)
        return { likes: result?.likes ?? 0 }
    },

    // 게시글 조회수 증가
    viewPost: async (postId: string): Promise<{ views: number }> => {
        try {
            const response = await apiCall<{ data?: { views: number } }>(`${API_BASE}/posts/${postId}/views`, {
                method: 'POST',
            })
            const result = unwrapData<{ views: number }>(response)
            return { views: result?.views ?? 0 }
        } catch (error) {
            console.error('조회수 증가 실패:', error)
            throw error
        }
    },

    // 댓글 목록 조회
    getComments: async (postId: string): Promise<CommunityComment[]> => {
        const response = await apiCall<{ data?: CommunityComment[] }>(`${API_BASE}/posts/${postId}/comments`)
        return unwrapData<CommunityComment[]>(response) ?? []
    },

    // 댓글 생성
    createComment: async (data: CreateCommunityCommentData): Promise<CommunityComment> => {
        const response = await apiCall<{ data?: CommunityComment }>(`${API_BASE}/posts/${data.postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: data.content, parentId: data.parentId }),
        })
        const result = unwrapData<CommunityComment>(response)
        if (!result) {
            throw new Error('댓글 생성 응답이 비어 있습니다.')
        }
        return result
    },

    // 댓글 수정
    updateComment: async (postId: string, commentId: string, content: string): Promise<CommunityComment> => {
        const response = await apiCall<{ data?: CommunityComment }>(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })
        const result = unwrapData<CommunityComment>(response)
        if (!result) {
            throw new Error('댓글 수정 응답이 비어 있습니다.')
        }
        return result
    },

    // 댓글 삭제
    deleteComment: async (postId: string, commentId: string): Promise<void> => {
        await apiCall<{ success: boolean; message: string }>(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
        })
    },

    // 댓글 좋아요
    likeComment: async (postId: string, commentId: string): Promise<{ likes: number }> => {
        const response = await apiCall<{ data?: { likes: number; dislikes: number } }>(`${API_BASE}/posts/${postId}/comments/${commentId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction: 'like' }),
        })
        const result = unwrapData<{ likes: number; dislikes: number }>(response)
        return { likes: result?.likes ?? 0 }
    },

    // 카테고리 목록 조회
    getCategories: async (): Promise<CommunityCategory[]> => {
        const response = await apiCall<{ data?: CommunityCategory[] }>(`${API_BASE}/categories`)
        return unwrapData<CommunityCategory[]>(response) ?? []
    },

    // 인기 게시글 조회
    getPopularPosts: async (limit: number = 10): Promise<CommunityPost[]> => {
        const response = await apiCall<{ data?: CommunityPost[] }>(`${API_BASE}/posts/popular?limit=${limit}`)
        return unwrapData<CommunityPost[]>(response) ?? []
    },

    // 최신 게시글 조회
    getRecentPosts: async (limit: number = 10): Promise<CommunityPost[]> => {
        const response = await apiCall<{ data?: CommunityPost[] }>(`${API_BASE}/posts/recent?limit=${limit}`)
        return unwrapData<CommunityPost[]>(response) ?? []
    },
}
