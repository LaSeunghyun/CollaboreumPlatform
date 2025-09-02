import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import {
    ArrowLeft,
    Heart,
    Share2,
    Calendar,
    MapPin,
    Target,
    Users,
    TrendingUp,
    FileText,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fundingAPI } from '../services/api';
import { PaymentModal } from './PaymentModal';
import { ExecutionStatus } from './ExecutionStatus';
import { ExpenseRecords } from './ExpenseRecords';
import { RevenueDistribution } from './RevenueDistribution';

interface FundingProject {
    id: string;
    title: string;
    description?: string;
    artist: string;
    category: string;
    goalAmount: number;
    currentAmount: number;
    backers: number;
    daysLeft: number;
    image: string;
    status: string;
    progressPercentage: number;
    startDate: string;
    endDate: string;
    rewards: any[];
    updates: any[];
    tags: string[];
    executionPlan: {
        stages: any[];
        totalBudget: number;
    };
    expenseRecords: any[];
    revenueDistribution: {
        totalRevenue: number;
        platformFee: number;
        artistShare: number;
        backerShare: number;
        distributions: any[];
    };
}

// 데이터 검증 및 정제 함수
const validateAndSanitizeProjectData = (data: any): FundingProject => {
    return {
        id: data.id || '',
        title: data.title || '제목 없음',
        description: data.description || '프로젝트 설명이 없습니다.',
        artist: data.artist || '아티스트 정보 없음',
        category: data.category || '카테고리 없음',
        goalAmount: typeof data.goalAmount === 'number' ? data.goalAmount : 0,
        currentAmount: typeof data.currentAmount === 'number' ? data.currentAmount : 0,
        backers: typeof data.backers === 'number' ? data.backers : 0,
        daysLeft: typeof data.daysLeft === 'number' ? data.daysLeft : 0,
        image: data.image || '',
        status: data.status || '준비중',
        progressPercentage: typeof data.progressPercentage === 'number' ? data.progressPercentage : 0,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date().toISOString(),
        rewards: Array.isArray(data.rewards) ? data.rewards : [],
        updates: Array.isArray(data.updates) ? data.updates : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        executionPlan: {
            stages: Array.isArray(data.executionPlan?.stages) ? data.executionPlan.stages : [],
            totalBudget: typeof data.executionPlan?.totalBudget === 'number' ? data.executionPlan.totalBudget : 0,
        },
        expenseRecords: Array.isArray(data.expenseRecords) ? data.expenseRecords : [],
        revenueDistribution: {
            totalRevenue: typeof data.revenueDistribution?.totalRevenue === 'number' ? data.revenueDistribution.totalRevenue : 0,
            platformFee: typeof data.revenueDistribution?.platformFee === 'number' ? data.revenueDistribution.platformFee : 0.05,
            artistShare: typeof data.revenueDistribution?.artistShare === 'number' ? data.revenueDistribution.artistShare : 0.70,
            backerShare: typeof data.revenueDistribution?.backerShare === 'number' ? data.revenueDistribution.backerShare : 0.25,
            distributions: Array.isArray(data.revenueDistribution?.distributions) ? data.revenueDistribution.distributions : [],
        },
    };
};

// XSS 방지를 위한 텍스트 이스케이프 함수
const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

