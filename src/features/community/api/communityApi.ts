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
import type { UnknownRecord } from '@/types/api'

const API_BASE = '/community'

type CommunityPostsApiResponse = {
    success: boolean
    posts?: UnknownRecord[]
    data?: UnknownRecord[] | { posts?: UnknownRecord[]; pagination?: unknown }
    pagination?: unknown
}

type CommunityPostResponse = {
    success: boolean
    data: UnknownRecord
}

type CommunityCommentsResponse = {
    success: boolean
    data: CommunityComment[]
    pagination?: unknown
}

type PostReactionResponse = {
    success: boolean
    data: {
        likes: number
        dislikes: number
    }
    message?: string
}

type PostViewResponse = {
    success: boolean
    data: {
        views: number
    }
    message?: string
}

type CommentReactionResponse = {
    success: boolean
    data: {
        likes: number
        dislikes: number
    }
    message?: string
}

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : fallback
    }

    if (Array.isArray(value)) {
        return value.length
    }

    return fallback
}

const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
    }

    return fallback
}

const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => toString(item)).filter((item) => item.length > 0)
    }

    return []
}

const toDateString = (value: unknown): string => {
    if (typeof value === 'string' && value.length > 0) {
        return value
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    const date = new Date(value as string)
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const normalizeAuthor = (author: unknown, fallbackName: unknown): CommunityPost['author'] => {
    if (author && typeof author === 'object') {
        const record = author as UnknownRecord
        const id = toString(record.id ?? record._id)
        const name = toString(record.name ?? fallbackName, 'Unknown')
        const role = record.role === 'admin' || record.role === 'artist' || record.role === 'fan' ? record.role : 'fan'

        return {
            id,
            name,
            role,
            avatar: typeof record.avatar === 'string' ? record.avatar : undefined,
            isVerified: typeof record.isVerified === 'boolean' ? record.isVerified : undefined,
        }
    }

    return {
        id: toString(author),
        name: toString(fallbackName, 'Unknown'),
        role: 'fan',
    }
}

const normalizePagination = (
    value: unknown,
    fallbackCount: number
): CommunityPostListResponse['pagination'] => {
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>

        return {
            page: toNumber(record.page, 1),
            limit: toNumber(record.limit, fallbackCount),
            total: toNumber(record.total, fallbackCount),
            totalPages: toNumber(record.pages ?? record.totalPages, 1),
        }
    }

    return {
        page: 1,
        limit: fallbackCount,
        total: fallbackCount,
        totalPages: 1,
    }
}

const normalizePost = (postRecord: UnknownRecord): CommunityPost => {
    const id = toString(postRecord.id ?? postRecord._id)
    const views = toNumber(postRecord.viewCount ?? postRecord.views)
    const likes = toNumber(postRecord.likes)
    const dislikes = toNumber(postRecord.dislikes)
    const commentsArray = Array.isArray(postRecord.comments) ? postRecord.comments : undefined
    const replies = commentsArray ? commentsArray.length : toNumber(postRecord.replies)

    return {
        id,
        title: toString(postRecord.title),
        content: toString(postRecord.content),
        author: normalizeAuthor(postRecord.author, postRecord.authorName),
        category: toString(postRecord.category),
        tags: toStringArray(postRecord.tags),
        likes,
        dislikes,
        views,
        comments: commentsArray ? commentsArray.length : toNumber(postRecord.comments),
        replies,
        viewCount: views,
        isHot: likes > 10 || views > 100,
        isPinned: Boolean(postRecord.isPinned),
        isLiked: typeof postRecord.isLiked === 'boolean' ? postRecord.isLiked : undefined,
        isDisliked: typeof postRecord.isDisliked === 'boolean' ? postRecord.isDisliked : undefined,
        isBookmarked: typeof postRecord.isBookmarked === 'boolean' ? postRecord.isBookmarked : undefined,
        createdAt: toDateString(postRecord.createdAt),
        updatedAt: toDateString(postRecord.updatedAt),
        status: 'published',
    }
}

const normalizePosts = (posts: UnknownRecord[] | undefined): CommunityPost[] => {
    if (!Array.isArray(posts)) {
        return []
    }

    return posts.map((post) => normalizePost(post))
}

const extractPostRecords = (payload: CommunityPostsApiResponse): UnknownRecord[] => {
    if (Array.isArray(payload.posts)) {
        return payload.posts
    }

    if (Array.isArray(payload.data)) {
        return payload.data
    }

    if (payload.data && typeof payload.data === 'object' && Array.isArray((payload.data as { posts?: UnknownRecord[] }).posts)) {
        return ((payload.data as { posts?: UnknownRecord[] }).posts ?? [])
    }

    return []
}

const extractPagination = (payload: CommunityPostsApiResponse): unknown => {
    if (payload.pagination) {
        return payload.pagination
    }

    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return (payload.data as { pagination?: unknown }).pagination
    }

    return undefined
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

        const response = await apiCall<CommunityPostsApiResponse>(endpoint)
        const posts = normalizePosts(extractPostRecords(response))

        return {
            posts,
            pagination: normalizePagination(extractPagination(response), posts.length),
        }
    },

    // 게시글 상세 조회
    getPost: async (postId: string): Promise<CommunityPost> => {
        try {
            const response = await apiCall<CommunityPostResponse>(`${API_BASE}/posts/${postId}`)
            return normalizePost(response.data)
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
        return normalizePost(response.data as UnknownRecord)
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
        return normalizePost(response.data as UnknownRecord)
    },

    // 게시글 삭제
    deletePost: async (postId: string): Promise<void> => {
        await apiCall<{ success: boolean; message: string }>(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
        })
    },

    // 게시글 좋아요
    likePost: async (postId: string): Promise<{ likes: number }> => {
        const response = await apiCall<PostReactionResponse>(`${API_BASE}/posts/${postId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction: 'like' }),
        })
        return { likes: response.data.likes }
    },

    // 게시글 조회수 증가
    viewPost: async (postId: string): Promise<{ views: number }> => {
        try {
            const response = await apiCall<PostViewResponse>(`${API_BASE}/posts/${postId}/views`, {
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
        const response = await apiCall<CommunityCommentsResponse>(`${API_BASE}/posts/${postId}/comments`)
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
        const response = await apiCall<CommentReactionResponse>(`${API_BASE}/posts/${postId}/comments/${commentId}/reactions`, {
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
        const response = await apiCall<CommunityPostsApiResponse>(`${API_BASE}/posts/popular?limit=${limit}`)
        return normalizePosts(extractPostRecords(response))
    },

    // 최신 게시글 조회
    getRecentPosts: async (limit: number = 10): Promise<CommunityPost[]> => {
        const response = await apiCall<CommunityPostsApiResponse>(`${API_BASE}/posts/recent?limit=${limit}`)
        return normalizePosts(extractPostRecords(response))
    }
}
