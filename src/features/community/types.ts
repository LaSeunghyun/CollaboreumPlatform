// 커뮤니티 도메인 타입 정의

export interface CommunityPost {
    id: string
    title: string
    content: string
    author: {
        id: string
        name: string
        avatar?: string
        role: string
    }
    category: string
    tags: string[]
    likes: number
    replies: number
    views: number
    isHot: boolean
    isPinned: boolean
    status: 'published' | 'draft' | 'archived'
    createdAt: string
    updatedAt: string
    publishedAt?: string
}

export interface CommunityPostListQuery {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: 'createdAt' | 'likes' | 'replies' | 'views'
    order?: 'asc' | 'desc'
    status?: 'published' | 'draft' | 'archived'
    authorId?: string
}

export interface CommunityPostListResponse {
    posts: CommunityPost[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface CreateCommunityPostData {
    title: string
    content: string
    category: string
    tags: string[]
    status?: 'published' | 'draft'
}

export interface UpdateCommunityPostData {
    title?: string
    content?: string
    category?: string
    tags?: string[]
    status?: 'published' | 'draft' | 'archived'
}

export interface CommunityComment {
    id: string
    content: string
    author: {
        id: string
        name: string
        avatar?: string
    }
    postId: string
    parentId?: string
    likes: number
    createdAt: string
    updatedAt: string
}

export interface CreateCommunityCommentData {
    content: string
    postId: string
    parentId?: string
}

export interface CommunityCategory {
    id: string
    label: string
    description?: string
    color?: string
    icon?: string
    postCount?: number
    isActive: boolean
    order: number
}
