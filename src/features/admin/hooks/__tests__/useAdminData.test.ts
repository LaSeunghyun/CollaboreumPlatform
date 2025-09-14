import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
    useAdminMetrics,
    useUsers,
    useUpdateUserStatus,
    useUpdateUserRole,
    useSuspendUser,
    useRestoreUser,
    useFundingProjects,
    useUpdateProjectApproval,
    useArtworks,
    useUpdateArtworkStatus,
    useReports,
    useResolveReport,
    useFinancialData,
    useNotifications,
    useMarkNotificationAsRead,
    useSystemMetrics,
    useUserGrowthData,
    useFundingPerformanceData
} from '../useAdminData';
import { adminService } from '../../services/adminService';
import { AdminDashboardMetrics, User, FundingProject, Artwork, Report, FinancialData, AdminNotification, SystemMetrics } from '../../types';

// Mock adminService
jest.mock('../../services/adminService');
const mockAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock 데이터
const mockDashboardMetrics: AdminDashboardMetrics = {
    userMetrics: {
        totalUsers: 1000,
        newUsersThisWeek: 50,
        activeArtists: 200,
        userGrowthRate: 5.2
    },
    fundingMetrics: {
        activeProjects: 25,
        successfulProjectsThisMonth: 12,
        totalFundedAmount: 500000,
        successRate: 75.5
    },
    revenueMetrics: {
        monthlyRevenue: 25000,
        platformFees: 2500,
        pendingPayouts: 5000,
        growthRate: 12.3
    },
    communityMetrics: {
        pendingReports: 8,
        postsThisWeek: 150,
        activeDiscussions: 45,
        moderationQueue: 12
    }
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
        reportCount: 0
    },
    {
        id: 2,
        name: '이팬',
        email: 'fan@example.com',
        role: 'fan',
        joinDate: '2024-01-10',
        lastActivity: '2024-01-19',
        status: 'active',
        fundingCount: 3,
        totalInvestment: 50000,
        reportCount: 0
    }
];

const mockFundingProjects: FundingProject[] = [
    {
        id: 1,
        title: '첫 번째 프로젝트',
        artist: {
            id: 1,
            name: '김아티스트',
            avatar: 'avatar1.jpg'
        },
        category: '음악',
        goalAmount: 1000000,
        currentAmount: 750000,
        backerCount: 25,
        deadline: '2024-02-15',
        status: 'active',
        submissionDate: '2024-01-01',
        approvalStatus: 'approved'
    }
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
        likes: 25
    }
];

const mockReports: Report[] = [
    {
        id: 1,
        reporter: {
            id: 2,
            name: '이팬',
            avatar: 'avatar2.jpg'
        },
        reportedUser: {
            id: 3,
            name: '신고된사용자',
            avatar: 'avatar3.jpg'
        },
        contentType: 'user',
        contentId: 3,
        reason: 'spam',
        description: '스팸성 댓글을 계속 작성',
        status: 'pending',
        createdAt: '2024-01-20'
    }
];

const mockFinancialData: FinancialData[] = [
    {
        month: '2024-01',
        totalRevenue: 100000,
        platformFee: 10000,
        artistPayouts: 80000,
        investorReturns: 5000,
        pendingPayments: 5000
    }
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
            avatar: 'avatar1.jpg'
        }
    }
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
    lastUpdate: '2024-01-20T10:00:00Z'
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

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client= { queryClient } >
        { children }
        </QueryClientProvider>
    );
};

