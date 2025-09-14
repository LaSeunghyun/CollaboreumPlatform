import { useAdminMetrics } from '../../hooks/useAdminData';
import { MetricsCard } from '../MetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import {
    Users,
    UserCheck,
    TrendingUp,
    DollarSign,
    MessageSquare,
    Activity,
    CreditCard,
    Calendar,
    AlertCircle,
    Palette
} from 'lucide-react';

export function OverviewSection() {
    const { data: metrics, isLoading, error } = useAdminMetrics();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-24"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">데이터가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
                <MetricsCard
                    title="총 회원 수"
                    value={metrics.userMetrics.totalUsers.toLocaleString()}
                    icon={Users}
                    variant="default"
                    trend={{ value: metrics.userMetrics.userGrowthRate, isPositive: true }}
                />
                <MetricsCard
                    title="활성 아티스트"
                    value={metrics.userMetrics.activeArtists.toLocaleString()}
                    icon={UserCheck}
                    variant="success"
                />
                <MetricsCard
                    title="진행중 펀딩"
                    value={metrics.fundingMetrics.activeProjects.toLocaleString()}
                    icon={TrendingUp}
                    variant="warning"
                />
                <MetricsCard
                    title="이번 달 매출"
                    value={`₩${(metrics.revenueMetrics.monthlyRevenue / 1000000).toFixed(1)}M`}
                    icon={DollarSign}
                    variant="success"
                    trend={{ value: metrics.revenueMetrics.growthRate, isPositive: true }}
                />
            </div>

            {/* Additional Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
                <MetricsCard
                    title="미처리 문의"
                    value={metrics.communityMetrics.pendingReports}
                    icon={MessageSquare}
                    variant="danger"
                />
                <MetricsCard
                    title="신규 가입 (주간)"
                    value={metrics.userMetrics.newUsersThisWeek.toLocaleString()}
                    icon={Activity}
                    variant="default"
                />
                <MetricsCard
                    title="월간 거래량"
                    value={`₩${(metrics.fundingMetrics.totalFundedAmount / 1000000).toFixed(1)}M`}
                    icon={CreditCard}
                    variant="success"
                />
                <MetricsCard
                    title="예정된 이벤트"
                    value="8"
                    icon={Calendar}
                    variant="warning"
                />
            </div>

            {/* Recent Activities */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>최근 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback>김</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">새로운 펀딩 프로젝트 등록</p>
                                    <p className="text-xs text-gray-600">김민수님이 프로젝트를 등록했습니다</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">승인 대기</Badge>
                            </div>
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback>이</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">아티스트 승인 완료</p>
                                    <p className="text-xs text-gray-600">이지영님이 아티스트로 승인되었습니다</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">완료</Badge>
                            </div>
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback>박</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">신고 접수</p>
                                    <p className="text-xs text-gray-600">부적절한 콘텐츠 신고가 접수되었습니다</p>
                                </div>
                                <Badge className="bg-red-100 text-red-800">처리 필요</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>시스템 상태</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">서버 상태</span>
                                <Badge className="bg-green-100 text-green-800">정상</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">데이터베이스</span>
                                <Badge className="bg-green-100 text-green-800">정상</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">API 응답 시간</span>
                                <span className="text-sm font-medium">120ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">활성 세션</span>
                                <span className="text-sm font-medium">1,247</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