export const FundingProjectDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState<FundingProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (projectId) {
            fetchProjectDetail();
        } else {
            setError('프로젝트 ID가 없습니다.');
            setIsLoading(false);
        }
    }, [projectId]);

    // projectId가 없으면 에러 표시
    if (!projectId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">프로젝트를 찾을 수 없습니다</h2>
                    <p className="text-gray-600 mb-4">프로젝트 ID가 유효하지 않습니다.</p>
                    <Button onClick={() => navigate('/funding')} variant="outline">
                        펀딩 프로젝트 목록으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const fetchProjectDetail = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fundingAPI.getProjectDetail(projectId!);

            if ((response as any).success && (response as any).data) {
                const validatedData = validateAndSanitizeProjectData((response as any).data);
                setProject(validatedData);
            } else {
                setError('프로젝트를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('프로젝트 상세 조회 오류:', error);
            setError('프로젝트 조회 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchProjectDetail();
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handlePaymentSuccess = (paymentData: any) => {
        // 결제 성공 후 프로젝트 정보 새로고침
        fetchProjectDetail();
        setShowPaymentModal(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case '준비중': return 'bg-gray-100 text-gray-800';
            case '진행중': return 'bg-blue-100 text-blue-800';
            case '성공': return 'bg-green-100 text-green-800';
            case '실패': return 'bg-red-100 text-red-800';
            case '집행중': return 'bg-purple-100 text-purple-800';
            case '완료': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case '준비중': return <Clock className="w-4 h-4" />;
            case '진행중': return <TrendingUp className="w-4 h-4" />;
            case '성공': return <CheckCircle className="w-4 h-4" />;
            case '실패': return <AlertCircle className="w-4 h-4" />;
            case '집행중': return <FileText className="w-4 h-4" />;
            case '완료': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
                    <Progress value={undefined} className="mt-4 w-48 mx-auto" />
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
                    <p className="text-gray-600 mb-4">{error || '프로젝트를 찾을 수 없습니다.'}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={handleRetry} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            다시 시도
                        </Button>
                        <Button onClick={handleBack} variant="outline">
                            ← 목록으로 돌아가기
                        </Button>
                    </div>
                    {retryCount > 0 && (
                        <p className="text-sm text-gray-500 mt-2">재시도 횟수: {retryCount}</p>
                    )}
                </div>
            </div>
        );
    }

    const canBack = project.status === '진행중';
    const isArtist = user && user.id === project.artist;
    const hasBacked = user && Array.isArray(project.backers) && project.backers.some((backer: any) => backer.userId === user.id);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-6">
                    <Button onClick={handleBack} variant="outline" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        이전 페이지로 돌아가기
                    </Button>
                </div>

                {/* 프로젝트 헤더 */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary">{escapeHtml(project.category)}</Badge>
                                    <Badge className={getStatusColor(project.status)}>
                                        {getStatusIcon(project.status)}
                                        {escapeHtml(project.status)}
                                    </Badge>
                                </div>
                                <CardTitle className="text-3xl mb-2">{escapeHtml(project.title)}</CardTitle>
                                <p className="text-gray-600 text-lg mb-4">{escapeHtml(project.description || '')}</p>

                                {/* 진행률 및 통계 */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            ₩{project.currentAmount.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500">모금된 금액</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {project.progressPercentage}%
                                        </div>
                                        <div className="text-sm text-gray-500">달성률</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {project.backers}
                                        </div>
                                        <div className="text-sm text-gray-500">후원자</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {project.daysLeft}
                                        </div>
                                        <div className="text-sm text-gray-500">일 남음</div>
                                    </div>
                                </div>

                                {/* 진행률 바 */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>목표: ₩{project.goalAmount.toLocaleString()}</span>
                                        <span>{project.progressPercentage}% 달성</span>
                                    </div>
                                    <Progress value={project.progressPercentage} className="h-3" />
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex gap-3">
                                    {canBack && (
                                        <Button
                                            size="lg"
                                            className="flex-1"
                                            onClick={() => setShowPaymentModal(true)}
                                        >
                                            <DollarSign className="w-5 h-5 mr-2" />
                                            후원하기
                                        </Button>
                                    )}
                                    <Button variant="outline" size="lg">
                                        <Heart className="w-5 h-5 mr-2" />
                                        좋아요
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Share2 className="w-5 h-5 mr-2" />
                                        공유하기
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* 프로젝트 상세 정보 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 메인 콘텐츠 */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">프로젝트 개요</TabsTrigger>
                                <TabsTrigger value="execution">집행 현황</TabsTrigger>
                                <TabsTrigger value="expenses">비용 내역</TabsTrigger>
                                <TabsTrigger value="revenue">수익 분배</TabsTrigger>
                            </TabsList>

                            {/* 프로젝트 개요 */}
                            <TabsContent value="overview" className="space-y-6">
                                {/* 프로젝트 이미지 */}
                                {project.image && (
                                    <Card>
                                        <CardContent className="p-0">
                                            <img
                                                src={project.image}
                                                alt={escapeHtml(project.title)}
                                                className="w-full h-64 object-cover rounded-t-lg"
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 프로젝트 설명 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>프로젝트 소개</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{escapeHtml(project.description || '')}</p>
                                    </CardContent>
                                </Card>

                                {/* 리워드 정보 */}
                                {project.rewards.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>후원 리워드</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {project.rewards.map((reward, index) => (
                                                    <div key={index} className="p-4 border rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-lg">{escapeHtml(reward.title)}</h4>
                                                            <Badge variant="secondary">
                                                                ₩{reward.amount.toLocaleString()}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-gray-600 mb-2">{escapeHtml(reward.description)}</p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>선택한 후원자: {reward.claimed}명</span>
                                                            {reward.maxClaim && (
                                                                <span>제한: {reward.maxClaim}명</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 프로젝트 업데이트 */}
                                {project.updates.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>프로젝트 업데이트</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {project.updates.map((update, index) => (
                                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">{escapeHtml(update.type)}</Badge>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(update.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-medium mb-2">{escapeHtml(update.title)}</h4>
                                                        <p className="text-gray-700">{escapeHtml(update.content)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* 집행 현황 */}
                            <TabsContent value="execution">
                                <ExecutionStatus
                                    executionPlan={project.executionPlan}
                                    projectStatus={project.status}
                                    isArtist={isArtist || false}
                                    projectId={project.id}
                                    onUpdate={fetchProjectDetail}
                                />
                            </TabsContent>

                            {/* 비용 내역 */}
                            <TabsContent value="expenses">
                                <ExpenseRecords
                                    expenseRecords={project.expenseRecords}
                                    executionPlan={project.executionPlan}
                                    projectStatus={project.status}
                                    isArtist={isArtist || false}
                                    projectId={project.id}
                                    onUpdate={fetchProjectDetail}
                                />
                            </TabsContent>

                            {/* 수익 분배 */}
                            <TabsContent value="revenue">
                                <RevenueDistribution
                                    revenueDistribution={project.revenueDistribution}
                                    projectStatus={project.status}
                                    isArtist={isArtist || false}
                                    projectId={project.id}
                                    onUpdate={fetchProjectDetail}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 사이드바 */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* 아티스트 정보 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>아티스트 정보</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback>{escapeHtml(project.artist).charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium">{escapeHtml(project.artist)}</h4>
                                            <p className="text-sm text-gray-500">프로젝트 창작자</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 프로젝트 정보 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>프로젝트 정보</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>시작일: {new Date(project.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <span>종료일: {new Date(project.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>카테고리: {escapeHtml(project.category)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 태그 */}
                            {project.tags.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>태그</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline">
                                                    {escapeHtml(tag)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 결제 모달 */}
            {showPaymentModal && (
                <PaymentModal
                    project={project}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};
