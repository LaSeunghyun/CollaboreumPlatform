import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../../features/community/api/communityApi';
import type { CommunityPostListQuery } from '../../features/community/types';

// 커뮤니티 포럼 게시글 목록 조회
export const useCommunityPosts = (query: CommunityPostListQuery = {}) => {
  return useQuery({
    queryKey: ['community', 'posts', query],
    queryFn: () => communityApi.getPosts(query),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 인기 게시글 조회
export const usePopularPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['community', 'posts', 'popular', limit],
    queryFn: () => communityApi.getPopularPosts(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// 최신 게시글 조회
export const useRecentPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['community', 'posts', 'recent', limit],
    queryFn: () => communityApi.getRecentPosts(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
