import { adminService } from '../adminService';
import { apiCall } from '../../../services/api';
import {
  AdminDashboardMetrics,
  User,
  FundingProject,
  Artwork,
  Report,
  FinancialData,
  AdminNotification,
  SystemMetrics,
} from '../../types';

// Mock apiCall
jest.mock('../../../services/api/base');
const mockApiCall = apiCall as jest.MockedFunction<typeof apiCall>;

// Mock 데이터
const mockDashboardMetrics: AdminDashboardMetrics = {
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

const mockUsers: User[] = [
  {
    id: 1,
    name: '김아티스트',
    email: 'artist@example.com',
    role: 'artist',
    avatar: 'avatar1.jpg',
    joinDate: '2024-01-15',
    lastActivity: '2024-01-20',
    status: 'active',
    fundingCount: 5,
    totalInvestment: 100000,
    reportCount: 0,
  },
];

const mockFundingProjects: FundingProject[] = [
  {
    id: 1,
    title: '첫 번째 프로젝트',
    artist: {
      id: 1,
      name: '김아티스트',
      avatar: 'avatar1.jpg',
    },
    category: '음악',
    goalAmount: 1000000,
    currentAmount: 750000,
    backerCount: 25,
    deadline: '2024-02-15',
    status: 'active',
    submissionDate: '2024-01-01',
    approvalStatus: 'approved',
  },
];

const mockArtworks: Artwork[] = [
  {
    id: 1,
    title: '예술 작품 1',
    artist: '김아티스트',
    artistAvatar: 'avatar1.jpg',
    category: '회화',
    medium: '유화',
    dimensions: '50x70cm',
    price: 500000,
    status: 'approved',
    uploadDate: '2024-01-15',
    description: '아름다운 풍경화',
    imageUrl: 'artwork1.jpg',
    tags: ['풍경', '유화'],
    views: 150,
    likes: 25,
  },
];

const mockReports: Report[] = [
  {
    id: 1,
    reporter: {
      id: 2,
      name: '이팬',
      avatar: 'avatar2.jpg',
    },
    reportedUser: {
      id: 3,
      name: '신고된사용자',
      avatar: 'avatar3.jpg',
    },
    contentType: 'user',
    contentId: 3,
    reason: 'spam',
    description: '스팸성 댓글을 계속 작성',
    status: 'pending',
    createdAt: '2024-01-20',
  },
];

const mockFinancialData: FinancialData[] = [
  {
    month: '2024-01',
    totalRevenue: 100000,
    platformFee: 10000,
    artistPayouts: 80000,
    investorReturns: 5000,
    pendingPayments: 5000,
  },
];

const mockNotifications: AdminNotification[] = [
  {
    id: '1',
    type: 'urgent',
    category: 'funding',
    title: '새로운 펀딩 프로젝트 승인 요청',
    message: '김아티스트님이 새로운 프로젝트를 제출했습니다.',
    timestamp: '2024-01-20T10:00:00Z',
    actionRequired: true,
    read: false,
    relatedUser: {
      id: 1,
      name: '김아티스트',
      avatar: 'avatar1.jpg',
    },
  },
];

const mockSystemMetrics: SystemMetrics = {
  serverLoad: 45.2,
  cpuUsage: 30.5,
  memoryUsage: 60.8,
  diskUsage: 75.3,
  networkLatency: 120,
  activeUsers: 150,
  ongoingTransactions: 25,
  errorRate: 0.1,
  uptime: '99.9%',
  lastUpdate: '2024-01-20T10:00:00Z',
};

describe('adminService 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('대시보드 메트릭을 성공적으로 가져온다', async () => {
      mockApiCall.mockResolvedValue(mockDashboardMetrics);

      const result = await adminService.getDashboardMetrics();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/dashboard/metrics');
      expect(result).toEqual(mockDashboardMetrics);
    });

    it('API 호출 실패 시 에러를 던진다', async () => {
      const errorMessage = '서버 오류가 발생했습니다';
      mockApiCall.mockRejectedValue(new Error(errorMessage));

      await expect(adminService.getDashboardMetrics()).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('getUsers', () => {
    it('파라미터 없이 사용자 목록을 가져온다', async () => {
      const mockResponse = { data: mockUsers, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getUsers();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users');
      expect(result).toEqual(mockResponse);
    });

    it('파라미터와 함께 사용자 목록을 가져온다', async () => {
      const params = {
        role: 'artist',
        status: 'active',
        search: '김아티스트',
        page: 1,
        limit: 10,
        sortBy: 'joinDate',
        order: 'desc' as const,
      };
      const mockResponse = { data: mockUsers, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getUsers(params);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/users?role=artist&status=active&search=%EA%B9%80%EC%95%84%ED%8B%B0%EC%8A%A4%ED%8A%B8&page=1&limit=10&sortBy=joinDate&order=desc',
      );
      expect(result).toEqual(mockResponse);
    });

    it('일부 파라미터만 전달하여 사용자 목록을 가져온다', async () => {
      const params = { role: 'artist', page: 1 };
      const mockResponse = { data: mockUsers, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getUsers(params);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/users?role=artist&page=1',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUserStatus', () => {
    it('사용자 상태를 성공적으로 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateUserStatus(
        '1',
        'suspended',
        '정책 위반',
      );

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/status', {
        method: 'PUT',
        body: JSON.stringify({ status: 'suspended', reason: '정책 위반' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('reason 없이 사용자 상태를 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateUserStatus('1', 'active');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/status', {
        method: 'PUT',
        body: JSON.stringify({ status: 'active', reason: undefined }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUserRole', () => {
    it('사용자 역할을 성공적으로 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateUserRole('1', 'artist');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/role', {
        method: 'PUT',
        body: JSON.stringify({ role: 'artist' }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('suspendUser', () => {
    it('사용자를 성공적으로 정지시킨다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.suspendUser('1', '정책 위반');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/suspend', {
        method: 'POST',
        body: JSON.stringify({ reason: '정책 위반' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('reason 없이 사용자를 정지시킨다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.suspendUser('1');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/suspend', {
        method: 'POST',
        body: JSON.stringify({ reason: undefined }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('restoreUser', () => {
    it('사용자를 성공적으로 복구시킨다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.restoreUser('1');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/users/1/restore', {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFundingProjects', () => {
    it('파라미터 없이 펀딩 프로젝트 목록을 가져온다', async () => {
      const mockResponse = {
        data: mockFundingProjects,
        total: 1,
        page: 1,
        limit: 10,
      };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getFundingProjects();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/funding/projects');
      expect(result).toEqual(mockResponse);
    });

    it('파라미터와 함께 펀딩 프로젝트 목록을 가져온다', async () => {
      const params = {
        status: 'active',
        approvalStatus: 'pending',
        page: 1,
        limit: 10,
      };
      const mockResponse = {
        data: mockFundingProjects,
        total: 1,
        page: 1,
        limit: 10,
      };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getFundingProjects(params);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/funding/projects?status=active&approval_status=pending&page=1&limit=10',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProjectApproval', () => {
    it('프로젝트 승인 상태를 성공적으로 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateProjectApproval(
        '1',
        'approved',
        '승인되었습니다',
      );

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/funding/projects/1/approval',
        {
          method: 'PATCH',
          body: JSON.stringify({
            approvalStatus: 'approved',
            feedback: '승인되었습니다',
          }),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('feedback 없이 프로젝트 승인 상태를 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateProjectApproval('1', 'rejected');

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/funding/projects/1/approval',
        {
          method: 'PATCH',
          body: JSON.stringify({
            approvalStatus: 'rejected',
            feedback: undefined,
          }),
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getArtworks', () => {
    it('파라미터 없이 작품 목록을 가져온다', async () => {
      const mockResponse = { data: mockArtworks, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getArtworks();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/artworks');
      expect(result).toEqual(mockResponse);
    });

    it('파라미터와 함께 작품 목록을 가져온다', async () => {
      const params = {
        status: 'pending',
        category: '회화',
        search: '풍경',
        page: 1,
        limit: 10,
      };
      const mockResponse = { data: mockArtworks, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getArtworks(params);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/artworks?status=pending&category=%ED%9A%8C%ED%99%94&search=%ED%92%8D%EA%B2%BD&page=1&limit=10',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateArtworkStatus', () => {
    it('작품 상태를 성공적으로 업데이트한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.updateArtworkStatus('1', 'approved');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/artworks/1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReports', () => {
    it('파라미터 없이 신고 목록을 가져온다', async () => {
      const mockResponse = { data: mockReports, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getReports();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/reports');
      expect(result).toEqual(mockResponse);
    });

    it('파라미터와 함께 신고 목록을 가져온다', async () => {
      const params = {
        status: 'pending',
        type: 'user',
        page: 1,
        limit: 10,
      };
      const mockResponse = { data: mockReports, total: 1, page: 1, limit: 10 };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.getReports(params);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/reports?status=pending&type=user&page=1&limit=10',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resolveReport', () => {
    it('신고를 성공적으로 해결한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.resolveReport(
        '1',
        'resolved',
        '경고 조치',
        '해결 완료',
      );

      expect(mockApiCall).toHaveBeenCalledWith('/admin/reports/1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({
          resolution: 'resolved',
          actionTaken: '경고 조치',
          notes: '해결 완료',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('선택적 파라미터 없이 신고를 해결한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.resolveReport('1', 'dismissed');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/reports/1/resolve', {
        method: 'PATCH',
        body: JSON.stringify({
          resolution: 'dismissed',
          actionTaken: undefined,
          notes: undefined,
        }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFinancialData', () => {
    it('재정 데이터를 성공적으로 가져온다', async () => {
      mockApiCall.mockResolvedValue(mockFinancialData);

      const result = await adminService.getFinancialData();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/financial-data');
      expect(result).toEqual(mockFinancialData);
    });
  });

  describe('getNotifications', () => {
    it('알림 목록을 성공적으로 가져온다', async () => {
      mockApiCall.mockResolvedValue(mockNotifications);

      const result = await adminService.getNotifications();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/notifications');
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markNotificationAsRead', () => {
    it('알림을 성공적으로 읽음 처리한다', async () => {
      const mockResponse = { success: true };
      mockApiCall.mockResolvedValue(mockResponse);

      const result = await adminService.markNotificationAsRead('1');

      expect(mockApiCall).toHaveBeenCalledWith('/admin/notifications/1/read', {
        method: 'PATCH',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSystemMetrics', () => {
    it('시스템 메트릭을 성공적으로 가져온다', async () => {
      mockApiCall.mockResolvedValue(mockSystemMetrics);

      const result = await adminService.getSystemMetrics();

      expect(mockApiCall).toHaveBeenCalledWith('/admin/system/metrics');
      expect(result).toEqual(mockSystemMetrics);
    });
  });

  describe('getUserGrowthData', () => {
    it('기본 파라미터로 사용자 성장 데이터를 가져온다', async () => {
      const mockGrowthData = [
        { month: '2024-01', users: 100 },
        { month: '2024-02', users: 150 },
      ];
      mockApiCall.mockResolvedValue(mockGrowthData);

      const result = await adminService.getUserGrowthData();

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/analytics/user-growth?period=monthly&months=8',
      );
      expect(result).toEqual(mockGrowthData);
    });

    it('커스텀 파라미터로 사용자 성장 데이터를 가져온다', async () => {
      const mockGrowthData = [
        { month: '2024-01', users: 100 },
        { month: '2024-02', users: 150 },
      ];
      mockApiCall.mockResolvedValue(mockGrowthData);

      const result = await adminService.getUserGrowthData('weekly', 4);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/analytics/user-growth?period=weekly&months=4',
      );
      expect(result).toEqual(mockGrowthData);
    });
  });

  describe('getFundingPerformanceData', () => {
    it('기본 파라미터로 펀딩 성과 데이터를 가져온다', async () => {
      const mockPerformanceData = [
        { month: '2024-01', successRate: 75, totalAmount: 1000000 },
        { month: '2024-02', successRate: 80, totalAmount: 1200000 },
      ];
      mockApiCall.mockResolvedValue(mockPerformanceData);

      const result = await adminService.getFundingPerformanceData();

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/analytics/funding-performance?period=monthly&months=8',
      );
      expect(result).toEqual(mockPerformanceData);
    });

    it('커스텀 파라미터로 펀딩 성과 데이터를 가져온다', async () => {
      const mockPerformanceData = [
        { month: '2024-01', successRate: 75, totalAmount: 1000000 },
        { month: '2024-02', successRate: 80, totalAmount: 1200000 },
      ];
      mockApiCall.mockResolvedValue(mockPerformanceData);

      const result = await adminService.getFundingPerformanceData('daily', 7);

      expect(mockApiCall).toHaveBeenCalledWith(
        '/admin/analytics/funding-performance?period=daily&months=7',
      );
      expect(result).toEqual(mockPerformanceData);
    });
  });

  describe('에러 처리', () => {
    it('API 호출 실패 시 에러를 올바르게 전파한다', async () => {
      const errorMessage = '네트워크 오류가 발생했습니다';
      mockApiCall.mockRejectedValue(new Error(errorMessage));

      await expect(adminService.getDashboardMetrics()).rejects.toThrow(
        errorMessage,
      );
      await expect(adminService.getUsers()).rejects.toThrow(errorMessage);
      await expect(
        adminService.updateUserStatus('1', 'active'),
      ).rejects.toThrow(errorMessage);
    });
  });
});
