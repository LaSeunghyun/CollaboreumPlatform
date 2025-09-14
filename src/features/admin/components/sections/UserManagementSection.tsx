import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import { Search, Eye, Ban, CheckCircle, UserCheck, UserX } from 'lucide-react';
import { useUsers, useUpdateUserStatus, useSuspendUser, useRestoreUser } from '../../hooks/useAdminData';

export function UserManagementSection() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const { data: usersData, isLoading, error } = useUsers({
        status: filter === "all" ? undefined : filter,
        search: searchTerm || undefined,
        page,
        limit: 20
    });

    const updateUserStatus = useUpdateUserStatus();
    const suspendUser = useSuspendUser();
    const restoreUser = useRestoreUser();

    const users = usersData?.users || [];
    const pagination = usersData?.pagination;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-800">활성</Badge>;
            case "suspended":
                return <Badge className="bg-red-100 text-red-800">정지</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">대기</Badge>;
            case "deactivated":
                return <Badge className="bg-gray-100 text-gray-800">비활성</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        return role === "artist" ?
            <Badge variant="outline" className="bg-purple-100 text-purple-800">아티스트</Badge> :
            <Badge variant="outline" className="bg-blue-100 text-blue-800">팬</Badge>;
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            if (newStatus === 'suspended') {
                await suspendUser.mutateAsync({ userId, reason: '관리자에 의한 계정 정지' });
            } else if (newStatus === 'active') {
                await restoreUser.mutateAsync(userId);
            } else {
                await updateUserStatus.mutateAsync({ userId, status: newStatus });
            }
        } catch (error) {
            console.error('사용자 상태 변경 실패:', error);
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
                <p className="text-red-600">사용자 데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">회원 관리</h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="이름 또는 이메일 검색"
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
                            <SelectItem value="active">활성</SelectItem>
                            <SelectItem value="suspended">정지</SelectItem>
                            <SelectItem value="pending">대기</SelectItem>
                            <SelectItem value="deactivated">비활성</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>사용자</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead>가입일</TableHead>
                                <TableHead>최근 활동</TableHead>
                                <TableHead>펀딩 참여</TableHead>
                                <TableHead>총 투자금</TableHead>
                                <TableHead>신고 횟수</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{user.joinDate}</TableCell>
                                    <TableCell>{user.lastActivity}</TableCell>
                                    <TableCell>{user.fundingCount}건</TableCell>
                                    <TableCell>₩{user.totalInvestment.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {user.reportCount > 0 ? (
                                            <Badge className="bg-red-100 text-red-800">
                                                {user.reportCount}회
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400">없음</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" title="자세히 보기">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {user.status === "active" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                    disabled={suspendUser.isPending}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </Button>
                                            ) : user.status === "suspended" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                    disabled={restoreUser.isPending}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            ) : null}
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
