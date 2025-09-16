import { useState, useEffect, useCallback } from 'react';
import { getFirstChar, getUsername, getAvatarUrl } from '../../utils/typeGuards';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Separator } from './separator';
import {
    X,
    Calendar,
    Users,
    DollarSign,
    Target,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    MessageCircle,
    Heart
} from 'lucide-react';
import { FundingProject } from '../../types/funding';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_TEXTS } from '../../types/funding';
import { formatCurrency, formatDate, calculateSuccessRate } from '../../utils/fundingUtils';
import { fundingService } from '../../services/fundingService';

interface ProjectDetailModalProps {
    projectId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ProjectUpdate {
    id: number;
    title: string;
    content: string;
    date: string;
    images?: string[];
}

interface ProjectBacker {
    id: number;
    name: string;
    avatar?: string;
    amount: number;
    date: string;
    reward?: string;
}

export function ProjectDetailModal({ projectId, isOpen, onClose }: ProjectDetailModalProps) {
    const [project, setProject] = useState<FundingProject | null>(null);
    const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
    const [backers, setBackers] = useState<ProjectBacker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'backers'>('overview');

    const fetchProjectDetails = useCallback(async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            setError(null);

            const [projectData, updatesData, backersData] = await Promise.all([
                fundingService.getProjectDetails(projectId),
                fundingService.getProjectUpdates(projectId),
                fundingService.getProjectBackers(projectId)
            ]);

            setProject(projectData);
            setUpdates(updatesData);
            setBackers(backersData);
        } catch (error) {
            console.error('프로젝트 상세 정보 조회 실패:', error);
            setError('프로젝트 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (isOpen && projectId) {
            fetchProjectDetails();
        }
    }, [isOpen, projectId, fetchProjectDetails]);

    const getProjectStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "ongoing":
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">
                            프로젝트 상세정보
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchProjectDetails}>다시 시도</Button>
                    </div>
                ) : project ? (
                    <div className="space-y-6">
                        {/* 프로젝트 헤더 */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {getProjectStatusIcon(project.status)}
                                            <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                                                {PROJECT_STATUS_TEXTS[project.status]}
                                            </Badge>
                                            <Badge variant="outline">{project.category}</Badge>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        공유하기
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-gray-500" />
                                            <span className="text-sm text-gray-600">목표 금액</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(project.targetAmount)}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm text-gray-600">달성 금액</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(project.currentAmount)}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-green-500" />
                                            <span className="text-sm text-gray-600">후원자</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {project.backers}명
                                        </p>
                                    </div>
                                </div>

                                {/* 진행률 바 */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>달성률</span>
                                        <span>{Math.round(calculateSuccessRate(project.currentAmount, project.targetAmount))}%</span>
                                    </div>
                                    <Progress
                                        value={calculateSuccessRate(project.currentAmount, project.targetAmount)}
                                        className="h-3"
                                    />
                                </div>

                                {/* 기간 정보 */}
                                <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(project.startDate)} ~ {formatDate(project.endDate)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 탭 네비게이션 */}
                        <div className="flex border-b">
                            <button
                                className={`px-4 py-2 font-medium ${activeTab === 'overview'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setActiveTab('overview')}
                            >
                                개요
                            </button>
                            <button
                                className={`px-4 py-2 font-medium ${activeTab === 'updates'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setActiveTab('updates')}
                            >
                                업데이트 ({updates.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium ${activeTab === 'backers'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setActiveTab('backers')}
                            >
                                후원자 ({backers.length})
                            </button>
                        </div>

                        {/* 탭 컨텐츠 */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* 프로젝트 결과 (성공한 경우) */}
                                {project.status === "success" && project.result && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-green-800">프로젝트 결과</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">최종 달성 금액</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {formatCurrency(project.result.finalAmount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">달성률</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {project.result.successRate}%
                                                    </p>
                                                </div>
                                            </div>
                                            {project.result.completionDate && (
                                                <div>
                                                    <p className="text-sm text-gray-600">완료일</p>
                                                    <p className="font-medium">{formatDate(project.result.completionDate)}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">제공된 결과물</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.result.deliverables.map((deliverable, index) => (
                                                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                                            {deliverable}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 프로젝트 실패 정보 */}
                                {project.status === "failed" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-red-800">프로젝트 실패</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <p className="text-gray-700">
                                                    목표 금액의 {Math.round(calculateSuccessRate(project.currentAmount, project.targetAmount))}% 달성
                                                </p>
                                                <p className="text-gray-700">
                                                    {project.backers}명의 후원자가 참여했습니다.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'updates' && (
                            <div className="space-y-4">
                                {updates.length > 0 ? (
                                    updates.map((update, index) => (
                                        <Card key={update.id}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-medium text-gray-900">{update.title}</h4>
                                                    <span className="text-sm text-gray-500">{formatDate(update.date)}</span>
                                                </div>
                                                <p className="text-gray-700 mb-3">{update.content}</p>
                                                {update.images && update.images.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {update.images.map((image, imgIndex) => (
                                                            <img
                                                                key={imgIndex}
                                                                src={image}
                                                                alt={`업데이트 이미지 ${imgIndex + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                    <button className="flex items-center gap-1 hover:text-blue-600">
                                                        <Heart className="w-4 h-4" />
                                                        <span>좋아요</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 hover:text-blue-600">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>댓글</span>
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="p-8 text-center text-gray-500">
                                            <p>아직 업데이트가 없습니다.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'backers' && (
                            <div className="space-y-4">
                                {backers.length > 0 ? (
                                    backers.map((backer, index) => (
                                        <Card key={backer.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={backer.avatar} alt={backer.name} />
                                                            <AvatarFallback>{getFirstChar(backer.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{backer.name}</p>
                                                            {backer.reward && (
                                                                <p className="text-sm text-gray-600">{backer.reward}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-blue-600">
                                                            {formatCurrency(backer.amount)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{formatDate(backer.date)}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="p-8 text-center text-gray-500">
                                            <p>아직 후원자가 없습니다.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
