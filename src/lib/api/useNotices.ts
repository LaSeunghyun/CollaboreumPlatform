import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api/community';
import type {
  CommunityPost,
  CreateCommunityPostData,
  UpdateCommunityPostData,
} from '@/features/community/types';
import type { ApiResponse } from '@/shared/types';

type NoticeResponse =
  | ApiResponse<{
      posts: CommunityPost[];
    }>
  | {
      posts?: CommunityPost[];
      data?: {
        posts?: CommunityPost[];
      };
    };

interface NoticeMutationPayload extends CreateCommunityPostData {
  isPinned?: boolean;
  isImportant?: boolean;
}

interface NoticeUpdatePayload extends UpdateCommunityPostData {
  isPinned?: boolean;
  isImportant?: boolean;
}

const extractNoticePosts = (response: NoticeResponse): CommunityPost[] => {
  const directPosts = Array.isArray((response as any).posts)
    ? (response as any).posts
    : undefined;
  if (directPosts) {
    return directPosts;
  }

  if (response.data && Array.isArray(response.data.posts)) {
    return response.data.posts;
  }

  return [];
};

// 공지사항 목록 조회 (커뮤니티 API의 notice 카테고리 사용)
export const useNotices = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () =>
      communityAPI.getForumPosts('notice', {
        sort: params?.sortBy || 'createdAt',
        order: params?.order || 'desc',
        page: params?.page,
        limit: params?.limit,
      }),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1, // 재시도 1회만
    retryDelay: 1000,
  });
};

// 공지사항 상세 조회
export const useNotice = (noticeId: string) => {
  return useQuery<CommunityPost | undefined>({
    queryKey: ['notice', noticeId],
    queryFn: () =>
      communityAPI
        .getForumPosts('notice', {
          search: noticeId,
          limit: 1,
        })
        .then((response: any) => {
          const notices = extractNoticePosts(response);
          return (
            notices.find(notice => String(notice.id) === noticeId) ?? notices[0]
          );
        }),
    enabled: !!noticeId,
    staleTime: 10 * 60 * 1000,
  });
};

// 공지사항 생성 (관리자용)
export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoticeMutationPayload) =>
      communityAPI.createPost({
        ...data,
        category: 'notice',
        isPinned: data.isPinned ?? false,
        isImportant: data.isImportant ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// 공지사항 수정 (관리자용)
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noticeId,
      data,
    }: {
      noticeId: string;
      data: NoticeUpdatePayload;
    }) =>
      communityAPI.createPost({
        ...data,
        id: noticeId,
        category: 'notice',
        isPinned: data.isPinned ?? false,
        isImportant: data.isImportant ?? false,
      }),
    onSuccess: (_, { noticeId }) => {
      queryClient.invalidateQueries({ queryKey: ['notice', noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// 공지사항 조회수 증가
export const useIncrementNoticeViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noticeId: string) =>
      communityAPI.incrementNoticeViews(noticeId),
    onSuccess: (_, noticeId) => {
      // 공지사항 상세 조회 캐시 무효화하여 조회수 업데이트 반영
      queryClient.invalidateQueries({ queryKey: ['notice', noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};
