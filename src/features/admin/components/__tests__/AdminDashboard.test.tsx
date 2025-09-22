import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '../AdminDashboard';
import { useAdminMetrics } from '../../hooks/useAdminData';

// Mock useAdminMetrics hook
jest.mock('../../hooks/useAdminData');
const mockUseAdminMetrics = useAdminMetrics as jest.MockedFunction<
  typeof useAdminMetrics
>;

// Mock lazy components
jest.mock('../sections/OverviewSection', () => ({
  OverviewSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'overview-section' },
      'Overview Section',
    );
  },
}));

jest.mock('../sections/UserManagementSection', () => ({
  UserManagementSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'user-management-section' },
      'User Management Section',
    );
  },
}));

jest.mock('../sections/FundingManagementSection', () => ({
  FundingManagementSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'funding-management-section' },
      'Funding Management Section',
    );
  },
}));

jest.mock('../sections/CommunityManagementSection', () => ({
  CommunityManagementSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'community-management-section' },
      'Community Management Section',
    );
  },
}));

jest.mock('../sections/ArtworkManagementSection', () => ({
  ArtworkManagementSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'artwork-management-section' },
      'Artwork Management Section',
    );
  },
}));

jest.mock('../sections/FinanceManagementSection', () => ({
  FinanceManagementSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'finance-management-section' },
      'Finance Management Section',
    );
  },
}));

jest.mock('../sections/AnalyticsSection', () => ({
  AnalyticsSection: () => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'analytics-section' },
      'Analytics Section',
    );
  },
}));

// Mock AdminLayout
jest.mock('../AdminLayout', () => ({
  AdminLayout: ({ children, title, onBack }: any) => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'admin-layout' },
      React.createElement('div', { 'data-testid': 'admin-title' }, title),
      React.createElement(
        'button',
        { 'data-testid': 'back-button', onClick: onBack },
        '뒤로가기',
      ),
      children,
    );
  },
}));

// Mock PermissionGuard
jest.mock('../PermissionGuard', () => ({
  PermissionGuard: ({ children, permission }: any) =>
    React.createElement(
      'div',
      { 'data-testid': `permission-guard-${permission}` },
      children,
    ),
}));

// Mock NotificationCenter
jest.mock('../NotificationCenter', () => ({
  NotificationCenter: () =>
    React.createElement(
      'div',
      { 'data-testid': 'notification-center' },
      'Notification Center',
    ),
}));

// Mock RealTimeAlerts
jest.mock('../RealTimeAlerts', () => ({
  RealTimeAlerts: () =>
    React.createElement(
      'div',
      { 'data-testid': 'real-time-alerts' },
      'Real Time Alerts',
    ),
}));

// Mock LiveSystemMonitor
jest.mock('../LiveSystemMonitor', () => ({
  LiveSystemMonitor: () =>
    React.createElement(
      'div',
      { 'data-testid': 'live-system-monitor' },
      'Live System Monitor',
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

// QueryClient 래퍼 컴포넌트
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, children),
    );
};

describe('AdminDashboard 컴포넌트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminMetrics.mockReturnValue({
      data: mockDashboardMetrics,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: jest.fn(),
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      fetchStatus: 'idle' as const,
      status: 'success' as const,
    });
  });

  it('기본적으로 렌더링된다', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    expect(screen.getByTestId('admin-title')).toHaveTextContent(
      '관리자 대시보드',
    );
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('탭 목록이 올바르게 렌더링된다', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: '개요' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '회원관리' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '펀딩관리' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '커뮤니티' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '작품관리' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '재정관리' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '신고관리' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '분석' })).toBeInTheDocument();
  });

  it('기본적으로 개요 탭이 선택되어 있다', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: '개요' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByTestId('overview-section')).toBeInTheDocument();
  });

  it('탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    // 회원관리 탭 클릭
    fireEvent.click(screen.getByRole('tab', { name: '회원관리' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '회원관리' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('permission-guard-userManagement'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('user-management-section')).toBeInTheDocument();
  });

  it('펀딩관리 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '펀딩관리' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '펀딩관리' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('permission-guard-fundingOversight'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('funding-management-section'),
    ).toBeInTheDocument();
  });

  it('커뮤니티 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '커뮤니티' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '커뮤니티' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('community-management-section'),
    ).toBeInTheDocument();
  });

  it('작품관리 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '작품관리' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '작품관리' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('artwork-management-section'),
    ).toBeInTheDocument();
  });

  it('재정관리 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '재정관리' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '재정관리' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('finance-management-section'),
    ).toBeInTheDocument();
  });

  it('신고관리 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '신고관리' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '신고관리' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(
      screen.getByTestId('permission-guard-communityModeration'),
    ).toBeInTheDocument();
  });

  it('분석 탭을 클릭하면 해당 섹션이 표시된다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('tab', { name: '분석' }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: '분석' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    expect(screen.getByTestId('analytics-section')).toBeInTheDocument();
  });

  it('onBack prop이 제공되면 해당 함수를 호출한다', () => {
    const mockOnBack = jest.fn();
    render(<AdminDashboard onBack={mockOnBack} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('onBack prop이 없으면 window.history.back()을 호출한다', () => {
    const mockHistoryBack = jest.fn();
    Object.defineProperty(window, 'history', {
      value: {
        back: mockHistoryBack,
        length: 2,
      },
      writable: true,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('window.history.back()이 실패하면 홈으로 리다이렉트한다', () => {
    const mockLocation = jest.fn();
    Object.defineProperty(window, 'history', {
      value: {
        back: jest.fn(() => {
          throw new Error('History back failed');
        }),
        length: 2,
      },
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { href: mockLocation },
      writable: true,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockLocation).toHaveBeenCalledWith('/');
  });

  it('window.history.length가 1이면 홈으로 리다이렉트한다', () => {
    const mockLocation = jest.fn();
    Object.defineProperty(window, 'history', {
      value: {
        back: jest.fn(),
        length: 1,
      },
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { href: mockLocation },
      writable: true,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockLocation).toHaveBeenCalledWith('/');
  });

  it('탭 전환 시 이전 탭의 내용이 숨겨진다', async () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    // 처음에는 개요 섹션이 보임
    expect(screen.getByTestId('overview-section')).toBeInTheDocument();

    // 회원관리 탭 클릭
    fireEvent.click(screen.getByRole('tab', { name: '회원관리' }));

    await waitFor(() => {
      expect(screen.getByTestId('user-management-section')).toBeInTheDocument();
    });

    // 개요 섹션은 더 이상 보이지 않음
    expect(screen.queryByTestId('overview-section')).not.toBeInTheDocument();
  });

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('role', 'tab');
    });
  });
});
