import React from 'react';
import {
import { Card, Badge, Skeleton } from '@/shared/ui';
    Users,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Activity,
    RefreshCw,
} from 'lucide-react';
import { useAdminStats } from '../../../../lib/api/useAdminStats';

interface PlatformStatisticsProps {
    className?: string;
}

export const PlatformStatistics: React.FC<PlatformStatisticsProps> = ({ className }) => {
    const {
        data: statsResponse,
        isLoading,
        error,
        refetch,
        isFetching
    } = useAdminStats();

    const stats = statsResponse?.data;

    // 로딩 상태
    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} variant="outlined" size="sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card variant="outlined">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">통계 데이터를 불러올 수 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            다시 시도
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 데이터가 없는 경우
    if (!stats) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card variant="outlined">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">통계 데이터가 없습니다.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statCards = [
        {
            title: '전체 사용자',
            value: stats.totalUsers.toLocaleString(),
            change: '+12%', // 실제로는 API에서 계산된 값이어야 함
            changeType: 'positive' as const,
            icon: Users,
            description: '이번 달 신규 가입자',
        },
        {
            title: '진행 중인 프로젝트',
            value: stats.totalProjects.toLocaleString(),
            change: '+5%',
            changeType: 'positive' as const,
            icon: Activity,
            description: '현재 펀딩 중인 프로젝트',
        },
        {
            title: '총 펀딩 금액',
            value: `₩${stats.totalFunding.toLocaleString()}`,
            change: '+23%',
            changeType: 'positive' as const,
            icon: DollarSign,
            description: '누적 펀딩 성과',
        },
        {
            title: '대기 중인 프로젝트',
            value: stats.pendingProjects.toLocaleString(),
            change: '-2%',
            changeType: 'negative' as const,
            icon: AlertTriangle,
            description: '승인 대기 중인 프로젝트',
        },
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} variant="outlined" size="sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <Badge
                                        variant={stat.changeType === 'positive' ? 'success' : 'danger'}
                                        size="sm"
                                    >
                                        {stat.change}
                                    </Badge>
                                    <span>{stat.description}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 추가 통계 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="outlined">
                    <CardHeader>
                        <CardTitle>사용자 활동 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">활성 사용자</span>
                                <span className="font-semibold">{stats.activeUsers.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">완료된 프로젝트</span>
                                <span className="font-semibold">{stats.completedProjects.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">성공률</span>
                                <span className="font-semibold text-success-600">
                                    {Math.round((stats.completedProjects / stats.totalProjects) * 100)}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardHeader>
                        <CardTitle>최근 트렌드</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">이번 주 신규 프로젝트</span>
                                <Badge variant="success" size="sm">+8</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">이번 주 신규 사용자</span>
                                <Badge variant="success" size="sm">+45</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">평균 펀딩 금액</span>
                                <span className="font-semibold">
                                    ₩{Math.round(stats.totalFunding / stats.totalProjects).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
