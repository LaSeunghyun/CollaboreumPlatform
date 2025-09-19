// 커뮤니티 관련 타입 정의

export interface CommunityUser {
    id: string;
    username: string;
    name: string;
    role: 'admin' | 'artist' | 'fan';
    avatar?: string;
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

export interface CommunityComment {
    id: string;
    content: string;
    author: CommunityUser;
    postId: string;
    parentId?: string;
    likes: number;
    dislikes: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    createdAt: string;
    updatedAt: string;
    replies: CommunityComment[];
}

export interface CommunityCategory {
    id: string;
    name: string;
    label: string;
    description?: string;
    color?: string;
    postCount: number;
}

export interface CommunityStats {
    totalPosts: number;
    totalComments: number;
    totalUsers: number;
    totalLikes: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
}

export interface PostListParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: 'createdAt' | 'likes' | 'views' | 'comments';
    order?: 'asc' | 'desc';
    author?: string;
    tags?: string[];
}

export interface CommentListParams {
    postId: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'likes';
    order?: 'asc' | 'desc';
}

export interface CreatePostData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    images?: string[];
    status?: 'published' | 'draft';
}

export interface CreateCommentData {
    content: string;
    postId: string;
    parentId?: string;
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    status?: 'published' | 'draft' | 'archived';
}

export interface UpdateCommentData {
    content: string;
}

export interface PostListResponse {
    posts: CommunityPost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats?: CommunityStats;
}

export interface CommentListResponse {
    comments: CommunityComment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface CategoryListResponse {
    categories: CommunityCategory[];
}

export interface PostDetailResponse {
    post: CommunityPost;
    comments: CommunityComment[];
    relatedPosts: CommunityPost[];
}

// API 응답 타입
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

// 필터 및 정렬 옵션
export interface PostFilters {
    category?: string;
    search?: string;
    author?: string;
    tags?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
}

export interface PostSortOptions {
    field: 'createdAt' | 'likes' | 'views' | 'comments' | 'title';
    order: 'asc' | 'desc';
}

// UI 상태 타입
export interface CommunityUIState {
    activeTab: 'list' | 'create' | 'my-posts';
    selectedPost?: string;
    showCreateModal: boolean;
    searchQuery: string;
    selectedCategory: string;
    sortBy: PostSortOptions['field'];
    sortOrder: PostSortOptions['order'];
}

// 컴포넌트 Props 타입
export interface PostCardProps {
    post: CommunityPost;
    onPostClick?: (post: CommunityPost) => void;
    onLike?: (postId: string) => void;
    onDislike?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onReport?: (postId: string) => void;
    onEdit?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    showActions?: boolean;
    compact?: boolean;
}

export interface CommentItemProps {
    comment: CommunityComment;
    onLike?: (commentId: string) => void;
    onDislike?: (commentId: string) => void;
    onReply?: (commentId: string) => void;
    onEdit?: (commentId: string) => void;
    onDelete?: (commentId: string) => void;
    onReport?: (commentId: string) => void;
    showActions?: boolean;
    level?: number;
}

export interface PostFormProps {
    initialData?: Partial<CreatePostData>;
    onSubmit: (data: CreatePostData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export interface CommentFormProps {
    postId: string;
    parentId?: string;
    onSubmit: (data: CreateCommentData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    placeholder?: string;
}
