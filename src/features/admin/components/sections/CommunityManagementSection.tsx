import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../shared/ui/Table';
import { Badge } from '../../../../shared/ui/Badge';
import { Button } from '../../../../shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../shared/ui/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/Select';
import { Input } from '../../../../shared/ui/Input';
import { Search, Eye, CheckCircle, XCircle, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { useReports, useResolveReport } from '../../hooks/useAdminData';
import { Report } from '../../types';

export function CommunityManagementSection() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const { data: reportsData, isLoading, error } = useReports({
        status: filter === "all" ? undefined : filter,
        page,
        limit: 20
    });

    const resolveReport = useResolveReport();

    const reports = reportsData?.reports || [];
    const pagination = reportsData?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">대기중</Badge>;
            case "investigating":
                return <Badge className="bg-blue-100 text-blue-800">조사중</Badge>;
            case "resolved":
                return <Badge className="bg-green-100 text-green-800">해결됨</Badge>;
            case "dismissed":
                return <Badge className="bg-gray-100 text-gray-800">기각됨</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getReasonBadge = (reason: string) => {
        switch (reason) {
            case "spam":
                return <Badge className="bg-red-100 text-red-800">스팸</Badge>;
            case "harassment":
                return <Badge className="bg-orange-100 text-orange-800">괴롭힘</Badge>;
            case "inappropriate_content":
                return <Badge className="bg-yellow-100 text-yellow-800">부적절한 콘텐츠</Badge>;
            case "fraud":
                return <Badge className="bg-red-100 text-red-800">사기</Badge>;
            case "copyright":
                return <Badge className="bg-purple-100 text-purple-800">저작권</Badge>;
            default:
                return <Badge variant="outline">{reason}</Badge>;
        }
    };

    const getContentTypeBadge = (type: string) => {
        switch (type) {
            case "user":
                return <Badge className="bg-blue-100 text-blue-800">사용자</Badge>;
            case "project":
                return <Badge className="bg-green-100 text-green-800">프로젝트</Badge>;
            case "post":
                return <Badge className="bg-purple-100 text-purple-800">게시글</Badge>;
            case "comment":
                return <Badge className="bg-yellow-100 text-yellow-800">댓글</Badge>;
            case "live_stream":
                return <Badge className="bg-red-100 text-red-800">라이브</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const handleResolveReport = async (reportId: string, resolution: string) => {
        try {
            await resolveReport.mutateAsync({
                reportId,
                resolution,
                actionTaken: resolution === 'resolved' ? '신고가 수용되어 조치가 취해졌습니다.' : '신고가 기각되었습니다.',
                notes: '관리자에 의한 처리'
            });
        } catch (error) {
            console.error('신고 처리 실패:', error);
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
                <p className="text-red-600">신고 데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">커뮤니티 관리</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="신고 내용 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="investigating">조사중</SelectItem>
                            <SelectItem value="resolved">해결됨</SelectItem>
                            <SelectItem value="dismissed">기각됨</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 커뮤니티 통계 */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">미처리 신고</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {reports.filter((r: Report) => r.status === 'pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">이번 주 게시글</p>
                                <p className="text-2xl font-bold text-blue-600">156</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">활성 토론</p>
                                <p className="text-2xl font-bold text-green-600">42</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">활동 증가율</p>
                                <p className="text-2xl font-bold text-purple-600">+15.7%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>신고자</TableHead>
                                <TableHead>신고 대상</TableHead>
                                <TableHead>콘텐츠 유형</TableHead>
                                <TableHead>신고 사유</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>담당자</TableHead>
                                <TableHead>신고일</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report: Report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={report.reporter.avatar} alt={report.reporter.name} />
                                                <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{report.reporter.name}</div>
                                                <div className="text-sm text-gray-500">ID: {report.reporter.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={report.reportedUser.avatar} alt={report.reportedUser.name} />
                                                <AvatarFallback>{report.reportedUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{report.reportedUser.name}</div>
                                                <div className="text-sm text-gray-500">ID: {report.reportedUser.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getContentTypeBadge(report.contentType)}</TableCell>
                                    <TableCell>{getReasonBadge(report.reason)}</TableCell>
                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                    <TableCell>
                                        {report.assignedTo || <span className="text-gray-400">미배정</span>}
                                    </TableCell>
                                    <TableCell>{report.createdAt}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" title="자세히 보기">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {report.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => handleResolveReport(report.id.toString(), 'resolved')}
                                                        disabled={resolveReport.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleResolveReport(report.id.toString(), 'dismissed')}
                                                        disabled={resolveReport.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
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
