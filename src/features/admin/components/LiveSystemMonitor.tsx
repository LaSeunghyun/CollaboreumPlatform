import { useSystemMetrics } from '../hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Progress } from '../../../shared/ui/Progress';
import { Separator } from '../../../shared/ui/Separator';
import {
    Activity,
    Server,
    Database,
    Wifi,
    Users,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

export function LiveSystemMonitor() {
    const { data: metrics, isLoading, error } = useSystemMetrics();

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600">시스템 메트릭을 불러오는 중 오류가 발생했습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!metrics) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center">
                        <p className="text-gray-500">시스템 메트릭 데이터가 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
        if (value >= thresholds.critical) return "text-red-600 bg-red-100";
        if (value >= thresholds.warning) return "text-yellow-600 bg-yellow-100";
        return "text-green-600 bg-green-100";
    };

    const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
        if (value >= thresholds.critical) return "bg-red-500";
        if (value >= thresholds.warning) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
        if (value >= thresholds.critical) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const isOnline = metrics.errorRate < 5; // 5% 미만이면 온라인으로 간주

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <CardTitle>실시간 시스템 모니터링</CardTitle>
                        <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isOnline ? "온라인" : "오프라인"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>마지막 업데이트: {metrics.lastUpdate}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* 서버 상태 */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        서버 상태
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">CPU 사용률</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(metrics.cpuUsage, { warning: 70, critical: 85 })}
                                    <Badge className={getStatusColor(metrics.cpuUsage, { warning: 70, critical: 85 })}>
                                        {metrics.cpuUsage}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress
                                value={metrics.cpuUsage}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">메모리 사용률</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(metrics.memoryUsage, { warning: 80, critical: 90 })}
                                    <Badge className={getStatusColor(metrics.memoryUsage, { warning: 80, critical: 90 })}>
                                        {metrics.memoryUsage}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress
                                value={metrics.memoryUsage}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">디스크 사용률</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(metrics.diskUsage, { warning: 80, critical: 90 })}
                                    <Badge className={getStatusColor(metrics.diskUsage, { warning: 80, critical: 90 })}>
                                        {metrics.diskUsage}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress
                                value={metrics.diskUsage}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">서버 부하</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(metrics.serverLoad, { warning: 70, critical: 85 })}
                                    <Badge className={getStatusColor(metrics.serverLoad, { warning: 70, critical: 85 })}>
                                        {metrics.serverLoad}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress
                                value={metrics.serverLoad}
                                className="h-2"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* 네트워크 및 사용자 현황 */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        네트워크 & 사용자 현황
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{metrics.networkLatency}ms</div>
                            <div className="text-sm text-gray-600">네트워크 지연시간</div>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
                            <div className="text-sm text-gray-600">활성 사용자</div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{metrics.ongoingTransactions}</div>
                            <div className="text-sm text-gray-600">진행중 거래</div>
                        </div>

                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{metrics.errorRate.toFixed(2)}%</div>
                            <div className="text-sm text-gray-600">오류율</div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* 시스템 요약 */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        시스템 요약
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-gray-600">업타임</span>
                            <Badge className="bg-green-100 text-green-800">{metrics.uptime}</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-gray-600">서버 상태</span>
                            <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {isOnline ? "정상" : "점검중"}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-gray-600">전체 상태</span>
                            <Badge className={
                                metrics.cpuUsage < 70 && metrics.memoryUsage < 80 && metrics.errorRate < 1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }>
                                {metrics.cpuUsage < 70 && metrics.memoryUsage < 80 && metrics.errorRate < 1 ? "정상" : "주의"}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 알림 영역 */}
                {(metrics.cpuUsage > 70 || metrics.memoryUsage > 80 || metrics.errorRate > 1) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">시스템 주의사항</span>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            {metrics.cpuUsage > 70 && <li>• CPU 사용률이 높습니다 ({metrics.cpuUsage}%)</li>}
                            {metrics.memoryUsage > 80 && <li>• 메모리 사용률이 높습니다 ({metrics.memoryUsage}%)</li>}
                            {metrics.errorRate > 1 && <li>• 오류율이 증가했습니다 ({metrics.errorRate.toFixed(2)}%)</li>}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
