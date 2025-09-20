import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LiveAndPointsSection } from '../components/LiveAndPointsSection'

// Mock the API hook
jest.mock('../lib/api/useLiveStreams', () => ({
    useLiveStreams: jest.fn()
}))

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const renderWithQueryClient = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    )
}

describe('LiveAndPointsSection', () => {
    const { useLiveStreams: mockUseLiveStreams } = await import('../lib/api/useLiveStreams');

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('로딩 상태를 올바르게 표시한다', () => {
        mockUseLiveStreams.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null
        })

        renderWithQueryClient(<LiveAndPointsSection />)

        expect(screen.getByText('라이브 스트림 데이터를 불러오는 중...')).toBeInTheDocument()
    })

    it('에러 상태를 올바르게 표시한다', () => {
        mockUseLiveStreams.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('API Error')
        })

        renderWithQueryClient(<LiveAndPointsSection />)

        expect(screen.getByText('라이브 스트림 데이터를 불러오는데 실패했습니다.')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
    })

    it('라이브 스트림 데이터를 올바르게 표시한다', async () => {
        const mockStreams = [
            {
                id: '1',
                title: 'Test Stream',
                artist: 'Test Artist',
                category: '음악',
                status: 'live' as const,
                viewers: 100
            }
        ]

        mockUseLiveStreams.mockReturnValue({
            data: { data: { streams: mockStreams } },
            isLoading: false,
            error: null
        })

        renderWithQueryClient(<LiveAndPointsSection />)

        await waitFor(() => {
            expect(screen.getByText('Test Stream')).toBeInTheDocument()
        })

        expect(screen.getByText('by Test Artist')).toBeInTheDocument()
        expect(screen.getByText('100명 시청 중')).toBeInTheDocument()
    })

    it('빈 데이터 상태를 올바르게 처리한다', () => {
        mockUseLiveStreams.mockReturnValue({
            data: { data: { streams: [] } },
            isLoading: false,
            error: null
        })

        renderWithQueryClient(<LiveAndPointsSection />)

        expect(screen.getByText('라이브 스트리밍')).toBeInTheDocument()
        expect(screen.getByText('실시간 창작 과정을 지켜보고 함께 소통하세요')).toBeInTheDocument()
    })
})
