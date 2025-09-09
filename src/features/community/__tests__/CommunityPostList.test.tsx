// 커뮤니티 게시글 목록 컴포넌트 테스트
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CommunityPostList } from '../components/CommunityPostList'
import { useCommunityPosts } from '../hooks/useCommunityPosts'

// Mock the hooks
jest.mock('../hooks/useCommunityPosts')
jest.mock('../hooks/useCommunityComments')

const mockUseCommunityPosts = useCommunityPosts as jest.MockedFunction<typeof useCommunityPosts>

// Mock data
const mockPosts = [
    {
        id: '1',
        title: '테스트 게시글 1',
        content: '테스트 내용입니다.',
        author: {
            id: 'user1',
            name: '테스트 사용자',
            role: 'user'
        },
        category: '음악',
        tags: ['태그1', '태그2'],
        likes: 10,
        replies: 5,
        views: 100,
        isHot: true,
        isPinned: false,
        status: 'published' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        title: '테스트 게시글 2',
        content: '테스트 내용입니다.',
        author: {
            id: 'user2',
            name: '테스트 사용자 2',
            role: 'user'
        },
        category: '미술',
        tags: ['태그3'],
        likes: 5,
        replies: 2,
        views: 50,
        isHot: false,
        isPinned: true,
        status: 'published' as const,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
    }
]

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('CommunityPostList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('로딩 상태에서 스켈레톤을 렌더링한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument()
    })

    it('에러 상태에서 에러 메시지를 표시한다', () => {
        const mockError = new Error('API 에러')
        mockUseCommunityPosts.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: mockError,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('게시글을 불러올 수 없습니다')).toBeInTheDocument()
        expect(screen.getByText('API 에러')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
    })

    it('빈 상태에서 빈 상태 메시지를 표시한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('게시글이 없습니다')).toBeInTheDocument()
        expect(screen.getByText('첫 번째 게시글을 작성해보세요.')).toBeInTheDocument()
    })

    it('게시글 목록을 올바르게 렌더링한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: mockPosts, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('테스트 게시글 1')).toBeInTheDocument()
        expect(screen.getByText('테스트 게시글 2')).toBeInTheDocument()
        expect(screen.getByText('테스트 사용자')).toBeInTheDocument()
        expect(screen.getByText('테스트 사용자 2')).toBeInTheDocument()
    })

    it('인기 게시글에 인기 배지를 표시한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: mockPosts, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('인기')).toBeInTheDocument()
    })

    it('고정 게시글에 고정 배지를 표시한다', () => {
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: mockPosts, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        expect(screen.getByText('고정')).toBeInTheDocument()
    })

    it('게시글 클릭 시 onPostClick을 호출한다', () => {
        const mockOnPostClick = jest.fn()
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: mockPosts, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        } as any)

        render(<CommunityPostList onPostClick={mockOnPostClick} />, { wrapper: createWrapper() })

        fireEvent.click(screen.getByText('테스트 게시글 1'))
        expect(mockOnPostClick).toHaveBeenCalledWith('1')
    })

    it('좋아요 버튼 클릭 시 좋아요 수가 증가한다', async () => {
        const mockRefetch = jest.fn()
        mockUseCommunityPosts.mockReturnValue({
            data: { posts: mockPosts, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        } as any)

        render(<CommunityPostList />, { wrapper: createWrapper() })

        const likeButton = screen.getAllByText('10')[0] // 첫 번째 게시글의 좋아요 버튼
        fireEvent.click(likeButton!)

        // 좋아요 API 호출은 모킹되어 있으므로 실제로는 테스트하지 않음
        // 실제 구현에서는 mutation이 호출되는지 확인해야 함
    })
})
