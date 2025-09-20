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

const ensureArray = <T>(value: unknown, fallback: T[] = []): T[] => {
    if (Array.isArray(value)) {
        return value as T[]
    }

    return [...fallback]
}

const resolvePostsPayload = (payload: any): any[] => {
    if (!payload) {
        return []
    }

    if (Array.isArray(payload)) {
        return payload
    }

    if (Array.isArray(payload.posts)) {
        return payload.posts
    }

    if (Array.isArray(payload?.data?.posts)) {
        return payload.data.posts
    }

    if (Array.isArray(payload?.data)) {
        return payload.data
    }

    return []
}

const resolvePaginationPayload = (payload: any): any | undefined => {
    if (!payload || typeof payload !== 'object') {
        return undefined
    }

    if (payload.pagination && typeof payload.pagination === 'object') {
        return payload.pagination
    }

    if (payload.data && typeof payload.data === 'object' && 'pagination' in payload.data) {
        return (payload.data as Record<string, unknown>).pagination
    }

    return undefined
}

const normalizeAuthor = (post: any) => {
    if (post && typeof post.author === 'object' && post.author !== null) {
        return {
            id: post.author.id || post.author._id || post.authorId || post.author?.id || 'unknown-author',
            name: post.author.name || post.author.username || post.author.displayName || post.authorName || '익명',
            username: post.author.username || post.author.name || post.author.email || 'anonymous',
            role: post.author.role || 'user',
            avatar: post.author.avatar || post.author.profileImage || undefined,
            isVerified: Boolean(post.author.isVerified),
        }
    }

    if (post?.author) {
        return {
            id: String(post.author),
            name: post.authorName || post.authorNickname || '익명',
            username: post.authorName || post.authorNickname || 'anonymous',
            role: 'user' as const,
        }
    }

    return {
        id: post?.authorId ? String(post.authorId) : 'unknown-author',
        name: post?.authorName || '익명',
        username: post?.authorName || 'anonymous',
        role: 'user' as const,
    }
}

const countReactions = (value: unknown): number => {
    if (Array.isArray(value)) {
        return value.length
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    return 0
}

const countReplies = (comments: unknown): number => {
    if (!Array.isArray(comments)) {
        return 0
    }

    return comments.reduce((total, comment) => {
        if (comment && typeof comment === 'object' && Array.isArray((comment as any).replies)) {
            return total + (comment as any).replies.length
        }

        return total
    }, 0)
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

        try {
            const response = await apiCall<{ posts?: any[]; pagination?: any } | { data?: any } | any[]>(endpoint)

            const rawPosts = resolvePostsPayload(response)

            const normalizedPosts: CommunityPost[] = rawPosts.map((post: any) => {
                const likes = countReactions(post?.likes)
                const dislikes = countReactions(post?.dislikes)
                const commentsArray = ensureArray<any>(post?.comments)
                const commentsCount = countReactions(commentsArray)
                const repliesCount = countReplies(commentsArray)
                const tags = ensureArray<string>(post?.tags).filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                const fallbackTags = ensureArray<string>(post?.tagList).filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                const createdAt = post?.createdAt ? new Date(post.createdAt) : new Date()
                const updatedAt = post?.updatedAt ? new Date(post.updatedAt) : createdAt

                const viewCount = typeof post?.viewCount === 'number'
                    ? post.viewCount
                    : typeof post?.views === 'number'
                        ? post.views
                        : 0

                const fallbackId = post?.id || post?._id || post?.postId || post?.slug
                    || `temp-${Math.random().toString(36).slice(2, 10)}`

                const normalizedPost: CommunityPost = {
                    id: String(fallbackId),
                    title: typeof post?.title === 'string' ? post.title : '제목 미상',
                    content: typeof post?.content === 'string' ? post.content : '',
                    author: normalizeAuthor(post),
                    category: typeof post?.category === 'string' ? post.category : '자유',
                    tags: tags.length > 0 ? tags : fallbackTags,
                    likes,
                    dislikes,
                    views: viewCount,
                    viewCount,
                    comments: commentsCount,
                    replies: repliesCount,
                    isHot: typeof post?.isHot === 'boolean' ? post.isHot : likes > 10 || viewCount > 100,
                    isPinned: Boolean(post?.isPinned || post?.isNotice),
                    isLiked: Boolean(post?.isLiked),
                    isDisliked: Boolean(post?.isDisliked),
                    isBookmarked: Boolean(post?.isBookmarked),
                    status: (post?.status as CommunityPost['status']) || 'published',
                    createdAt: !Number.isNaN(createdAt.getTime()) ? createdAt.toISOString() : new Date().toISOString(),
                    updatedAt: !Number.isNaN(updatedAt.getTime()) ? updatedAt.toISOString() : new Date().toISOString(),
                }

                return normalizedPost
            })

            const paginationPayload = resolvePaginationPayload(response)

            const normalizedPagination = paginationPayload
                ? {
                    page: Number(paginationPayload.page ?? 1) || 1,
                    limit: Number(paginationPayload.limit ?? normalizedPosts.length) || normalizedPosts.length || 10,
                    total: Number(paginationPayload.total ?? normalizedPosts.length) || normalizedPosts.length,
                    pages: Number(paginationPayload.pages ?? paginationPayload.totalPages ?? 1) || 1,
                    totalPages: Number(paginationPayload.totalPages ?? paginationPayload.pages ?? 1) || 1,
                }
                : {
                    page: 1,
                    limit: normalizedPosts.length,
                    total: normalizedPosts.length,
                    pages: normalizedPosts.length > 0 ? 1 : 0,
                    totalPages: normalizedPosts.length > 0 ? 1 : 0,
                }

            return {
                posts: normalizedPosts,
                pagination: normalizedPagination,
            }
        } catch (error) {
            console.error('커뮤니티 게시글 목록 조회 실패:', error)
            throw new Error(
                error instanceof Error
                    ? error.message
                    : '커뮤니티 게시글을 불러오는 중 오류가 발생했습니다.',
            )
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
