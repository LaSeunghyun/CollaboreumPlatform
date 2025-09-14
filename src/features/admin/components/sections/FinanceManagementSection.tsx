import { useFinancialData } from '../../hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/Card';
import { Badge } from '../../../../shared/ui/Badge';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

export function FinanceManagementSection() {
    const { data: financialData, isLoading, error } = useFinancialData();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">재정 데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    if (!financialData || financialData.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">재정 데이터가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">재정 관리</h2>
                <div className="flex gap-3">
                    <Badge className="bg-green-100 text-green-800">
                        <DollarSign className="w-4 h-4 mr-1" />
                        정상 운영
                    </Badge>
                </div>
            </div>

            {/* 월별 재정 현황 */}
            <div className="space-y-6">
                {financialData.map((data, index) => (
                    <Card key={data.month}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {data.month} 재정 현황
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">총 매출</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        ₩{(data.totalRevenue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₩{(data.platformFee / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">아티스트 정산</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        ₩{(data.artistPayouts / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">투자자 수익</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        ₩{(data.investorReturns / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">보류 결제</p>
                                    <p className="text-xl font-bold text-red-600">
                                        ₩{(data.pendingPayments / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 재정 요약 */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>수익 구조 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">플랫폼 수수료율</span>
                                <span className="font-semibold">10%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">아티스트 수익률</span>
                                <span className="font-semibold">70%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">투자자 수익률</span>
                                <span className="font-semibold">20%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">평균 정산 시간</span>
                                <span className="font-semibold">3-5일</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>정산 현황</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">이번 달 정산 완료</span>
                                <Badge className="bg-green-100 text-green-800">32건</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">정산 대기 중</span>
                                <Badge className="bg-yellow-100 text-yellow-800">5건</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">정산 지연</span>
                                <Badge className="bg-red-100 text-red-800">1건</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">다음 정산일</span>
                                <span className="font-semibold">2025-08-15</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 알림 영역 */}
            {financialData[0]?.pendingPayments > 1000000 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">정산 주의사항</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                            보류된 결제가 ₩{(financialData[0].pendingPayments / 1000000).toFixed(1)}M에 달합니다.
                            관련 아티스트들에게 정산 지연 안내를 발송해주세요.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
