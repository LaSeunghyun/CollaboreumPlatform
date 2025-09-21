// 커뮤니티 도메인 통합 export

// 타입
export type {
  CommunityPost,
  CommunityPostListQuery,
  CommunityPostListResponse,
  CreateCommunityPostData,
  UpdateCommunityPostData,
  CommunityComment,
  CreateCommunityCommentData,
  CommunityCategory,
} from './types';

// API
export { communityApi } from './api/communityApi';

// 훅들
export {
  useCommunityPosts,
  useCommunityPost,
  useCreateCommunityPost,
  useUpdateCommunityPost,
  useDeleteCommunityPost,
  useLikeCommunityPost,
  useViewCommunityPost,
  usePopularCommunityPosts,
  useRecentCommunityPosts,
} from './hooks/useCommunityPosts';

export {
  useCommunityComments,
  useCreateCommunityComment,
  useUpdateCommunityComment,
  useDeleteCommunityComment,
  useLikeCommunityComment,
} from './hooks/useCommunityComments';

export { useCommunityCategories } from './hooks/useCommunityCategories';
