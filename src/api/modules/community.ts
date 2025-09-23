import { apiCall } from '../core/client';

// Community APIs
export const communityAPI = {
  getForumPosts: (
    category?: string,
    options?: {
      sort?: string;
      order?: string;
      page?: number;
      limit?: number;
      search?: string;
    },
  ) => {
    const params = new URLSearchParams();
    if (category && category !== '전체') params.append('category', category);
    if (options?.sort) params.append('sort', options.sort);
    if (options?.order) params.append('order', options.order);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);

    const queryString = params.toString();
    return apiCall(`/community/posts${queryString ? `?${queryString}` : ''}`);
  },
  getEvents: () => apiCall('/events'), // 올바른 경로로 수정
  getCategories: () => apiCall('/community/categories'), // 카테고리 API 추가
  createPost: (data: any) =>
    apiCall('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  likePost: (postId: number) =>
    apiCall(`/community/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction: 'like' }),
    }),
  commentOnPost: (postId: number, content: string) =>
    apiCall(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  // 대댓글 작성 API 추가
  replyToComment: (postId: string, commentId: string, content: string) =>
    apiCall(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId: commentId }),
    }),
  // 공지사항 조회수 증가
  incrementNoticeViews: (noticeId: string) =>
    apiCall(`/community/posts/${noticeId}/views`, {
      method: 'POST',
    }),
};

// Community Post APIs
export const communityPostAPI = {
  // 게시글 목록 조회
  getPosts: (params?: {
    category?: string;
    search?: string;
    author?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.author) queryParams.append('author', params.author);
    if (params?.tags && params.tags.length > 0)
      queryParams.append('tags', params.tags.join(','));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall(`/community/posts${queryString ? `?${queryString}` : ''}`);
  },

  // 게시글 상세 조회
  getPost: (postId: string) => apiCall(`/community/posts/${postId}`),
  getPostById: (postId: string) => apiCall(`/community/posts/${postId}`),

  // 게시글 생성
  createPost: (data: any) =>
    apiCall('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 게시글 수정
  updatePost: (postId: string, data: any) =>
    apiCall(`/community/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 게시글 삭제
  deletePost: (postId: string) =>
    apiCall(`/community/posts/${postId}`, {
      method: 'DELETE',
    }),

  // 게시글 좋아요/싫어요
  togglePostReaction: (
    postId: string,
    reaction: 'like' | 'dislike' | 'unlike' | 'undislike',
  ) =>
    apiCall(`/community/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }),

  // 게시글 조회수 증가
  incrementPostViews: (postId: string) =>
    apiCall(`/community/posts/${postId}/views`, {
      method: 'POST',
    }),

  // 게시글 사용자별 반응 상태 확인
  getPostReactions: (postId: string) =>
    apiCall(`/community/posts/${postId}/reactions`),

  // 게시글 좋아요
  likePost: (postId: string, action: 'like' | 'unlike') =>
    apiCall(`/community/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction: action }),
    }),

  // 게시글 북마크
  bookmarkPost: (postId: string, action: 'bookmark' | 'unbookmark') =>
    apiCall(`/community/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // 카테고리 목록 조회
  getCategories: () => apiCall('/community/categories'),

  // 통계 조회
  getStats: () => apiCall('/stats/community'),

  // 내 게시글 조회
  getMyPosts: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(
      `/community/posts/my${queryString ? `?${queryString}` : ''}`,
    );
  },

  // 북마크한 게시글 조회
  getBookmarkedPosts: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(
      `/community/posts/bookmarked${queryString ? `?${queryString}` : ''}`,
    );
  },
};

// Community Comment APIs
export const communityCommentAPI = {
  // 게시글 댓글 목록 조회
  getComments: (
    postId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) => {
    const queryParams = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(`/community/posts/${postId}/comments${queryParams}`);
  },

  // 댓글 작성
  createComment: (
    postId: string,
    data: { content: string; parentId?: string },
  ) =>
    apiCall(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 댓글 수정
  updateComment: (
    postId: string,
    commentId: string,
    data: { content: string },
  ) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 댓글 삭제
  deleteComment: (postId: string, commentId: string) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // 댓글 좋아요/싫어요
  toggleCommentReaction: (
    postId: string,
    commentId: string,
    reaction: 'like' | 'dislike' | 'unlike',
  ) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }),

  // 댓글 좋아요
  likeComment: (commentId: string, action: 'like' | 'unlike') =>
    apiCall(`/community/comments/${commentId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // 내 댓글 조회
  getMyComments: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(
      `/community/comments/my${queryString ? `?${queryString}` : ''}`,
    );
  },
};
