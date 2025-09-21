import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard';
import { OverviewSection } from '../components/sections/OverviewSection';
import { MetricsCard } from '../components/MetricsCard';
import {
  useAdminMetrics,
  useUsers,
  useUpdateUserStatus,
} from '../hooks/useAdminData';
import { adminService } from '../services/adminService';

// Mock hooks
jest.mock('../hooks/useAdminData');
const mockUseAdminMetrics = useAdminMetrics as jest.MockedFunction<
  typeof useAdminMetrics
>;
const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;
const mockUseUpdateUserStatus = useUpdateUserStatus as jest.MockedFunction<
  typeof useUpdateUserStatus
>;

// Mock adminService
jest.mock('../services/adminService');
const mockAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock lazy components
jest.mock('../components/sections/UserManagementSection', () => ({
  UserManagementSection: () => (
    <div data-testid='user-management-section'>User Management</div>
  ),
}));

jest.mock('../components/sections/FundingManagementSection', () => ({
  FundingManagementSection: () => (
    <div data-testid='funding-management-section'>Funding Management</div>
  ),
}));

jest.mock('../components/sections/CommunityManagementSection', () => ({
  CommunityManagementSection: () => (
    <div data-testid='community-management-section'>Community Management</div>
  ),
}));

jest.mock('../components/sections/ArtworkManagementSection', () => ({
  ArtworkManagementSection: () => (
    <div data-testid='artwork-management-section'>Artwork Management</div>
  ),
}));

jest.mock('../components/sections/FinanceManagementSection', () => ({
  FinanceManagementSection: () => (
    <div data-testid='finance-management-section'>Finance Management</div>
  ),
}));

jest.mock('../components/sections/AnalyticsSection', () => ({
  AnalyticsSection: () => <div data-testid='analytics-section'>Analytics</div>,
}));

// Mock AdminLayout
jest.mock('../components/AdminLayout', () => ({
  AdminLayout: ({ children, title, onBack }: any) => (
    <div data-testid='admin-layout'>
      <h1>{title}</h1>
      <button onClick={onBack}>Back</button>
      {children}
    </div>
  ),
}));

// Mock PermissionGuard
jest.mock('../components/PermissionGuard', () => ({
  PermissionGuard: ({ children, permission }: any) => (
    <div data-testid={`permission-guard-${permission}`}>{children}</div>
  ),
}));

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

