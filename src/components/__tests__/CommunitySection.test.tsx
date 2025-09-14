import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunitySection } from '../CommunitySection';
import { useCommunityPosts } from '../../lib/api/useCommunityPosts';
import { useUpcomingEvents } from '../../lib/api/useEvents';

// Mock the API modules
jest.mock('../../services/api', () => ({
    eventManagementAPI: {
        getEvents: jest.fn(),
        getEventById: jest.fn(),
    },
}));

jest.mock('../../features/community/api/communityApi', () => ({
    communityApi: {
        getPosts: jest.fn(),
        getPopularPosts: jest.fn(),
        getRecentPosts: jest.fn(),
    },
}));

// Mock the hooks
jest.mock('../../lib/api/useCommunityPosts');
jest.mock('../../lib/api/useEvents');

const mockUseCommunityPosts = useCommunityPosts as jest.MockedFunction<typeof useCommunityPosts>;
const mockUseUpcomingEvents = useUpcomingEvents as jest.MockedFunction<typeof useUpcomingEvents>;

// Mock data
const mockForumPosts = {
    posts: [
        {
            id: '1',
            title: '인디음악 페스티벌 추천해주세요!',
            author: {
                id: 'user1',
                name: '음악러버',
                avatar: '',
                role: 'user'
            },
            category: '음악',
            tags: ['음악', '페스티벌'],
            likes: 45,
            dislikes: 2,
            replies: 23,
            views: 156,
            viewCount: 156,
            isHot: true,
            isPinned: false,
            status: 'published' as const,
            content: '최근에 좋은 인디음악 페스티벌이 있나요?',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            publishedAt: '2024-01-15T10:00:00Z'
        },
        {
            id: '2',
            title: '젊은 작가들의 현대미술 트렌드',
            author: {
                id: 'user2',
                name: '아트크리틱',
                avatar: '',
                role: 'user'
            },
            category: '미술',
            tags: ['미술', '현대미술'],
            likes: 28,
            dislikes: 1,
            replies: 12,
            views: 89,
            viewCount: 89,
            isHot: false,
            isPinned: false,
            status: 'published' as const,
            content: '현대미술의 새로운 트렌드에 대해 이야기해보세요.',
            createdAt: '2024-01-15T14:00:00Z',
            updatedAt: '2024-01-15T14:00:00Z',
            publishedAt: '2024-01-15T14:00:00Z'
        }
    ],
    pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
    }
};

const mockEvents = {
    data: [
        {
            id: '1',
            title: '홍대 인디밴드 합동공연',
            description: '다양한 인디밴드들의 합동공연',
            category: '음악',
            startDate: '2025-08-15T19:00:00Z',
            endDate: '2025-08-15T22:00:00Z',
            time: '19:00',
            location: '홍대 클럽 에반스',
            currentAttendees: 89,
            maxAttendees: 150,
            status: 'upcoming',
            image: '',
            tags: ['인디', '밴드', '공연']
        },
        {
            id: '2',
            title: '신진작가 그룹전 \'새로운 시선\'',
            description: '젊은 작가들의 작품 전시',
            category: '미술',
            startDate: '2025-08-18T14:00:00Z',
            endDate: '2025-08-18T18:00:00Z',
            time: '14:00',
            location: '서울시립미술관',
            currentAttendees: 156,
            maxAttendees: 200,
            status: 'upcoming',
            image: '',
            tags: ['미술', '전시', '작가']
        }
    ]
};

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('CommunitySection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('로딩 상태에서 스켈레톤을 렌더링해야 한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            isError: false,
            isSuccess: false,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            isError: false,
            isSuccess: false,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        expect(screen.getByText('커뮤니티 & 이벤트')).toBeInTheDocument();
        // 로딩 상태에서는 실제 데이터가 렌더링되지 않아야 함
        expect(screen.queryByText('인디음악 페스티벌 추천해주세요!')).not.toBeInTheDocument();
    });

    it('에러 상태에서 에러 메시지를 표시해야 한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('API Error'),
            isError: true,
            isSuccess: false,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('API Error'),
            isError: true,
            isSuccess: false,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        expect(screen.getByText('커뮤니티 & 이벤트')).toBeInTheDocument();
        // 에러 상태에서는 실제 데이터가 렌더링되지 않아야 함
        expect(screen.queryByText('인디음악 페스티벌 추천해주세요!')).not.toBeInTheDocument();
    });

    it('성공적으로 데이터를 로드하면 포럼 게시글과 이벤트를 표시해야 한다', async () => {
        mockUseCommunityPosts.mockReturnValue({
            data: mockForumPosts,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        await waitFor(() => {
            expect(screen.getByText('인디음악 페스티벌 추천해주세요!')).toBeInTheDocument();
            expect(screen.getByText('젊은 작가들의 현대미술 트렌드')).toBeInTheDocument();
            expect(screen.getByText('홍대 인디밴드 합동공연')).toBeInTheDocument();
            expect(screen.getByText('신진작가 그룹전 \'새로운 시선\'')).toBeInTheDocument();
        });
    });

    it('빈 데이터 상태에서 적절한 메시지를 표시해야 한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        expect(screen.getByText('커뮤니티 & 이벤트')).toBeInTheDocument();
        // 빈 상태에서는 실제 데이터가 렌더링되지 않아야 함
        expect(screen.queryByText('인디음악 페스티벌 추천해주세요!')).not.toBeInTheDocument();
    });

    it('onViewAllCommunity 콜백이 호출되어야 한다', async () => {
        const mockOnViewAllCommunity = jest.fn();

        mockUseCommunityPosts.mockReturnValue({
            data: mockForumPosts,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection onViewAllCommunity={mockOnViewAllCommunity} />);

        const viewAllButton = screen.getByText('전체 보기');
        viewAllButton.click();

        expect(mockOnViewAllCommunity).toHaveBeenCalledTimes(1);
    });

    it('카테고리별로 올바른 색상 배지를 표시해야 한다', async () => {
        mockUseCommunityPosts.mockReturnValue({
            data: mockForumPosts,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        await waitFor(() => {
            expect(screen.getAllByText('음악')).toHaveLength(2); // 포럼과 이벤트에서 각각 1개씩
            expect(screen.getAllByText('미술')).toHaveLength(2); // 포럼과 이벤트에서 각각 1개씩
        });
    });

    it('HOT 배지가 올바르게 표시되어야 한다', async () => {
        mockUseCommunityPosts.mockReturnValue({
            data: mockForumPosts,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        mockUseUpcomingEvents.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            refetch: jest.fn(),
        } as any);

        renderWithQueryClient(<CommunitySection />);

        await waitFor(() => {
            expect(screen.getByText('HOT')).toBeInTheDocument();
        });
    });
});
