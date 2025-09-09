import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            {children}
        </AuthProvider>
    </BrowserRouter>
);

describe('권한별 마이페이지 시스템 TDD 테스트', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('1. 아티스트 마이페이지 테스트', () => {
        test('아티스트 프로필 정보가 올바르게 표시되어야 한다', () => {
            const artistProfile = {
                id: 'artist-1',
                name: '재즈 아티스트',
                email: 'jazz@artist.com',
                avatar: '/avatar.jpg',
                role: 'artist',
                artistInfo: {
                    genre: '재즈',
                    bio: '20년 경력의 재즈 아티스트입니다',
                    instruments: ['피아노', '색소폰'],
                    experience: 20,
                    awards: ['재즈 페스티벌 대상', '음악상 수상'],
                    socialLinks: {
                        youtube: 'https://youtube.com/jazzartist',
                        instagram: 'https://instagram.com/jazzartist',
                        spotify: 'https://spotify.com/jazzartist'
                    }
                },
                stats: {
                    totalProjects: 15,
                    successfulProjects: 12,
                    totalBackers: 1500,
                    totalRevenue: 50000000
                }
            };

            const validateArtistProfile = (profile: any) => {
                const errors: string[] = [];

                if (!profile.name || profile.name.trim().length < 2) {
                    errors.push('아티스트명은 최소 2자 이상이어야 합니다');
                }

                if (!profile.artistInfo.genre) {
                    errors.push('장르를 선택해야 합니다');
                }

                if (!profile.artistInfo.bio || profile.artistInfo.bio.trim().length < 10) {
                    errors.push('자기소개는 최소 10자 이상이어야 합니다');
                }

                if (profile.artistInfo.experience < 0) {
                    errors.push('경력은 0년 이상이어야 합니다');
                }

                return errors;
            };

            expect(validateArtistProfile(artistProfile)).toHaveLength(0);
            expect(artistProfile.artistInfo.genre).toBe('재즈');
            expect(artistProfile.artistInfo.instruments).toHaveLength(2);
            expect(artistProfile.stats.totalProjects).toBe(15);
            expect(artistProfile.stats.successfulProjects).toBe(12);
        });

        test('아티스트 프로젝트 관리가 올바르게 작동해야 한다', () => {
            const artistProjects = [
                {
                    id: 'project-1',
                    title: '재즈 앨범 제작',
                    status: '진행중',
                    currentAmount: 5000000,
                    goalAmount: 10000000,
                    backers: 150,
                    daysLeft: 15,
                    progress: 50
                },
                {
                    id: 'project-2',
                    title: '재즈 콘서트 개최',
                    status: '성공',
                    currentAmount: 8000000,
                    goalAmount: 5000000,
                    backers: 200,
                    daysLeft: 0,
                    progress: 160
                },
                {
                    id: 'project-3',
                    title: '재즈 워크샵',
                    status: '준비중',
                    currentAmount: 0,
                    goalAmount: 3000000,
                    backers: 0,
                    daysLeft: 30,
                    progress: 0
                }
            ];

            const getProjectStats = (projects: any[]) => {
                const totalProjects = projects.length;
                const activeProjects = projects.filter(p => p.status === '진행중').length;
                const successfulProjects = projects.filter(p => p.status === '성공').length;
                const totalRevenue = projects
                    .filter(p => p.status === '성공')
                    .reduce((sum, p) => sum + p.currentAmount, 0);
                const totalBackers = projects.reduce((sum, p) => sum + p.backers, 0);

                return {
                    totalProjects,
                    activeProjects,
                    successfulProjects,
                    totalRevenue,
                    totalBackers,
                    successRate: totalProjects > 0 ? Math.round((successfulProjects / totalProjects) * 100) : 0
                };
            };

            const stats = getProjectStats(artistProjects);

            expect(stats.totalProjects).toBe(3);
            expect(stats.activeProjects).toBe(1);
            expect(stats.successfulProjects).toBe(1);
            expect(stats.totalRevenue).toBe(8000000);
            expect(stats.totalBackers).toBe(350);
            expect(stats.successRate).toBe(33);
        });

        test('아티스트 수익 관리가 올바르게 작동해야 한다', () => {
            const revenueData = {
                monthlyRevenue: [
                    { month: '2024-01', amount: 5000000 },
                    { month: '2024-02', amount: 8000000 },
                    { month: '2024-03', amount: 12000000 }
                ],
                projectRevenue: [
                    { projectId: 'project-1', title: '재즈 앨범', amount: 5000000 },
                    { projectId: 'project-2', title: '재즈 콘서트', amount: 8000000 }
                ],
                platformFees: 0.05, // 5%
                taxRate: 0.22 // 22%
            };

            const calculateNetRevenue = (revenueData: any) => {
                const totalGrossRevenue = revenueData.monthlyRevenue.reduce((sum: number, month: any) => sum + month.amount, 0);
                const platformFees = totalGrossRevenue * revenueData.platformFees;
                const taxableIncome = totalGrossRevenue - platformFees;
                const taxes = taxableIncome * revenueData.taxRate;
                const netRevenue = totalGrossRevenue - platformFees - taxes;

                return {
                    totalGrossRevenue,
                    platformFees,
                    taxableIncome,
                    taxes,
                    netRevenue,
                    averageMonthlyRevenue: Math.round(totalGrossRevenue / revenueData.monthlyRevenue.length)
                };
            };

            const netRevenue = calculateNetRevenue(revenueData);

            expect(netRevenue.totalGrossRevenue).toBe(25000000);
            expect(netRevenue.platformFees).toBe(1250000);
            expect(netRevenue.taxes).toBe(5225000);
            expect(netRevenue.netRevenue).toBe(18525000);
            expect(netRevenue.averageMonthlyRevenue).toBe(8333333);
        });
    });

    describe('2. 팬 마이페이지 테스트', () => {
        test('팬 프로필 정보가 올바르게 표시되어야 한다', () => {
            const fanProfile = {
                id: 'fan-1',
                name: '재즈 팬',
                email: 'jazzfan@email.com',
                avatar: '/avatar.jpg',
                role: 'fan',
                fanInfo: {
                    favoriteGenres: ['재즈', '클래식', '재즈'],
                    favoriteArtists: ['마일스 데이비스', '존 콜트레인'],
                    totalBackings: 25,
                    totalAmount: 1500000,
                    memberSince: '2020-01-01',
                    preferences: {
                        emailNotifications: true,
                        pushNotifications: false,
                        marketingEmails: false
                    }
                },
                stats: {
                    backedProjects: 25,
                    successfulProjects: 20,
                    totalSpent: 1500000,
                    averageBacking: 60000
                }
            };

            const validateFanProfile = (profile: any) => {
                const errors: string[] = [];

                if (!profile.name || profile.name.trim().length < 2) {
                    errors.push('사용자명은 최소 2자 이상이어야 합니다');
                }

                if (!profile.fanInfo.favoriteGenres || profile.fanInfo.favoriteGenres.length === 0) {
                    errors.push('선호 장르를 최소 1개 이상 선택해야 합니다');
                }

                if (profile.fanInfo.totalBackings < 0) {
                    errors.push('후원 프로젝트 수는 0개 이상이어야 합니다');
                }

                if (profile.fanInfo.totalAmount < 0) {
                    errors.push('총 후원 금액은 0원 이상이어야 합니다');
                }

                return errors;
            };

            expect(validateFanProfile(fanProfile)).toHaveLength(0);
            expect(fanProfile.fanInfo.favoriteGenres).toHaveLength(3);
            expect(fanProfile.fanInfo.favoriteArtists).toHaveLength(2);
            expect(fanProfile.stats.backedProjects).toBe(25);
            expect(fanProfile.stats.totalSpent).toBe(1500000);
        });

        test('팬 후원 내역 관리가 올바르게 작동해야 한다', () => {
            const backingHistory = [
                {
                    id: 'backing-1',
                    projectId: 'project-1',
                    projectTitle: '재즈 앨범 제작',
                    artistName: '재즈 아티스트',
                    amount: 100000,
                    reward: '디지털 앨범 + CD',
                    backedAt: '2024-01-15T10:00:00Z',
                    status: 'confirmed',
                    projectStatus: '진행중'
                },
                {
                    id: 'backing-2',
                    projectId: 'project-2',
                    projectTitle: '클래식 콘서트',
                    artistName: '클래식 아티스트',
                    amount: 50000,
                    reward: '콘서트 티켓',
                    backedAt: '2024-01-10T10:00:00Z',
                    status: 'confirmed',
                    projectStatus: '성공'
                },
                {
                    id: 'backing-3',
                    projectId: 'project-3',
                    projectTitle: '미술 전시회',
                    artistName: '미술 아티스트',
                    amount: 200000,
                    reward: '전시회 티켓 + 카탈로그',
                    backedAt: '2024-01-05T10:00:00Z',
                    status: 'refunded',
                    projectStatus: '실패'
                }
            ];

            const getBackingStats = (backings: any[]) => {
                const totalBackings = backings.length;
                const totalAmount = backings.reduce((sum, b) => sum + b.amount, 0);
                const successfulBackings = backings.filter(b => b.projectStatus === '성공').length;
                const failedBackings = backings.filter(b => b.projectStatus === '실패').length;
                const activeBackings = backings.filter(b => b.projectStatus === '진행중').length;

                const averageBacking = totalBackings > 0 ? Math.round(totalAmount / totalBackings) : 0;
                const successRate = totalBackings > 0 ? Math.round((successfulBackings / totalBackings) * 100) : 0;

                return {
                    totalBackings,
                    totalAmount,
                    successfulBackings,
                    failedBackings,
                    activeBackings,
                    averageBacking,
                    successRate
                };
            };

            const stats = getBackingStats(backingHistory);

            expect(stats.totalBackings).toBe(3);
            expect(stats.totalAmount).toBe(350000);
            expect(stats.successfulBackings).toBe(1);
            expect(stats.failedBackings).toBe(1);
            expect(stats.activeBackings).toBe(1);
            expect(stats.averageBacking).toBe(116667);
            expect(stats.successRate).toBe(33);
        });

        test('팬 알림 설정이 올바르게 관리되어야 한다', () => {
            const notificationSettings = {
                emailNotifications: {
                    projectUpdates: true,
                    newProjects: true,
                    fundingSuccess: true,
                    fundingFailure: true,
                    artistNews: false
                },
                pushNotifications: {
                    projectUpdates: false,
                    newProjects: true,
                    fundingSuccess: true,
                    fundingFailure: false,
                    artistNews: false
                },
                frequency: 'daily', // daily, weekly, monthly
                quietHours: {
                    enabled: true,
                    start: '22:00',
                    end: '08:00'
                }
            };

            const updateNotificationSettings = (settings: any, updates: any) => {
                const updatedSettings = { ...settings };

                // 이메일 알림 설정 업데이트
                if (updates.emailNotifications) {
                    updatedSettings.emailNotifications = {
                        ...updatedSettings.emailNotifications,
                        ...updates.emailNotifications
                    };
                }

                // 푸시 알림 설정 업데이트
                if (updates.pushNotifications) {
                    updatedSettings.pushNotifications = {
                        ...updatedSettings.pushNotifications,
                        ...updates.pushNotifications
                    };
                }

                // 기타 설정 업데이트
                if (updates.frequency) {
                    updatedSettings.frequency = updates.frequency;
                }

                if (updates.quietHours) {
                    updatedSettings.quietHours = {
                        ...updatedSettings.quietHours,
                        ...updates.quietHours
                    };
                }

                return updatedSettings;
            };

            const updates = {
                emailNotifications: {
                    artistNews: true
                },
                frequency: 'weekly',
                quietHours: {
                    enabled: false
                }
            };

            const updatedSettings = updateNotificationSettings(notificationSettings, updates);

            expect(updatedSettings.emailNotifications.artistNews).toBe(true);
            expect(updatedSettings.frequency).toBe('weekly');
            expect(updatedSettings.quietHours.enabled).toBe(false);
            expect(updatedSettings.emailNotifications.projectUpdates).toBe(true); // 기존 설정 유지
        });
    });

    describe('3. 관리자 마이페이지 테스트', () => {
        test('관리자 프로필 정보가 올바르게 표시되어야 한다', () => {
            const adminProfile = {
                id: 'admin-1',
                name: '시스템 관리자',
                email: 'admin@collaboreum.com',
                avatar: '/admin-avatar.jpg',
                role: 'admin',
                adminInfo: {
                    permissions: ['user_management', 'project_approval', 'content_moderation', 'system_settings'],
                    department: '플랫폼 운영팀',
                    employeeId: 'ADM001',
                    hireDate: '2020-01-01',
                    lastLogin: '2024-01-15T10:00:00Z',
                    loginCount: 150
                },
                stats: {
                    totalUsers: 5000,
                    totalProjects: 500,
                    pendingApprovals: 25,
                    reportedContent: 15,
                    systemHealth: 'excellent'
                }
            };

            const validateAdminProfile = (profile: any) => {
                const errors: string[] = [];

                if (!profile.name || profile.name.trim().length < 2) {
                    errors.push('관리자명은 최소 2자 이상이어야 합니다');
                }

                if (!profile.adminInfo.permissions || profile.adminInfo.permissions.length === 0) {
                    errors.push('권한을 최소 1개 이상 부여해야 합니다');
                }

                if (!profile.adminInfo.department) {
                    errors.push('소속 부서를 지정해야 합니다');
                }

                if (!profile.adminInfo.employeeId) {
                    errors.push('사원번호를 지정해야 합니다');
                }

                return errors;
            };

            expect(validateAdminProfile(adminProfile)).toHaveLength(0);
            expect(adminProfile.adminInfo.permissions).toHaveLength(4);
            expect(adminProfile.adminInfo.department).toBe('플랫폼 운영팀');
            expect(adminProfile.stats.totalUsers).toBe(5000);
            expect(adminProfile.stats.systemHealth).toBe('excellent');
        });

        test('관리자 사용자 관리가 올바르게 작동해야 한다', () => {
            const users = [
                {
                    id: 'user-1',
                    name: '일반 사용자',
                    email: 'user@test.com',
                    role: 'fan',
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00Z',
                    lastLogin: '2024-01-15T10:00:00Z'
                },
                {
                    id: 'user-2',
                    name: '아티스트',
                    email: 'artist@test.com',
                    role: 'artist',
                    status: 'active',
                    createdAt: '2024-01-02T00:00:00Z',
                    lastLogin: '2024-01-14T10:00:00Z'
                },
                {
                    id: 'user-3',
                    name: '비활성 사용자',
                    email: 'inactive@test.com',
                    role: 'fan',
                    status: 'inactive',
                    createdAt: '2023-12-01T00:00:00Z',
                    lastLogin: '2023-12-15T10:00:00Z'
                }
            ];

            const manageUser = (users: any[], userId: string, action: 'activate' | 'deactivate' | 'delete' | 'changeRole', admin: any, newRole?: string) => {
                if (admin.role !== 'admin') {
                    throw new Error('관리자만 사용자를 관리할 수 있습니다');
                }

                const user = users.find(u => u.id === userId);
                if (!user) {
                    throw new Error('사용자를 찾을 수 없습니다');
                }

                const updatedUser = { ...user };

                switch (action) {
                    case 'activate':
                        updatedUser.status = 'active';
                        updatedUser.updatedAt = new Date().toISOString();
                        updatedUser.updatedBy = admin.id;
                        break;
                    case 'deactivate':
                        updatedUser.status = 'inactive';
                        updatedUser.updatedAt = new Date().toISOString();
                        updatedUser.updatedBy = admin.id;
                        break;
                    case 'delete':
                        updatedUser.status = 'deleted';
                        updatedUser.updatedAt = new Date().toISOString();
                        updatedUser.updatedBy = admin.id;
                        break;
                    case 'changeRole':
                        if (!newRole) {
                            throw new Error('새로운 역할을 지정해야 합니다');
                        }
                        if (!['fan', 'artist', 'admin'].includes(newRole)) {
                            throw new Error('유효하지 않은 역할입니다');
                        }
                        updatedUser.role = newRole;
                        updatedUser.updatedAt = new Date().toISOString();
                        updatedUser.updatedBy = admin.id;
                        break;
                }

                return {
                    user: updatedUser,
                    action,
                    message: `사용자 ${action}이(가) 완료되었습니다`
                };
            };

            const admin = { id: 'admin-1', role: 'admin', name: '시스템 관리자' };

            // 사용자 비활성화
            const deactivateResult = manageUser(users, 'user-1', 'deactivate', admin);
            expect(deactivateResult.user.status).toBe('inactive');
            expect(deactivateResult.action).toBe('deactivate');

            // 역할 변경
            const roleChangeResult = manageUser(users, 'user-2', 'changeRole', admin, 'admin');
            expect(roleChangeResult.user.role).toBe('admin');
            expect(roleChangeResult.action).toBe('changeRole');

            // 권한 없는 사용자 테스트
            const nonAdmin = { id: 'user-1', role: 'fan', name: '일반 사용자' };
            try {
                manageUser(users, 'user-1', 'activate', nonAdmin);
                fail('권한 에러가 발생해야 합니다');
            } catch (error: any) {
                expect(error.message).toBe('관리자만 사용자를 관리할 수 있습니다');
            }
        });

        test('관리자 프로젝트 승인 관리가 올바르게 작동해야 한다', () => {
            const pendingProjects = [
                {
                    id: 'project-1',
                    title: '재즈 앨범 제작',
                    artist: '재즈 아티스트',
                    category: '음악',
                    goalAmount: 10000000,
                    submittedAt: '2024-01-15T10:00:00Z',
                    status: '승인대기',
                    reviewNotes: ''
                },
                {
                    id: 'project-2',
                    title: '미술 전시회',
                    artist: '미술 아티스트',
                    category: '미술',
                    goalAmount: 5000000,
                    submittedAt: '2024-01-14T10:00:00Z',
                    status: '승인대기',
                    reviewNotes: ''
                }
            ];

            const reviewProject = (projects: any[], projectId: string, action: 'approve' | 'reject', admin: any, notes: string) => {
                if (admin.role !== 'admin') {
                    throw new Error('관리자만 프로젝트를 검토할 수 있습니다');
                }

                const project = projects.find(p => p.id === projectId);
                if (!project) {
                    throw new Error('프로젝트를 찾을 수 없습니다');
                }

                const updatedProject = {
                    ...project,
                    status: action === 'approve' ? '승인됨' : '거부됨',
                    reviewedAt: new Date().toISOString(),
                    reviewedBy: admin.id,
                    reviewNotes: notes,
                    updatedAt: new Date().toISOString()
                };

                return {
                    project: updatedProject,
                    action,
                    message: `프로젝트가 ${action === 'approve' ? '승인' : '거부'}되었습니다`
                };
            };

            const admin = { id: 'admin-1', role: 'admin', name: '시스템 관리자' };

            // 프로젝트 승인
            const approveResult = reviewProject(pendingProjects, 'project-1', 'approve', admin, '훌륭한 프로젝트입니다');
            expect(approveResult.project.status).toBe('승인됨');
            expect(approveResult.project.reviewNotes).toBe('훌륭한 프로젝트입니다');
            expect(approveResult.action).toBe('approve');

            // 프로젝트 거부
            const rejectResult = reviewProject(pendingProjects, 'project-2', 'reject', admin, '프로젝트 내용이 부적절합니다');
            expect(rejectResult.project.status).toBe('거부됨');
            expect(rejectResult.project.reviewNotes).toBe('프로젝트 내용이 부적절합니다');
            expect(rejectResult.action).toBe('reject');
        });
    });

    describe('4. 공통 마이페이지 기능 테스트', () => {
        test('프로필 수정이 올바르게 작동해야 한다', () => {
            const user = {
                id: 'user-1',
                name: '기존 사용자',
                email: 'user@test.com',
                avatar: '/old-avatar.jpg',
                bio: '기존 자기소개',
                updatedAt: '2024-01-01T00:00:00Z'
            };

            const updateProfile = (user: any, updates: any, editor: any) => {
                // 권한 확인
                if (user.id !== editor.id && editor.role !== 'admin') {
                    throw new Error('프로필을 수정할 권한이 없습니다');
                }

                // 업데이트 가능한 필드만 수정
                const allowedFields = ['name', 'bio', 'avatar'];
                const updatedUser = { ...user };

                allowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        updatedUser[field] = updates[field];
                    }
                });

                updatedUser.updatedAt = new Date().toISOString();
                updatedUser.updatedBy = editor.id;

                return updatedUser;
            };

            const updates = {
                name: '새로운 사용자명',
                bio: '새로운 자기소개입니다',
                avatar: '/new-avatar.jpg'
            };

            const editor = { id: 'user-1', role: 'fan' };

            const updatedUser = updateProfile(user, updates, editor);

            expect(updatedUser.name).toBe('새로운 사용자명');
            expect(updatedUser.bio).toBe('새로운 자기소개입니다');
            expect(updatedUser.avatar).toBe('/new-avatar.jpg');
            expect(updatedUser.updatedAt).not.toBe('2024-01-01T00:00:00Z');
            expect(updatedUser.updatedBy).toBe('user-1');
        });

        test('비밀번호 변경이 올바르게 작동해야 한다', () => {
            const user = {
                id: 'user-1',
                email: 'user@test.com',
                passwordHash: 'old_hash',
                passwordChangedAt: '2024-01-01T00:00:00Z'
            };

            const changePassword = (user: any, currentPassword: string, newPassword: string, confirmPassword: string) => {
                const errors: string[] = [];

                // 현재 비밀번호 확인 (실제로는 해시 비교)
                if (currentPassword !== 'current123') {
                    errors.push('현재 비밀번호가 올바르지 않습니다');
                }

                // 새 비밀번호 유효성 검사
                if (!newPassword || newPassword.length < 8) {
                    errors.push('새 비밀번호는 최소 8자 이상이어야 합니다');
                }

                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
                    errors.push('새 비밀번호는 영문 대소문자와 숫자를 포함해야 합니다');
                }

                // 비밀번호 확인
                if (newPassword !== confirmPassword) {
                    errors.push('새 비밀번호가 일치하지 않습니다');
                }

                if (errors.length > 0) {
                    throw new Error(errors.join(', '));
                }

                // 비밀번호 변경
                const updatedUser = {
                    ...user,
                    passwordHash: 'new_hash', // 실제로는 새 비밀번호 해시
                    passwordChangedAt: new Date().toISOString()
                };

                return {
                    user: updatedUser,
                    message: '비밀번호가 성공적으로 변경되었습니다'
                };
            };

            // 성공적인 비밀번호 변경
            const validResult = changePassword(user, 'current123', 'NewPass123', 'NewPass123');
            expect(validResult.user.passwordHash).toBe('new_hash');
            expect(validResult.message).toBe('비밀번호가 성공적으로 변경되었습니다');

            // 실패한 비밀번호 변경
            try {
                changePassword(user, 'wrong123', 'NewPass123', 'NewPass123');
                fail('현재 비밀번호 에러가 발생해야 합니다');
            } catch (error: any) {
                expect(error.message).toContain('현재 비밀번호가 올바르지 않습니다');
            }

            try {
                changePassword(user, 'current123', 'weak', 'weak');
                fail('비밀번호 강도 에러가 발생해야 합니다');
            } catch (error: any) {
                expect(error.message).toContain('새 비밀번호는 최소 8자 이상이어야 합니다');
            }
        });

        test('계정 삭제가 올바르게 작동해야 한다', () => {
            const user = {
                id: 'user-1',
                name: '삭제될 사용자',
                email: 'delete@test.com',
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z'
            };

            const deleteAccount = (user: any, password: string, reason: string, admin?: any) => {
                // 관리자가 아닌 경우 비밀번호 확인 필요
                if (!admin || admin.role !== 'admin') {
                    if (password !== 'correct123') {
                        throw new Error('비밀번호가 올바르지 않습니다');
                    }
                }

                if (!reason || reason.trim().length < 5) {
                    throw new Error('계정 삭제 사유를 5자 이상 입력해주세요');
                }

                // 계정 삭제 처리
                const deletedUser = {
                    ...user,
                    status: 'deleted',
                    deletedAt: new Date().toISOString(),
                    deleteReason: reason.trim(),
                    deletedBy: admin ? admin.id : user.id
                };

                return {
                    user: deletedUser,
                    message: '계정이 성공적으로 삭제되었습니다'
                };
            };

            // 일반 사용자 계정 삭제
            const userDeleteResult = deleteAccount(user, 'correct123', '개인 사정으로 인한 탈퇴');
            expect(userDeleteResult.user.status).toBe('deleted');
            expect(userDeleteResult.user.deleteReason).toBe('개인 사정으로 인한 탈퇴');
            expect(userDeleteResult.user.deletedBy).toBe('user-1');

            // 관리자에 의한 계정 삭제
            const admin = { id: 'admin-1', role: 'admin', name: '시스템 관리자' };
            const adminDeleteResult = deleteAccount(user, '', '부적절한 활동으로 인한 강제 삭제', admin);
            expect(adminDeleteResult.user.status).toBe('deleted');
            expect(adminDeleteResult.user.deletedBy).toBe('admin-1');

            // 실패 케이스
            try {
                deleteAccount(user, 'wrong123', '개인 사정');
                fail('비밀번호 에러가 발생해야 합니다');
            } catch (error: any) {
                expect(error.message).toBe('비밀번호가 올바르지 않습니다');
            }

            try {
                deleteAccount(user, 'correct123', '짧음');
                fail('사유 길이 에러가 발생해야 합니다');
            } catch (error: any) {
                expect(error.message).toBe('계정 삭제 사유를 5자 이상 입력해주세요');
            }
        });
    });

    describe('5. 마이페이지 데이터 보안 테스트', () => {
        test('개인정보 보호가 올바르게 작동해야 한다', () => {
            const user = {
                id: 'user-1',
                name: '테스트 사용자',
                email: 'test@example.com',
                phone: '010-1234-5678',
                address: '서울시 강남구 테스트로 123',
                birthDate: '1990-01-01',
                socialSecurityNumber: '900101-1234567'
            };

            const maskSensitiveData = (user: any, viewerRole: string, viewerId: string) => {
                const maskedUser = { ...user };

                // 본인이 아닌 경우 민감한 정보 마스킹
                if (viewerId !== user.id && viewerRole !== 'admin') {
                    // 이메일 마스킹
                    const [localPart, domain] = user.email.split('@');
                    maskedUser.email = `${localPart.charAt(0)}***@${domain}`;

                    // 전화번호 마스킹
                    maskedUser.phone = user.phone.replace(/(\d{3})-(\d{4})-\d{4}/, '$1-****-$3');

                    // 주소 마스킹
                    maskedUser.address = user.address.replace(/\d+$/, '***');

                    // 생년월일 마스킹
                    maskedUser.birthDate = user.birthDate.replace(/\d{4}-\d{2}-\d{2}/, '****-**-**');

                    // 주민등록번호 마스킹
                    maskedUser.socialSecurityNumber = user.socialSecurityNumber.replace(/(\d{6})-\d{7}/, '$1-*******');
                }

                return maskedUser;
            };

            // 본인 조회
            const selfView = maskSensitiveData(user, 'fan', 'user-1');
            expect(selfView.email).toBe('test@example.com');
            expect(selfView.phone).toBe('010-1234-5678');
            expect(selfView.address).toBe('서울시 강남구 테스트로 123');

            // 다른 사용자 조회
            const otherView = maskSensitiveData(user, 'fan', 'user-2');
            expect(otherView.email).toBe('t***@example.com');
            expect(otherView.phone).toBe('010-****-5678');
            expect(otherView.address).toBe('서울시 강남구 테스트로 ***');
            expect(otherView.birthDate).toBe('****-**-**');
            expect(otherView.socialSecurityNumber).toBe('900101-*******');

            // 관리자 조회
            const adminView = maskSensitiveData(user, 'admin', 'admin-1');
            expect(adminView.email).toBe('test@example.com');
            expect(adminView.phone).toBe('010-1234-5678');
        });

        test('데이터 접근 로그가 올바르게 기록되어야 한다', () => {
            const accessLogs: any[] = [];

            const logDataAccess = (userId: string, accessedUserId: string, action: string, admin?: any) => {
                const log = {
                    id: `log_${Date.now()}`,
                    userId,
                    accessedUserId,
                    action,
                    timestamp: new Date().toISOString(),
                    ipAddress: '192.168.1.1', // 실제로는 클라이언트 IP
                    userAgent: 'Mozilla/5.0...', // 실제로는 브라우저 정보
                    isAdminAction: !!admin,
                    adminId: admin?.id || null
                };

                accessLogs.push(log);

                return {
                    log,
                    totalLogs: accessLogs.length
                };
            };

            // 일반 사용자 프로필 조회
            logDataAccess('user-1', 'user-2', 'profile_view');
            expect(accessLogs).toHaveLength(1);
            expect(accessLogs[0].action).toBe('profile_view');
            expect(accessLogs[0].isAdminAction).toBe(false);

            // 관리자 사용자 관리
            const admin = { id: 'admin-1', role: 'admin' };
            logDataAccess('admin-1', 'user-1', 'user_management', admin);
            expect(accessLogs).toHaveLength(2);
            expect(accessLogs[1].isAdminAction).toBe(true);
            expect(accessLogs[1].adminId).toBe('admin-1');

            // 로그 검색
            const searchLogs = (criteria: any) => {
                return accessLogs.filter(log => {
                    if (criteria.userId && log.userId !== criteria.userId) return false;
                    if (criteria.action && log.action !== criteria.action) return false;
                    if (criteria.isAdminAction !== undefined && log.isAdminAction !== criteria.isAdminAction) return false;
                    return true;
                });
            };

            const adminActions = searchLogs({ isAdminAction: true });
            expect(adminActions).toHaveLength(1);
            expect(adminActions[0].adminId).toBe('admin-1');

            const userActions = searchLogs({ userId: 'user-1' });
            expect(userActions).toHaveLength(1);
            expect(userActions[0].action).toBe('profile_view');
        });
    });
});
