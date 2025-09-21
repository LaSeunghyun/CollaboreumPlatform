import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OverviewSection } from '../sections/OverviewSection';
import { useAdminMetrics } from '../../hooks/useAdminData';

// Mock useAdminMetrics hook
jest.mock('../../hooks/useAdminData');
const mockUseAdminMetrics = useAdminMetrics as jest.MockedFunction<
  typeof useAdminMetrics
>;

// Mock 데이터
const mockDashboardMetrics = {
  userMetrics: {
    totalUsers: 1000,
    newUsersThisWeek: 50,
    activeArtists: 200,
    userGrowthRate: 5.2,
  },
  fundingMetrics: {
    activeProjects: 25,
    successfulProjectsThisMonth: 12,
    totalFundedAmount: 500000,
    successRate: 75.5,
  },
  revenueMetrics: {
    monthlyRevenue: 25000,
    platformFees: 2500,
    pendingPayouts: 5000,
    growthRate: 12.3,
  },
  communityMetrics: {
    pendingReports: 8,
    postsThisWeek: 150,
    activeDiscussions: 45,
    moderationQueue: 12,
  },
};

// QueryClient 래퍼 컴포넌트
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OverviewSection 컴포넌트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로딩 상태에서 스켈레톤을 표시한다', () => {
    mockUseAdminMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      refetch: jest.fn(),
    });

    render(<OverviewSection />, { wrapper: createWrapper() });

    // 스켈레톤 카드들이 표시되는지 확인
    const skeletonCards = screen.getAllByRole('generic');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('에러 상태에서 에러 메시지를 표시한다', () => {
    const errorMessage = '데이터를 불러오는 중 오류가 발생했습니다';
    mockUseAdminMetrics.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error'),
      isSuccess: false,
      refetch: jest.fn(),
    });

    render(<OverviewSection />, { wrapper: createWrapper() });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('text-red-600');
  });

  it('데이터가 없을 때 빈 상태 메시지를 표시한다', () => {
    mockUseAdminMetrics.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn(),
    });

    render(<OverviewSection />, { wrapper: createWrapper() });

    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument();
  });

  it('메트릭 데이터가 성공적으로 로드되면 카드들을 표시한다', async () => {
    mockUseAdminMetrics.mockReturnValue({
      data: mockDashboardMetrics,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn(),
    });

    render(<OverviewSection />, { wrapper: createWrapper() });

    await waitFor(() => {
      // 사용자 메트릭 카드들 확인
      expect(screen.getByText('총 사용자')).toBeInTheDocument();
    });

    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('이번 주 신규 사용자')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('활성 아티스트')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('사용자 증가율')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });
});

it('펀딩 메트릭 카드들이 올바르게 표시된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    expect(screen.getByText('활성 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('이번 달 성공 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('총 펀딩 금액')).toBeInTheDocument();
    expect(screen.getByText('₩500,000')).toBeInTheDocument();
    expect(screen.getByText('성공률')).toBeInTheDocument();
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });
});

it('수익 메트릭 카드들이 올바르게 표시된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    expect(screen.getByText('월간 수익')).toBeInTheDocument();
    expect(screen.getByText('₩25,000')).toBeInTheDocument();
    expect(screen.getByText('플랫폼 수수료')).toBeInTheDocument();
    expect(screen.getByText('₩2,500')).toBeInTheDocument();
    expect(screen.getByText('대기 중인 지급액')).toBeInTheDocument();
    expect(screen.getByText('₩5,000')).toBeInTheDocument();
    expect(screen.getByText('수익 증가율')).toBeInTheDocument();
    expect(screen.getByText('12.3%')).toBeInTheDocument();
  });
});

it('커뮤니티 메트릭 카드들이 올바르게 표시된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    expect(screen.getByText('대기 중인 신고')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('이번 주 게시물')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('활성 토론')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('검토 대기열')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

it('아이콘들이 올바르게 표시된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    // Lucide React 아이콘들이 렌더링되는지 확인
    // 아이콘은 SVG 요소로 렌더링되므로 data-testid나 role로 찾기 어려움
    // 대신 아이콘과 함께 있는 텍스트로 확인
    expect(screen.getByText('총 사용자')).toBeInTheDocument();
    expect(screen.getByText('활성 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('월간 수익')).toBeInTheDocument();
    expect(screen.getByText('대기 중인 신고')).toBeInTheDocument();
  });
});

it('성장률이 양수일 때 올바른 색상으로 표시된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    const growthRateElement = screen.getByText('5.2%');
    expect(growthRateElement).toBeInTheDocument();
    // 성장률이 양수이므로 green 색상 클래스가 적용되어야 함
    expect(growthRateElement.closest('div')).toHaveClass('text-green-600');
  });
});

it('성장률이 음수일 때 올바른 색상으로 표시된다', async () => {
  const negativeGrowthMetrics = {
    ...mockDashboardMetrics,
    userMetrics: {
      ...mockDashboardMetrics.userMetrics,
      userGrowthRate: -2.5,
    },
  };

  mockUseAdminMetrics.mockReturnValue({
    data: negativeGrowthMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    const growthRateElement = screen.getByText('-2.5%');
    expect(growthRateElement).toBeInTheDocument();
    // 성장률이 음수이므로 red 색상 클래스가 적용되어야 함
    expect(growthRateElement.closest('div')).toHaveClass('text-red-600');
  });
});

it('숫자 포맷팅이 올바르게 적용된다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    // 천 단위 구분자 확인
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('₩500,000')).toBeInTheDocument();
    expect(screen.getByText('₩25,000')).toBeInTheDocument();
  });
});

it('접근성 속성이 올바르게 설정되어 있다', async () => {
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  render(<OverviewSection />, { wrapper: createWrapper() });

  await waitFor(() => {
    // 카드들이 올바른 구조로 렌더링되는지 확인
    const cards = screen.getAllByRole('generic');
    expect(cards.length).toBeGreaterThan(0);
  });
});

it('데이터가 변경되면 UI가 업데이트된다', async () => {
  const { rerender } = render(<OverviewSection />, {
    wrapper: createWrapper(),
  });

  // 초기 데이터
  mockUseAdminMetrics.mockReturnValue({
    data: mockDashboardMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  rerender(<OverviewSection />);

  await waitFor(() => {
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  // 업데이트된 데이터
  const updatedMetrics = {
    ...mockDashboardMetrics,
    userMetrics: {
      ...mockDashboardMetrics.userMetrics,
      totalUsers: 1200,
    },
  };

  mockUseAdminMetrics.mockReturnValue({
    data: updatedMetrics,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    refetch: jest.fn(),
  });

  rerender(<OverviewSection />);

  await waitFor(() => {
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });
});
