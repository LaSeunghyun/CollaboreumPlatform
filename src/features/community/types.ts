// 커뮤니티 도메인 타입 정의
export interface CommunityUser {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    role: 'admin' | 'artist' | 'fan';
    isVerified?: boolean;
}

export interface CommunityPost {
    id: string;
    title: string;
    content: string;
    author: CommunityUser;
    category: string;
    tags: string[];
    likes: number;
    dislikes: number;
    views: number;
    comments: number;
    replies: number;
    viewCount: number;
    isHot: boolean;
    isPinned: boolean;
    isLiked?: boolean;
    isDisliked?: boolean;
    isBookmarked?: boolean;
    createdAt: string;
    updatedAt: string;
    status: 'published' | 'draft' | 'archived';
}

export interface CreateCommunityPostData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    images?: string[];
    status?: 'published' | 'draft';
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
