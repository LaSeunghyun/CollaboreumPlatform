import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
    DollarSign,
    Users,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    FileText,
    Calculator,
    PieChart,
    BarChart3,
    XCircle,
    Calendar,
    PlayCircle
} from 'lucide-react';
import { fundingAPI } from '../services/api';
import { constantsService } from '../services/constants';

interface RevenueDistribution {
    totalRevenue: number;
    platformFee: number;
    artistShare: number;
    backerShare: number;
    distributions: Distribution[];
}

interface Distribution {
    backer: string;
    userName: string;
    originalAmount: number;
    profitShare: number;
    totalReturn: number;
    distributedAt: string | null;
    status: '대기' | '분배완료' | '지급완료';
}

interface RevenueDistributionProps {
    revenueDistribution: RevenueDistribution;
    projectStatus: string;
    isArtist: boolean;
    projectId: string;
    onUpdate: () => void;
}

export const RevenueDistribution: React.FC<RevenueDistributionProps> = ({
    revenueDistribution,
    projectStatus,
    isArtist,
    projectId,
    onUpdate
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [statusColors, setStatusColors] = useState<Record<string, string>>({});
    const [statusIcons, setStatusIcons] = useState<Record<string, string>>({});

    const canDistribute = isArtist && projectStatus === '집행중';
    const hasDistributions = revenueDistribution.distributions.length > 0;

    // 상태 색상과 아이콘을 가져오기
    useEffect(() => {
        const fetchStatusData = async () => {
            try {
                // constantsService에서 모든 상태 데이터를 가져오기
                const [statusColorsData, statusIconsData] = await Promise.all([
                    constantsService.getStatusColors(),
                    constantsService.getStatusIcons()
                ]);

                setStatusColors(statusColorsData);
                setStatusIcons(statusIconsData);
            } catch (error) {
                console.error('상태 데이터를 가져오는데 실패했습니다:', error);
                // 백엔드 연결 실패 시 기본값 사용
                setStatusColors({
                    '대기': 'bg-gray-100 text-gray-800',
                    '분배완료': 'bg-blue-100 text-blue-800',
                    '지급완료': 'bg-green-100 text-green-800'
                });
                setStatusIcons({
                    '대기': 'Clock',
                    '분배완료': 'CheckCircle',
                    '지급완료': 'CheckCircle'
                });
            }
        };

        fetchStatusData();
    }, []);

    // 수익 분배 통계
    const totalDistributed = revenueDistribution.distributions.filter(d => d.status === '지급완료').length;
    const totalPending = revenueDistribution.distributions.filter(d => d.status === '대기').length;
    const totalCompleted = revenueDistribution.distributions.filter(d => d.status === '분배완료').length;

    // 분배 진행률
    const distributionProgress = hasDistributions
        ? ((totalCompleted + totalDistributed) / revenueDistribution.distributions.length) * 100
        : 0;

    // 수익 분배 실행
    const handleDistributeRevenue = async () => {
        try {
            setIsProcessing(true);
            setError(null);
            setSuccess(null);

            const response = await fundingAPI.distributeRevenue(projectId);

            if (response && typeof response === 'object' && 'success' in response && response.success) {
                setSuccess('수익 분배가 성공적으로 완료되었습니다.');
                onUpdate();
            } else {
                const message = response && typeof response === 'object' && 'message' in response && typeof response.message === 'string' ? response.message : '수익 분배에 실패했습니다.';
                setError(message);
            }
        } catch (error) {
            console.error('수익 분배 오류:', error);
            setError('수익 분배 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 분배 내역서 다운로드
    const handleDownloadReport = () => {
        // CSV 형태로 분배 내역서 생성
        const csvContent = generateCSVReport();
        downloadCSV(csvContent, `revenue_distribution_${projectId}.csv`);
    };

    const generateCSVReport = () => {
        const { generateRevenueDistributionCsv } = require('../utils/csvUtils');
        return generateRevenueDistributionCsv(revenueDistribution.distributions, projectId);
    };

    const downloadCSV = (content: string, filename: string) => {
        const { downloadCsv } = require('../utils/csvUtils');
        downloadCsv(content, filename);
    };

    // 아이콘 컴포넌트 매핑
    const getIconComponent = (iconName: string) => {
        const iconMap: Record<string, any> = {
            'Clock': Clock,
            'CheckCircle': CheckCircle,
            'XCircle': XCircle,
            'Calendar': Calendar,
            'PlayCircle': PlayCircle
        };
        const IconComponent = iconMap[iconName] || Clock;
        return <IconComponent className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">수익 분배</h3>
                    <p className="text-sm text-gray-600">프로젝트 성과에 따른 수익을 후원자들과 공유합니다</p>
                </div>
                {canDistribute && (
                    <Button
                        onClick={handleDistributeRevenue}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        {isProcessing ? '분배 중...' : '수익 분배 실행'}
                    </Button>
                )}
            </div>

            {/* 수익 분배 개요 */}
            <Card>
                <CardHeader>
                    <CardTitle>수익 분배 개요</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                ₩{revenueDistribution.totalRevenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">총 수익</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                ₩{(revenueDistribution.totalRevenue * revenueDistribution.platformFee).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">플랫폼 수수료</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                ₩{(revenueDistribution.totalRevenue * revenueDistribution.artistShare).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">아티스트 수익</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                ₩{(revenueDistribution.totalRevenue * revenueDistribution.backerShare).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">후원자 분배</div>
                        </div>
                    </div>

                    {/* 수익 분배 비율 차트 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>플랫폼 수수료 ({Math.round(revenueDistribution.platformFee * 100)}%)</span>
                            <span>₩{(revenueDistribution.totalRevenue * revenueDistribution.platformFee).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-purple-500 h-3 rounded-full"
                                style={{ width: `${revenueDistribution.platformFee * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>아티스트 수익 ({Math.round(revenueDistribution.artistShare * 100)}%)</span>
                            <span>₩{(revenueDistribution.totalRevenue * revenueDistribution.artistShare).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-green-500 h-3 rounded-full"
                                style={{ width: `${revenueDistribution.artistShare * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>후원자 분배 ({Math.round(revenueDistribution.backerShare * 100)}%)</span>
                            <span>₩{(revenueDistribution.totalRevenue * revenueDistribution.backerShare).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-orange-500 h-3 rounded-full"
                                style={{ width: `${revenueDistribution.backerShare * 100}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 분배 진행률 */}
            {hasDistributions && (
                <Card>
                    <CardHeader>
                        <CardTitle>분배 진행률</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {totalPending}
                                </div>
                                <div className="text-sm text-gray-500">대기 중</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {totalCompleted}
                                </div>
                                <div className="text-sm text-gray-500">분배 완료</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {totalDistributed}
                                </div>
                                <div className="text-sm text-gray-500">지급 완료</div>
                            </div>
                        </div>
                        <Progress value={distributionProgress} className="h-3" />
                        <div className="text-center text-sm text-gray-600 mt-2">
                            전체 진행률: {Math.round(distributionProgress)}%
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 수익 분배 내역 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">수익 분배 내역</h4>
                    {hasDistributions && (
                        <Button variant="outline" onClick={handleDownloadReport}>
                            <Download className="w-4 h-4 mr-2" />
                            내역서 다운로드
                        </Button>
                    )}
                </div>

                {!hasDistributions ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>아직 수익 분배가 실행되지 않았습니다.</p>
                            {canDistribute && (
                                <p className="text-sm mt-2">수익 분배 실행 버튼을 클릭하여 후원자들에게 수익을 분배하세요.</p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {revenueDistribution.distributions.map((distribution, index) => (
                            <Card key={distribution.backer} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    후원자 {index + 1}
                                                </Badge>
                                                <Badge className={statusColors[distribution.status] || 'bg-gray-100 text-gray-800'}>
                                                    {getIconComponent(statusIcons[distribution.status] || 'Clock')}
                                                    {distribution.status}
                                                </Badge>
                                            </div>
                                            <h4 className="text-lg font-medium mb-2">
                                                {distribution.userName}
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">원금:</span>
                                                    <span className="font-medium ml-2">₩{distribution.originalAmount.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">수익 배분:</span>
                                                    <span className="font-medium ml-2">₩{distribution.profitShare.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">총 반환금:</span>
                                                    <span className="font-medium ml-2 text-green-600">
                                                        ₩{distribution.totalReturn.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {distribution.distributedAt && (
                                                <div className="mt-3 text-sm text-gray-500">
                                                    분배일: {new Date(distribution.distributedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 수익률 표시 */}
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">수익률</span>
                                            <span className="font-medium text-green-600">
                                                +{((distribution.profitShare / distribution.originalAmount) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((distribution.profitShare / distribution.originalAmount) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* 수익 분배 가이드 */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-800">수익 분배 가이드</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>수익 분배는 프로젝트 집행이 완료된 후 실행할 수 있습니다.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>후원자별 수익 배분은 원금 대비 비율로 자동 계산됩니다.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>분배 완료 후 각 후원자에게 개별적으로 지급 처리를 진행합니다.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>모든 분배 내역은 투명하게 공개되어 후원자들이 확인할 수 있습니다.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 에러 및 성공 메시지 */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span>{success}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