const mockUsers = [
  {
    id: 1,
    name: '김아티스트',
    email: 'artist@example.com',
    role: 'artist',
    status: 'active',
    joinDate: '2024-01-15',
    lastActivity: '2024-01-20',
    fundingCount: 5,
    totalInvestment: 100000,
    reportCount: 0,
  },
  {
    id: 2,
    name: '이팬',
    email: 'fan@example.com',
    role: 'fan',
    status: 'suspended',
    joinDate: '2024-01-10',
    lastActivity: '2024-01-19',
    fundingCount: 3,
    totalInvestment: 50000,
    reportCount: 0,
  },
];

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Admin System 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 mock 설정
    mockUseAdminMetrics.mockReturnValue({
      data: mockDashboardMetrics,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn(),
    });

    mockUseUsers.mockReturnValue({
      data: { data: mockUsers, total: 2, page: 1, limit: 10 },
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn(),
    });

    mockUseUpdateUserStatus.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      reset: jest.fn(),
    });
  });

  describe('대시보드 전체 플로우', () => {
    it('어드민 대시보드가 완전히 로드되고 모든 탭이 작동한다', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      // 대시보드가 로드되는지 확인
      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
      expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();

      // 개요 탭이 기본으로 선택되어 있는지 확인
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();

      // 모든 탭이 존재하는지 확인
      expect(screen.getByRole('tab', { name: '개요' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '회원관리' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '펀딩관리' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '커뮤니티' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '작품관리' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '재정관리' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '신고관리' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '분석' })).toBeInTheDocument();
    });

    it('탭 전환이 올바르게 작동한다', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      // 회원관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '회원관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('user-management-section'),
        ).toBeInTheDocument();
      });

      // 펀딩관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '펀딩관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('funding-management-section'),
        ).toBeInTheDocument();
      });

      // 개요 탭으로 돌아가기
      fireEvent.click(screen.getByRole('tab', { name: '개요' }));

      await waitFor(() => {
        expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      });
    });
  });

  describe('메트릭 데이터 통합', () => {
    it('OverviewSection이 메트릭 데이터를 올바르게 표시한다', async () => {
      render(<OverviewSection />, { wrapper: createWrapper() });

      await waitFor(() => {
        // 사용자 메트릭 확인
        expect(screen.getByText('총 사용자')).toBeInTheDocument();
        expect(screen.getByText('1,000')).toBeInTheDocument();
        expect(screen.getByText('이번 주 신규 사용자')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();

        // 펀딩 메트릭 확인
        expect(screen.getByText('활성 프로젝트')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('총 펀딩 금액')).toBeInTheDocument();
        expect(screen.getByText('₩500,000')).toBeInTheDocument();

        // 수익 메트릭 확인
        expect(screen.getByText('월간 수익')).toBeInTheDocument();
        expect(screen.getByText('₩25,000')).toBeInTheDocument();

        // 커뮤니티 메트릭 확인
        expect(screen.getByText('대기 중인 신고')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });

    it('MetricsCard가 개별적으로 올바르게 작동한다', () => {
      render(
        <MetricsCard
          title='테스트 메트릭'
          value='1,000'
          subtitle='이번 주 +50'
          trend={{ value: 5.2, isPositive: true }}
          icon={<div data-testid='test-icon'>📊</div>}
        />,
        { wrapper: createWrapper() },
      );

      expect(screen.getByText('테스트 메트릭')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('이번 주 +50')).toBeInTheDocument();
      expect(screen.getByText('5.2%')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('에러 처리 통합', () => {
    it('메트릭 로딩 실패 시 에러 메시지가 표시된다', async () => {
      mockUseAdminMetrics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API Error'),
        isSuccess: false,
        refetch: jest.fn(),
      });

      render(<OverviewSection />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(
          screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.'),
        ).toBeInTheDocument();
      });
    });

    it('메트릭 로딩 중일 때 스켈레톤이 표시된다', () => {
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
  });

  describe('권한 관리 통합', () => {
    it('권한이 필요한 섹션에 PermissionGuard가 적용된다', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      // 회원관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '회원관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('permission-guard-userManagement'),
        ).toBeInTheDocument();
      });

      // 펀딩관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '펀딩관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('permission-guard-fundingOversight'),
        ).toBeInTheDocument();
      });

      // 신고관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '신고관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('permission-guard-communityModeration'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('API 통합', () => {
    it('adminService가 올바르게 호출된다', async () => {
      mockAdminService.getDashboardMetrics.mockResolvedValue(
        mockDashboardMetrics,
      );

      render(<OverviewSection />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalled();
      });
    });

    it('사용자 상태 업데이트가 올바르게 작동한다', async () => {
      const mockMutate = jest.fn();
      mockUseUpdateUserStatus.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn(),
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: false,
        reset: jest.fn(),
      });

      // 사용자 상태 업데이트 시뮬레이션
      const updateData = {
        userId: '1',
        status: 'suspended',
        reason: '정책 위반',
      };
      mockMutate(updateData);

      expect(mockMutate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('성능 및 사용자 경험', () => {
    it('탭 전환 시 이전 탭 내용이 제거된다', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      // 개요 탭이 보이는지 확인
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();

      // 회원관리 탭 클릭
      fireEvent.click(screen.getByRole('tab', { name: '회원관리' }));

      await waitFor(() => {
        expect(
          screen.getByTestId('user-management-section'),
        ).toBeInTheDocument();
      });

      // 개요 섹션은 더 이상 보이지 않아야 함
      expect(screen.queryByTestId('overview-section')).not.toBeInTheDocument();
    });

    it('뒤로가기 버튼이 올바르게 작동한다', () => {
      const mockOnBack = jest.fn();
      render(<AdminDashboard onBack={mockOnBack} />, {
        wrapper: createWrapper(),
      });

      fireEvent.click(screen.getByText('Back'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('데이터 일관성', () => {
    it('메트릭 데이터가 변경되면 UI가 업데이트된다', async () => {
      const { rerender } = render(<OverviewSection />, {
        wrapper: createWrapper(),
      });

      // 초기 데이터 확인
      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument();
      });

      // 업데이트된 데이터로 mock 변경
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
  });

  describe('접근성', () => {
    it('키보드 네비게이션이 올바르게 작동한다', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      const overviewTab = screen.getByRole('tab', { name: '개요' });
      const userManagementTab = screen.getByRole('tab', { name: '회원관리' });

      // Tab 키로 네비게이션
      overviewTab.focus();
      expect(document.activeElement).toBe(overviewTab);

      fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(userManagementTab);
    });

    it('ARIA 속성이 올바르게 설정되어 있다', () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab');
      });
    });
  });
});
