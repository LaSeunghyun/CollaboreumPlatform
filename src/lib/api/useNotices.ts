import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import type { CommunityPost } from '@/features/community';
import type { UnknownRecord } from '@/types/api';

interface ForumPostsResponse {
    success?: boolean;
    posts?: CommunityPost[];
    data?: {
        posts?: CommunityPost[];
    };
}

const isCommunityPost = (value: unknown): value is CommunityPost => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const record = value as Partial<CommunityPost>;
    return typeof record.id === 'string' && typeof record.title === 'string' && typeof record.content === 'string';
};

const extractForumPosts = (response: unknown): CommunityPost[] => {
    if (!response || typeof response !== 'object') {
        return [];
    }

    const { posts, data } = response as ForumPostsResponse;

    if (Array.isArray(posts)) {
        return posts.filter(isCommunityPost);
    }

    if (data && Array.isArray(data.posts)) {
        return data.posts.filter(isCommunityPost);
    }

    return [];
};

type NoticePayload = UnknownRecord & {
    isPinned?: boolean;
    isImportant?: boolean;
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
        queryFn: () => communityAPI.getForumPosts('notice', {
            sort: params?.sortBy || 'createdAt',
            order: params?.order || 'desc',
            page: params?.page,
            limit: params?.limit,
        }),
        staleTime: 10 * 60 * 1000, // 10분
        gcTime: 30 * 60 * 1000, // 30분
        retry: 1, // 재시도 1회만
        retryDelay: 1000
    });
};

// 공지사항 상세 조회
export const useNotice = (noticeId: string) => {
    return useQuery({
        queryKey: ['notice', noticeId],
        queryFn: async () => {
            const response = await communityAPI.getForumPosts('notice', {
                search: noticeId,
                limit: 1
            });
            const notices = extractForumPosts(response);
            return notices.find((notice) => notice.id === noticeId) ?? notices[0];
        },
        enabled: !!noticeId,
        staleTime: 10 * 60 * 1000,
    });
};

// 공지사항 생성 (관리자용)
export const useCreateNotice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NoticePayload) => {
            const { isPinned = false, isImportant = false, ...rest } = data;
            return communityAPI.createPost({
                ...rest,
                category: 'notice',
                isPinned,
                isImportant,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        },
    });
};

// 공지사항 수정 (관리자용)
export const useUpdateNotice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noticeId, data }: { noticeId: string; data: NoticePayload }) => {
            const { isPinned = false, isImportant = false, ...rest } = data;
            return communityAPI.createPost({
                ...rest,
                id: noticeId,
                category: 'notice',
                isPinned,
                isImportant,
            });
        },
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
        mutationFn: (noticeId: string) => communityAPI.incrementNoticeViews(noticeId),
        onSuccess: (_, noticeId) => {
            // 공지사항 상세 조회 캐시 무효화하여 조회수 업데이트 반영
            queryClient.invalidateQueries({ queryKey: ['notice', noticeId] });
            queryClient.invalidateQueries({ queryKey: ['notices'] });
        },
    });
};
