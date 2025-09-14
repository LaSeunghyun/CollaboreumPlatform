import { useUserGrowthData, useFundingPerformanceData } from '../../hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/Card';
import { Badge } from '../../../../shared/ui/Badge';
import { Users, TrendingUp, DollarSign, Activity, BarChart3, PieChart } from 'lucide-react';

export function AnalyticsSection() {
    const { data: userGrowthData, isLoading: userGrowthLoading } = useUserGrowthData();
    const { data: fundingPerformanceData, isLoading: fundingLoading } = useFundingPerformanceData();

    if (userGrowthLoading || fundingLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">분석 및 통계</h2>
                <div className="flex gap-3">
                    <Badge className="bg-blue-100 text-blue-800">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        실시간 업데이트
                    </Badge>
                </div>
            </div>

            {/* 주요 지표 요약 */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">평균 펀딩 성공률</p>
                                <p className="text-2xl font-bold text-green-600">78.5%</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">월간 활성 사용자</p>
                                <p className="text-2xl font-bold text-blue-600">650명</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">평균 프로젝트 금액</p>
                                <p className="text-2xl font-bold text-purple-600">₩2.1M</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">고객 만족도</p>
                                <p className="text-2xl font-bold text-yellow-600">4.7/5.0</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 차트 영역 */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>사용자 증가 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">차트 컴포넌트를 준비 중입니다</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>펀딩 성과 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">차트 컴포넌트를 준비 중입니다</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 카테고리별 현황 */}
            <Card>
                <CardHeader>
                    <CardTitle>카테고리별 현황</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">음악</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">35%</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">미술</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div className="w-10 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">28%</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">영화</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div className="w-6 h-2 bg-purple-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">18%</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">기타</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div className="w-3 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">19%</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 최근 활동 트렌드 */}
            <Card>
                <CardHeader>
                    <CardTitle>최근 활동 트렌드</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>신규 가입</span>
                                <span className="text-green-600">+12.5%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>펀딩 참여</span>
                                <span className="text-blue-600">+8.3%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full w-2/3"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>커뮤니티 활동</span>
                                <span className="text-purple-600">+15.7%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