describe('useAdminData 훅 테스트', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useAdminMetrics', () => {
        it('대시보드 메트릭을 성공적으로 가져온다', async () => {
            mockAdminService.getDashboardMetrics.mockResolvedValue(mockDashboardMetrics);

            const { result } = renderHook(() => useAdminMetrics(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockDashboardMetrics);
            expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1);
        });

        it('로딩 상태를 올바르게 처리한다', () => {
            mockAdminService.getDashboardMetrics.mockImplementation(() => new Promise(() => { }));

            const { result } = renderHook(() => useAdminMetrics(), {
                wrapper: createWrapper()
            });

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });

        it('에러 상태를 올바르게 처리한다', async () => {
            const errorMessage = '서버 오류가 발생했습니다';
            mockAdminService.getDashboardMetrics.mockRejectedValue(new Error(errorMessage));

            const { result } = renderHook(() => useAdminMetrics(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeDefined();
        });
    });

    describe('useUsers', () => {
        it('사용자 목록을 성공적으로 가져온다', async () => {
            const mockResponse = { data: mockUsers, total: 2, page: 1, limit: 10 };
            mockAdminService.getUsers.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useUsers(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockResponse);
            expect(mockAdminService.getUsers).toHaveBeenCalledWith(undefined);
        });

        it('파라미터와 함께 사용자 목록을 가져온다', async () => {
            const params = { role: 'artist', status: 'active', page: 1, limit: 10 };
            const mockResponse = { data: mockUsers, total: 2, page: 1, limit: 10 };
            mockAdminService.getUsers.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useUsers(params), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.getUsers).toHaveBeenCalledWith(params);
        });
    });

    describe('useUpdateUserStatus', () => {
        it('사용자 상태를 성공적으로 업데이트한다', async () => {
            mockAdminService.updateUserStatus.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useUpdateUserStatus(), {
                wrapper: createWrapper()
            });

            const updateData = { userId: '1', status: 'suspended', reason: '정책 위반' };

            await waitFor(() => {
                result.current.mutate(updateData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.updateUserStatus).toHaveBeenCalledWith('1', 'suspended', '정책 위반');
        });

        it('사용자 상태 업데이트 실패를 처리한다', async () => {
            const errorMessage = '권한이 없습니다';
            mockAdminService.updateUserStatus.mockRejectedValue(new Error(errorMessage));

            const { result } = renderHook(() => useUpdateUserStatus(), {
                wrapper: createWrapper()
            });

            const updateData = { userId: '1', status: 'suspended', reason: '정책 위반' };

            await waitFor(() => {
                result.current.mutate(updateData);
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeDefined();
        });
    });

    describe('useUpdateUserRole', () => {
        it('사용자 역할을 성공적으로 업데이트한다', async () => {
            mockAdminService.updateUserRole.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useUpdateUserRole(), {
                wrapper: createWrapper()
            });

            const updateData = { userId: '1', role: 'artist' };

            await waitFor(() => {
                result.current.mutate(updateData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.updateUserRole).toHaveBeenCalledWith('1', 'artist');
        });
    });

    describe('useSuspendUser', () => {
        it('사용자를 성공적으로 정지시킨다', async () => {
            mockAdminService.suspendUser.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useSuspendUser(), {
                wrapper: createWrapper()
            });

            const suspendData = { userId: '1', reason: '정책 위반' };

            await waitFor(() => {
                result.current.mutate(suspendData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.suspendUser).toHaveBeenCalledWith('1', '정책 위반');
        });
    });

    describe('useRestoreUser', () => {
        it('사용자를 성공적으로 복구시킨다', async () => {
            mockAdminService.restoreUser.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useRestoreUser(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                result.current.mutate('1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.restoreUser).toHaveBeenCalledWith('1');
        });
    });

    describe('useFundingProjects', () => {
        it('펀딩 프로젝트 목록을 성공적으로 가져온다', async () => {
            const mockResponse = { data: mockFundingProjects, total: 1, page: 1, limit: 10 };
            mockAdminService.getFundingProjects.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useFundingProjects(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockResponse);
            expect(mockAdminService.getFundingProjects).toHaveBeenCalledWith(undefined);
        });

        it('파라미터와 함께 펀딩 프로젝트 목록을 가져온다', async () => {
            const params = { status: 'active', approvalStatus: 'pending' };
            const mockResponse = { data: mockFundingProjects, total: 1, page: 1, limit: 10 };
            mockAdminService.getFundingProjects.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useFundingProjects(params), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.getFundingProjects).toHaveBeenCalledWith(params);
        });
    });

    describe('useUpdateProjectApproval', () => {
        it('프로젝트 승인 상태를 성공적으로 업데이트한다', async () => {
            mockAdminService.updateProjectApproval.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useUpdateProjectApproval(), {
                wrapper: createWrapper()
            });

            const updateData = {
                projectId: '1',
                approvalStatus: 'approved',
                feedback: '승인되었습니다'
            };

            await waitFor(() => {
                result.current.mutate(updateData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.updateProjectApproval).toHaveBeenCalledWith('1', 'approved', '승인되었습니다');
        });
    });

    describe('useArtworks', () => {
        it('작품 목록을 성공적으로 가져온다', async () => {
            const mockResponse = { data: mockArtworks, total: 1, page: 1, limit: 10 };
            mockAdminService.getArtworks.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useArtworks(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockResponse);
            expect(mockAdminService.getArtworks).toHaveBeenCalledWith(undefined);
        });
    });

    describe('useUpdateArtworkStatus', () => {
        it('작품 상태를 성공적으로 업데이트한다', async () => {
            mockAdminService.updateArtworkStatus.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useUpdateArtworkStatus(), {
                wrapper: createWrapper()
            });

            const updateData = { artworkId: '1', status: 'approved' };

            await waitFor(() => {
                result.current.mutate(updateData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.updateArtworkStatus).toHaveBeenCalledWith('1', 'approved');
        });
    });

    describe('useReports', () => {
        it('신고 목록을 성공적으로 가져온다', async () => {
            const mockResponse = { data: mockReports, total: 1, page: 1, limit: 10 };
            mockAdminService.getReports.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useReports(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockResponse);
            expect(mockAdminService.getReports).toHaveBeenCalledWith(undefined);
        });
    });

    describe('useResolveReport', () => {
        it('신고를 성공적으로 해결한다', async () => {
            mockAdminService.resolveReport.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useResolveReport(), {
                wrapper: createWrapper()
            });

            const resolveData = {
                reportId: '1',
                resolution: 'resolved',
                actionTaken: '경고 조치',
                notes: '해결 완료'
            };

            await waitFor(() => {
                result.current.mutate(resolveData);
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.resolveReport).toHaveBeenCalledWith('1', 'resolved', '경고 조치', '해결 완료');
        });
    });

    describe('useFinancialData', () => {
        it('재정 데이터를 성공적으로 가져온다', async () => {
            mockAdminService.getFinancialData.mockResolvedValue(mockFinancialData);

            const { result } = renderHook(() => useFinancialData(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockFinancialData);
            expect(mockAdminService.getFinancialData).toHaveBeenCalledTimes(1);
        });
    });

    describe('useNotifications', () => {
        it('알림 목록을 성공적으로 가져온다', async () => {
            mockAdminService.getNotifications.mockResolvedValue(mockNotifications);

            const { result } = renderHook(() => useNotifications(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockNotifications);
            expect(mockAdminService.getNotifications).toHaveBeenCalledTimes(1);
        });
    });

    describe('useMarkNotificationAsRead', () => {
        it('알림을 성공적으로 읽음 처리한다', async () => {
            mockAdminService.markNotificationAsRead.mockResolvedValue({ success: true });

            const { result } = renderHook(() => useMarkNotificationAsRead(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                result.current.mutate('1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(mockAdminService.markNotificationAsRead).toHaveBeenCalledWith('1');
        });
    });

    describe('useSystemMetrics', () => {
        it('시스템 메트릭을 성공적으로 가져온다', async () => {
            mockAdminService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

            const { result } = renderHook(() => useSystemMetrics(), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockSystemMetrics);
            expect(mockAdminService.getSystemMetrics).toHaveBeenCalledTimes(1);
        });
    });

    describe('useUserGrowthData', () => {
        it('사용자 성장 데이터를 성공적으로 가져온다', async () => {
            const mockGrowthData = [
                { month: '2024-01', users: 100 },
                { month: '2024-02', users: 150 }
            ];
            mockAdminService.getUserGrowthData.mockResolvedValue(mockGrowthData);

            const { result } = renderHook(() => useUserGrowthData('monthly', 6), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockGrowthData);
            expect(mockAdminService.getUserGrowthData).toHaveBeenCalledWith('monthly', 6);
        });
    });

    describe('useFundingPerformanceData', () => {
        it('펀딩 성과 데이터를 성공적으로 가져온다', async () => {
            const mockPerformanceData = [
                { month: '2024-01', successRate: 75, totalAmount: 1000000 },
                { month: '2024-02', successRate: 80, totalAmount: 1200000 }
            ];
            mockAdminService.getFundingPerformanceData.mockResolvedValue(mockPerformanceData);

            const { result } = renderHook(() => useFundingPerformanceData('monthly', 6), {
                wrapper: createWrapper()
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockPerformanceData);
            expect(mockAdminService.getFundingPerformanceData).toHaveBeenCalledWith('monthly', 6);
        });
    });
});
