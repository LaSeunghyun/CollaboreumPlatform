import { apiCall } from './base';

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
  getEvents: () => apiCall('/events'),
  getCategories: () => apiCall('/community/categories'),
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
  replyToComment: (postId: string, commentId: string, content: string) =>
    apiCall(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId: commentId }),
    }),
  incrementNoticeViews: (noticeId: string) =>
    apiCall(`/community/posts/${noticeId}/views`, {
      method: 'POST',
    }),
};

export const communityPostAPI = {
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
    if (params?.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return apiCall(`/community/posts${queryString ? `?${queryString}` : ''}`);
  },

  getPostById: (postId: string) => apiCall(`/community/posts/${postId}`),

  createPost: (data: any) =>
    apiCall('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (postId: string, data: any) =>
    apiCall(`/community/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (postId: string) =>
    apiCall(`/community/posts/${postId}`, {
      method: 'DELETE',
    }),

  togglePostVisibility: (postId: string, isVisible: boolean) =>
    apiCall(`/community/posts/${postId}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ isVisible }),
    }),

  togglePostPin: (postId: string, isPinned: boolean) =>
    apiCall(`/community/posts/${postId}/pin`, {
      method: 'PUT',
      body: JSON.stringify({ isPinned }),
    }),

  getPostReactions: (postId: string) =>
    apiCall(`/community/posts/${postId}/reactions`),

  likePost: (postId: string, action: 'like' | 'unlike') =>
    apiCall(`/community/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction: action }),
    }),

  bookmarkPost: (postId: string, action: 'bookmark' | 'unbookmark') =>
    apiCall(`/community/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  getCategories: () => apiCall('/community/categories'),

  getStats: () => apiCall('/stats/community'),

  getMyPosts: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(`/community/posts/my${queryString ? `?${queryString}` : ''}`);
  },

  getBookmarkedPosts: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(`/community/posts/bookmarked${queryString ? `?${queryString}` : ''}`);
  },
};

export const communityCommentAPI = {
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

  createComment: (
    postId: string,
    data: { content: string; parentId?: string },
  ) =>
    apiCall(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateComment: (
    postId: string,
    commentId: string,
    data: { content: string },
  ) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteComment: (postId: string, commentId: string) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),

  toggleCommentReaction: (
    postId: string,
    commentId: string,
    reaction: 'like' | 'dislike' | 'unlike',
  ) =>
    apiCall(`/community/posts/${postId}/comments/${commentId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }),

  likeComment: (commentId: string, action: 'like' | 'unlike') =>
    apiCall(`/community/comments/${commentId}/like`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  getMyComments: (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiCall(`/community/comments/my${queryString ? `?${queryString}` : ''}`);
  },
};
