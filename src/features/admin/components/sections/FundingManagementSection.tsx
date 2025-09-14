import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../shared/ui/Table';
import { Badge } from '../../../../shared/ui/Badge';
import { Button } from '../../../../shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../shared/ui/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/Select';
import { Input } from '../../../../shared/ui/Input';
import { Progress } from '../../../../shared/ui/Progress';
import { Search, Eye, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import { useFundingProjects, useUpdateProjectApproval } from '../../hooks/useAdminData';
import { getFirstChar, getUsername, getAvatarUrl } from '../../../../utils/typeGuards';

export function FundingManagementSection() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const { data: projectsData, isLoading, error } = useFundingProjects({
        status: filter === "all" ? undefined : filter,
        page,
        limit: 20
    });

    const updateProjectApproval = useUpdateProjectApproval();

    const projects = (projectsData as any)?.projects || [];
    const pagination = (projectsData as any)?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-blue-100 text-blue-800">진행중</Badge>;
            case "successful":
                return <Badge className="bg-green-100 text-green-800">성공</Badge>;
            case "failed":
                return <Badge className="bg-red-100 text-red-800">실패</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">대기</Badge>;
            case "draft":
                return <Badge className="bg-gray-100 text-gray-800">초안</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getApprovalBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-100 text-green-800">승인</Badge>;
            case "rejected":
                return <Badge className="bg-red-100 text-red-800">반려</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">검토중</Badge>;
            case "under_review":
                return <Badge className="bg-blue-100 text-blue-800">검토중</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const handleApprovalChange = async (projectId: string, approvalStatus: string) => {
        try {
            await updateProjectApproval.mutateAsync({
                projectId,
                approvalStatus: approvalStatus === 'approved',
                feedback: approvalStatus === 'approved' ? '승인되었습니다.' : '반려되었습니다.'
            });
        } catch (error) {
            console.error('프로젝트 승인 상태 변경 실패:', error);
        }
    };

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
                <p className="text-red-600">펀딩 프로젝트 데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">펀딩 프로젝트 관리</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="프로젝트 또는 아티스트 검색"
                            className="pl-10 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="active">진행중</SelectItem>
                            <SelectItem value="successful">성공</SelectItem>
                            <SelectItem value="failed">실패</SelectItem>
                            <SelectItem value="pending">대기</SelectItem>
                            <SelectItem value="draft">초안</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>프로젝트</TableHead>
                                <TableHead>카테고리</TableHead>
                                <TableHead>목표금액</TableHead>
                                <TableHead>달성률</TableHead>
                                <TableHead>후원자</TableHead>
                                <TableHead>마감일</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>승인상태</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project: any) => (
                                <TableRow key={project.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={project.artist.avatar} alt={project.artist.name} />
                                                <AvatarFallback>{getFirstChar(project.artist.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium max-w-xs truncate">{project.title}</div>
                                                <div className="text-sm text-gray-500">{project.artist.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{project.category}</Badge>
                                    </TableCell>
                                    <TableCell>₩{project.goalAmount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>₩{project.currentAmount.toLocaleString()}</span>
                                                <span>{calculateProgress(project.currentAmount, project.goalAmount).toFixed(0)}%</span>
                                            </div>
                                            <Progress
                                                value={calculateProgress(project.currentAmount, project.goalAmount)}
                                                className="h-2"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>{project.backerCount}명</TableCell>
                                    <TableCell>{project.deadline}</TableCell>
                                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                                    <TableCell>{getApprovalBadge(project.approvalStatus)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" title="자세히 보기">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {project.approvalStatus === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => handleApprovalChange(project.id, 'approved')}
                                                        disabled={updateProjectApproval.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleApprovalChange(project.id, 'rejected')}
                                                        disabled={updateProjectApproval.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {project.status === "successful" && (
                                                <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700" title="정산">
                                                    <DollarSign className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-gray-600">
                        {page} / {pagination.totalPages} 페이지
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}
