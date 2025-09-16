import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCommunityPosts, usePopularPosts, useRecentPosts } from '../useCommunityPosts';
import { communityApi } from '../../../features/community/api/communityApi';

// Mock the API modules
jest.mock('../../../services/api', () => ({
    apiCall: jest.fn(),
}));

jest.mock('../../../features/community/api/communityApi', () => ({
    communityApi: {
        getPosts: jest.fn(),
        getPopularPosts: jest.fn(),
        getRecentPosts: jest.fn(),
    },
}));

const mockCommunityApi = communityApi as jest.Mocked<typeof communityApi>;

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
        {children}
    </QueryClientProvider>
);

describe('useCommunityPosts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('커뮤니티 포스트 목록을 성공적으로 가져와야 한다', async () => {
        const mockData = {
            posts: [
                {
                    id: '1',
                    title: '테스트 게시글',
                    author: { id: 'user1', name: '테스터', avatar: '', role: 'user' },
                    category: '음악',
                    tags: ['테스트'],
                    likes: 10,
                    dislikes: 0,
                    replies: 5,
                    views: 100,
                    viewCount: 100,
                    isHot: false,
                    isPinned: false,
                    status: 'published' as const,
                    content: '테스트 내용',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    publishedAt: '2024-01-01T00:00:00Z'
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1
            }
        };

        mockCommunityApi.getPosts.mockResolvedValue(mockData);

        const { result } = renderHook(() => useCommunityPosts(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockCommunityApi.getPosts).toHaveBeenCalledWith({});
    });

    it('쿼리 파라미터를 올바르게 전달해야 한다', async () => {
        const query = {
            page: 2,
            limit: 20,
            category: '음악',
            search: '테스트'
        };

        mockCommunityApi.getPosts.mockResolvedValue({
            posts: [],
            pagination: { page: 2, limit: 20, total: 0, totalPages: 0 }
        });

        const { result } = renderHook(() => useCommunityPosts(query), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockCommunityApi.getPosts).toHaveBeenCalledWith(query);
    });

    it('API 에러를 올바르게 처리해야 한다', async () => {
        const error = new Error('API Error');
        mockCommunityApi.getPosts.mockRejectedValue(error);

        const { result } = renderHook(() => useCommunityPosts(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
    });
});

describe('usePopularPosts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('인기 게시글을 성공적으로 가져와야 한다', async () => {
        const mockData = [
            {
                id: '1',
                title: '인기 게시글',
                author: { id: 'user1', name: '테스터', avatar: '', role: 'user' },
                category: '음악',
                tags: ['인기'],
                likes: 100,
                dislikes: 0,
                replies: 50,
                views: 1000,
                viewCount: 1000,
                isHot: true,
                isPinned: false,
                status: 'published' as const,
                content: '인기 게시글 내용',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                publishedAt: '2024-01-01T00:00:00Z'
            }
        ];

        mockCommunityApi.getPopularPosts.mockResolvedValue(mockData);

        const { result } = renderHook(() => usePopularPosts(5), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockCommunityApi.getPopularPosts).toHaveBeenCalledWith(5);
    });

    it('기본 limit 값이 10이어야 한다', async () => {
        mockCommunityApi.getPopularPosts.mockResolvedValue([]);

        const { result } = renderHook(() => usePopularPosts(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockCommunityApi.getPopularPosts).toHaveBeenCalledWith(10);
    });
});

describe('useRecentPosts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('최신 게시글을 성공적으로 가져와야 한다', async () => {
        const mockData = [
            {
                id: '1',
                title: '최신 게시글',
                author: { id: 'user1', name: '테스터', avatar: '', role: 'user' },
                category: '미술',
                tags: ['최신'],
                likes: 5,
                dislikes: 0,
                replies: 2,
                views: 50,
                viewCount: 50,
                isHot: false,
                isPinned: false,
                status: 'published' as const,
                content: '최신 게시글 내용',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                publishedAt: '2024-01-01T00:00:00Z'
            }
        ];

        mockCommunityApi.getRecentPosts.mockResolvedValue(mockData);

        const { result } = renderHook(() => useRecentPosts(3), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockCommunityApi.getRecentPosts).toHaveBeenCalledWith(3);
    });

    it('기본 limit 값이 10이어야 한다', async () => {
        mockCommunityApi.getRecentPosts.mockResolvedValue([]);

        const { result } = renderHook(() => useRecentPosts(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockCommunityApi.getRecentPosts).toHaveBeenCalledWith(10);
    });
});
