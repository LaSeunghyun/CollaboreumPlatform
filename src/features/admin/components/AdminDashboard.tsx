import { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/Tabs';
import { AdminLayout } from './AdminLayout';
import { PermissionGuard } from './PermissionGuard';
import { NotificationCenter } from './NotificationCenter';
import { RealTimeAlerts } from './RealTimeAlerts';
import { LiveSystemMonitor } from './LiveSystemMonitor';

// 지연 로딩을 위한 컴포넌트들
const OverviewSection = lazy(() => import('./sections/OverviewSection').then(m => ({ default: m.OverviewSection })));
const UserManagementSection = lazy(() => import('./sections/UserManagementSection').then(m => ({ default: m.UserManagementSection })));
const FundingManagementSection = lazy(() => import('./sections/FundingManagementSection').then(m => ({ default: m.FundingManagementSection })));
const CommunityManagementSection = lazy(() => import('./sections/CommunityManagementSection').then(m => ({ default: m.CommunityManagementSection })));
const ArtworkManagementSection = lazy(() => import('./sections/ArtworkManagementSection').then(m => ({ default: m.ArtworkManagementSection })));
const FinanceManagementSection = lazy(() => import('./sections/FinanceManagementSection').then(m => ({ default: m.FinanceManagementSection })));
const AnalyticsSection = lazy(() => import('./sections/AnalyticsSection').then(m => ({ default: m.AnalyticsSection })));

// 로딩 스켈레톤 컴포넌트
const SectionSkeleton = () => (
    <div className="space-y-6">
        <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
    </div>
);

interface AdminDashboardProps {
    onBack?: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [selectedTab, setSelectedTab] = useState("overview");

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            // 더 안정적인 뒤로가기 방법
            try {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('뒤로가기 실패:', error);
                window.location.href = '/';
            }
        }
    };

    return (
        <>
            <AdminLayout
                title="관리자 대시보드"
                subtitle="플랫폼 운영 현황을 관리하고 모니터링하세요"
                onBack={handleBack}
            >
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="overview">개요</TabsTrigger>
                        <TabsTrigger value="users">회원관리</TabsTrigger>
                        <TabsTrigger value="funding">펀딩관리</TabsTrigger>
                        <TabsTrigger value="community">커뮤니티</TabsTrigger>
                        <TabsTrigger value="artworks">작품관리</TabsTrigger>
                        <TabsTrigger value="finance">재정관리</TabsTrigger>
                        <TabsTrigger value="reports">신고관리</TabsTrigger>
                        <TabsTrigger value="analytics">분석</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <Suspense fallback={<SectionSkeleton />}>
                            <OverviewSection />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <PermissionGuard permission="userManagement">
                            <Suspense fallback={<SectionSkeleton />}>
                                <UserManagementSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="funding" className="space-y-6">
                        <PermissionGuard permission="fundingOversight">
                            <Suspense fallback={<SectionSkeleton />}>
                                <FundingManagementSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="community" className="space-y-6">
                        <PermissionGuard permission="communityModeration">
                            <Suspense fallback={<SectionSkeleton />}>
                                <CommunityManagementSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="artworks" className="space-y-6">
                        <PermissionGuard permission="artistApproval">
                            <Suspense fallback={<SectionSkeleton />}>
                                <ArtworkManagementSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="finance" className="space-y-6">
                        <PermissionGuard permission="financeAccess">
                            <Suspense fallback={<SectionSkeleton />}>
                                <FinanceManagementSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                        <PermissionGuard permission="communityModeration">
                            <div className="text-center py-12">
                                <p className="text-gray-500">신고 관리 기능을 준비 중입니다...</p>
                            </div>
                        </PermissionGuard>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <PermissionGuard permission="systemAdmin">
                            <Suspense fallback={<SectionSkeleton />}>
                                <AnalyticsSection />
                            </Suspense>
                        </PermissionGuard>
                    </TabsContent>
                </Tabs>
            </AdminLayout>

            {/* 실시간 알림 시스템 */}
            <RealTimeAlerts />
        </>
    );
}