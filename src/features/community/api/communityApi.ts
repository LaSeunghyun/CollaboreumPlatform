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

        const response = await apiCall<{ success: boolean; posts: any[]; pagination: any }>(endpoint)

        // 데이터 변환 및 정규화
        const normalizedPosts = response.posts.map(post => ({
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

        return {
            posts: normalizedPosts,
            pagination: response.pagination
        }
    },

    // 게시글 상세 조회
    getPost: async (postId: string): Promise<CommunityPost> => {
        try {
            const response = await apiCall<{ success: boolean; data: any }>(`${API_BASE}/posts/${postId}`)

            // 데이터 변환 및 정규화
            const post = response.data
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
        const response = await apiCall<{ success: boolean; data: CommunityPost; message: string }>(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        return response.data
    },

    // 게시글 수정
    updatePost: async (postId: string, data: UpdateCommunityPostData): Promise<CommunityPost> => {
        const response = await apiCall<{ success: boolean; data: CommunityPost; message: string }>(`${API_BASE}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        return response.data
    },

    // 게시글 삭제
    deletePost: async (postId: string): Promise<void> => {
        await apiCall<{ success: boolean; message: string }>(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
        })
    },

    // 게시글 좋아요
    likePost: async (postId: string): Promise<{ likes: number }> => {
        const response = await apiCall<{ success: boolean; data: { likes: number; dislikes: number }; message: string }>(`${API_BASE}/posts/${postId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction: 'like' }),
        })
        return { likes: response.data.likes }
    },

    // 게시글 조회수 증가
    viewPost: async (postId: string): Promise<{ views: number }> => {
        try {
            const response = await apiCall<{ success: boolean; data: { views: number }; message: string }>(`${API_BASE}/posts/${postId}/views`, {
                method: 'POST',
            })
            return { views: response.data.views }
        } catch (error) {
            console.error('조회수 증가 실패:', error)
            throw error
        }
    },

    // 댓글 목록 조회
    getComments: async (postId: string): Promise<CommunityComment[]> => {
        const response = await apiCall<{ success: boolean; data: CommunityComment[]; pagination: any }>(`${API_BASE}/posts/${postId}/comments`)
        return response.data
    },

    // 댓글 생성
    createComment: async (data: CreateCommunityCommentData): Promise<CommunityComment> => {
        const response = await apiCall<{ success: boolean; data: CommunityComment; message: string }>(`${API_BASE}/posts/${data.postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: data.content, parentId: data.parentId }),
        })
        return response.data
    },

    // 댓글 수정
    updateComment: async (postId: string, commentId: string, content: string): Promise<CommunityComment> => {
        const response = await apiCall<{ success: boolean; data: CommunityComment; message: string }>(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })
        return response.data
    },

    // 댓글 삭제
    deleteComment: async (postId: string, commentId: string): Promise<void> => {
        await apiCall<{ success: boolean; message: string }>(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
        })
    },

    // 댓글 좋아요
    likeComment: async (postId: string, commentId: string): Promise<{ likes: number }> => {
        const response = await apiCall<{ success: boolean; data: { likes: number; dislikes: number }; message: string }>(`${API_BASE}/posts/${postId}/comments/${commentId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction: 'like' }),
        })
        return { likes: response.data.likes }
    },

    // 카테고리 목록 조회
    getCategories: async (): Promise<CommunityCategory[]> => {
        const response = await apiCall<{ success: boolean; data: CommunityCategory[] }>('/categories')
        return response.data
    },

    // 인기 게시글 조회
    getPopularPosts: async (limit: number = 10): Promise<CommunityPost[]> => {
        const response = await apiCall<{ success: boolean; data: CommunityPost[] }>(`${API_BASE}/posts/popular?limit=${limit}`)
        return response.data
    },

    // 최신 게시글 조회
    getRecentPosts: async (limit: number = 10): Promise<CommunityPost[]> => {
        const response = await apiCall<{ success: boolean; data: CommunityPost[] }>(`${API_BASE}/posts/recent?limit=${limit}`)
        return response.data
    },
}
