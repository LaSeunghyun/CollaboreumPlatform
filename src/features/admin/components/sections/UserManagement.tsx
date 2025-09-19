import React, { useState, useMemo } from 'react';
import { Button, Card, Input, Badge, Avatar, Skeleton, Table, Select, Dialog } from '@/shared/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
        import {
            Dialog,
            DialogContent,
            DialogHeader,
            DialogTitle,
            import {
                Search,
                Eye,
                Edit,
                Trash2,
                UserPlus,
                Download,
                RefreshCw,
                AlertTriangle,
            } from 'lucide-react';
            import { format } from 'date-fns';
            import { ko } from 'date-fns/locale';
            import {
                useAdminUsers,
                useUpdateUserStatus,
                useUpdateUserRole,
                useDeleteUser,
                type AdminUser
            } from '../../../../lib/api/useAdminUsers';

            interface UserManagementProps {
    className ?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [page, setPage] = useState(1);

    // API 훅들
    const {
        data: usersResponse,
        isLoading,
        error,
        refetch
    } = useAdminUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 20,
    });

    const updateUserStatusMutation = useUpdateUserStatus();
    const updateUserRoleMutation = useUpdateUserRole();
    const deleteUserMutation = useDeleteUser();

    // 사용자 데이터 추출
    const users = usersResponse?.data?.users || [];
    const pagination = usersResponse?.data?.pagination;

    // 로딩 상태
    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card>
                    <CardHeader>
                        <CardTitle>사용자 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 w-40" />
                                <Skeleton className="h-10 w-40" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <div className="border rounded-lg">
                                <div className="space-y-2 p-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card>
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">사용자 데이터를 불러올 수 없습니다</h3>
                        <p className="text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
                        </p>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            다시 시도
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleViewUser = (user: AdminUser) => {
        setSelectedUser(user);
        setShowUserDetail(true);
    };

    const handleEditUser = (user: AdminUser) => {
        // 편집 로직 (모달 또는 페이지로 이동)
        console.log('Edit user:', user);
    };

    const handleDeleteUser = async (user: AdminUser) => {
        if (window.confirm(`${user.username} 사용자를 삭제하시겠습니까?`)) {
            try {
                await deleteUserMutation.mutateAsync(user.id);
                // 성공 메시지 표시
            } catch (error) {
                console.error('사용자 삭제 실패:', error);
                // 에러 메시지 표시
            }
        }
    };

    const handleStatusChange = async (user: AdminUser, newStatus: string) => {
        try {
            await updateUserStatusMutation.mutateAsync({
                userId: user.id,
                status: newStatus,
            });
            // 성공 메시지 표시
        } catch (error) {
            console.error('사용자 상태 변경 실패:', error);
            // 에러 메시지 표시
        }
    };

    const handleRoleChange = async (user: AdminUser, newRole: string) => {
        try {
            await updateUserRoleMutation.mutateAsync({
                userId: user.id,
                role: newRole,
            });
            // 성공 메시지 표시
        } catch (error) {
            console.error('사용자 역할 변경 실패:', error);
            // 에러 메시지 표시
        }
    };

    const getRoleLabel = (role: string) => {
        const labels = {
            admin: '관리자',
            artist: '아티스트',
            fan: '팬',
        };
        return labels[role as keyof typeof labels] || role;
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            active: '활성',
            inactive: '비활성',
            suspended: '정지',
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getStatusVariant = (status: string) => {
        const variants = {
            active: 'success' as const,
            inactive: 'default' as const,
            suspended: 'danger' as const,
        };
        return variants[status as keyof typeof variants] || 'default';
    };

    if (loading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* 필터 및 검색 */}
            <Card>
                <CardHeader>
                    <CardTitle>사용자 관리</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="사용자명 또는 이메일로 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="역할" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">모든 역할</SelectItem>
                                <SelectItem value="admin">관리자</SelectItem>
                                <SelectItem value="artist">아티스트</SelectItem>
                                <SelectItem value="fan">팬</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="상태" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">모든 상태</SelectItem>
                                <SelectItem value="active">활성</SelectItem>
                                <SelectItem value="inactive">비활성</SelectItem>
                                <SelectItem value="suspended">정지</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            내보내기
                        </Button>
                    </div>

                    {/* 사용자 테이블 */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>사용자</TableHead>
                                    <TableHead>역할</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>가입일</TableHead>
                                    <TableHead>최근 로그인</TableHead>
                                    <TableHead className="text-right">액션</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar size="sm">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>
                                                        {user.username.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.username}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onValueChange={(newRole) => handleRoleChange(user, newRole)}
                                            >
                                                <SelectTrigger className="w-24">
                                                    <Badge variant="outline" size="sm">
                                                        {getRoleLabel(user.role)}
                                                    </Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">관리자</SelectItem>
                                                    <SelectItem value="artist">아티스트</SelectItem>
                                                    <SelectItem value="fan">팬</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.status}
                                                onValueChange={(newStatus) => handleStatusChange(user, newStatus)}
                                            >
                                                <SelectTrigger className="w-24">
                                                    <Badge variant={getStatusVariant(user.status)} size="sm">
                                                        {getStatusLabel(user.status)}
                                                    </Badge>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">활성</SelectItem>
                                                    <SelectItem value="inactive">비활성</SelectItem>
                                                    <SelectItem value="suspended">정지</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), 'yyyy-MM-dd', { locale: ko })}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewUser(user)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={deleteUserMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            검색 조건에 맞는 사용자가 없습니다.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 사용자 상세 모달 */}
            <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>사용자 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Avatar size="lg">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback>
                                        {selectedUser.username.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedUser.username}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">역할</label>
                                    <p>{getRoleLabel(selectedUser.role)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">상태</label>
                                    <p>
                                        <Badge variant={getStatusVariant(selectedUser.status)} size="sm">
                                            {getStatusLabel(selectedUser.status)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">가입일</label>
                                    <p>{format(new Date(selectedUser.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">최근 로그인</label>
                                    <p>{format(new Date(selectedUser.lastLoginAt), 'yyyy-MM-dd HH:mm', { locale: ko })}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
