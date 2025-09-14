import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { adminUserAPI, adminProjectAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Activity,
    UserPlus,
    Download,
    Check,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { getFirstChar, getUsername, getAvatarUrl } from '../utils/typeGuards';
import { ko } from 'date-fns/locale';

// Types
interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'artist' | 'fan';
    status: 'active' | 'suspended' | 'banned';
    createdAt: Date;
    lastLoginAt: Date;
    avatar?: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    artist: {
        id: string;
        username: string;
        avatar?: string;
    };
    category: string;
    goalAmount: number;
    currentAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
    createdAt: Date;
    submittedAt: Date;
}

interface ReportedContent {
    id: string;
    type: 'post' | 'comment' | 'project';
    title: string;
    reason: string;
    reporter: string;
    userId: string;
    reportedAt: Date;
    status: 'pending' | 'reviewed' | 'resolved';
    severity: 'low' | 'medium' | 'high';
}

interface PlatformStats {
    totalUsers: number;
    totalProjects: number;
    totalFunding: number;
    activeUsers: number;
    pendingProjects: number;
    completedProjects: number;
    monthlyGrowth: number;
    userRetention: number;
}

// User Management Component
export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await adminUserAPI.getAllUsers();
                // API 응답 구조에 따른 방어 코드
                const usersData = Array.isArray(response) ? response : (response as any)?.data || [];
                setUsers(usersData);
                setFilteredUsers(usersData);
            } catch (err) {
                console.error('사용자 목록 조회 실패:', err);
                setError('사용자 목록을 불러오는데 실패했습니다.');
                // 에러 발생 시 빈 배열로 설정
                setUsers([]);
                setFilteredUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedRole) {
            filtered = filtered.filter(user => user.role === selectedRole);
        }

        if (selectedStatus) {
            filtered = filtered.filter(user => user.status === selectedStatus);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, selectedRole, selectedStatus]);

    const handleStatusChange = (userId: string, newStatus: string) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, status: newStatus as any } : user
        ));
        // 사용자 상태 변경 API 호출
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, role: newRole as any } : user
        ));
        // 사용자 권한 변경 API 호출
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                console.error('사용자 권한 변경 실패');
            }
        } catch (error) {
            console.error('사용자 권한 변경 중 오류:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: '활성', variant: 'default' as const },
            suspended: { label: '정지', variant: 'secondary' as const },
            banned: { label: '차단', variant: 'destructive' as const }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            admin: { label: '관리자', variant: 'default' as const, className: 'bg-red-600' },
            artist: { label: '아티스트', variant: 'default' as const, className: 'bg-blue-600' },
            fan: { label: '팬', variant: 'default' as const, className: 'bg-green-600' }
        };

        const config = roleConfig[role as keyof typeof roleConfig];
        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="사용자 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="권한" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                            <SelectItem value="artist">아티스트</SelectItem>
                            <SelectItem value="fan">팬</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="상태" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="active">활성</SelectItem>
                            <SelectItem value="suspended">정지</SelectItem>
                            <SelectItem value="banned">차단</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 사용자 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>사용자 관리</span>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            사용자 추가
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>사용자</TableHead>
                                <TableHead>권한</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>가입일</TableHead>
                                <TableHead>마지막 로그인</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{getFirstChar(user.username)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.username}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fan">팬</SelectItem>
                                                <SelectItem value="artist">아티스트</SelectItem>
                                                <SelectItem value="admin">관리자</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={user.status} onValueChange={(value) => handleStatusChange(user.id, value)}>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">활성</SelectItem>
                                                <SelectItem value="suspended">정지</SelectItem>
                                                <SelectItem value="banned">차단</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {format(user.createdAt, 'MM/dd/yyyy', { locale: ko })}
                                    </TableCell>
                                    <TableCell>
                                        {format(user.lastLoginAt, 'MM/dd/yyyy', { locale: ko })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 사용자 상세 정보 다이얼로그 */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>사용자 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback>{getFirstChar(selectedUser.username)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedUser.username}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        {getRoleBadge(selectedUser.role)}
                                        {getStatusBadge(selectedUser.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">가입일</p>
                                    <p className="font-medium">{format(selectedUser.createdAt, 'PPP', { locale: ko })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">마지막 로그인</p>
                                    <p className="font-medium">{format(selectedUser.lastLoginAt, 'PPP', { locale: ko })}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    데이터 내보내기
                                </Button>
                                <Button variant="destructive" className="flex-1">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    계정 삭제
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Project Approval Component
export const ProjectApproval: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            // API에서 프로젝트 목록 가져오기
            try {
                const response = await fetch('/api/admin/projects');
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.data || []);
                }
            } catch (error) {
                console.error('프로젝트 목록 로드 실패:', error);
                setProjects([]);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.artist?.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus) {
            filtered = filtered.filter(project => project.status === selectedStatus);
        }

        setFilteredProjects(filtered);
    }, [projects, searchTerm, selectedStatus]);

    const handleApproval = async (projectId: string, action: 'approve' | 'reject') => {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        setProjects(prev => prev.map(project =>
            project.id === projectId ? { ...project, status: newStatus } : project
        ));
        // API 호출하여 프로젝트 승인/거절
        try {
            const response = await fetch(`/api/admin/projects/${projectId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setProjects(prev => prev.map(project =>
                    project.id === projectId ? { ...project, status: newStatus as any } : project
                ));
                alert(`프로젝트가 ${newStatus === 'approved' ? '승인' : '거절'}되었습니다.`);
            } else {
                alert('프로젝트 상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로젝트 상태 변경 중 오류:', error);
            alert('프로젝트 상태 변경 중 오류가 발생했습니다.');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: '승인 대기', variant: 'secondary' as const },
            approved: { label: '승인됨', variant: 'default' as const },
            rejected: { label: '거절됨', variant: 'destructive' as const },
            active: { label: '진행중', variant: 'outline' as const },
            completed: { label: '완료', variant: 'outline' as const }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getCategoryLabel = (category: string) => {
        const categoryLabels: Record<string, string> = {
            music: '음악',
            art: '예술',
            technology: '기술',
            culture: '문화',
            sports: '스포츠',
            other: '기타'
        };
        return categoryLabels[category] || category;
    };

    return (
        <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="프로젝트 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="상태" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            <SelectItem value="pending">승인 대기</SelectItem>
                            <SelectItem value="approved">승인됨</SelectItem>
                            <SelectItem value="rejected">거절됨</SelectItem>
                            <SelectItem value="active">진행중</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 프로젝트 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle>프로젝트 승인</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredProjects.map(project => (
                            <div key={project.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={project.artist.avatar} />
                                                <AvatarFallback>{getFirstChar(project.artist)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{project.title}</h3>
                                                <p className="text-sm text-gray-600">아티스트: {project.artist.username}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span>카테고리: {getCategoryLabel(project.category)}</span>
                                            <span>목표 금액: {project.goalAmount.toLocaleString()}원</span>
                                            <span>제출일: {format(project.submittedAt, 'MM/dd/yyyy', { locale: ko })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(project.status)}

                                        {project.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproval(project.id, 'approve')}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    승인
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleApproval(project.id, 'reject')}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    거절
                                                </Button>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setIsDetailDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 프로젝트 상세 정보 다이얼로그 */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>프로젝트 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedProject && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedProject.title}</h3>
                                <p className="text-gray-600">아티스트: {selectedProject.artist.username}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">카테고리</p>
                                    <p className="font-medium">{getCategoryLabel(selectedProject.category)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">목표 금액</p>
                                    <p className="font-medium">{selectedProject.goalAmount.toLocaleString()}원</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">제출일</p>
                                    <p className="font-medium">{format(selectedProject.submittedAt, 'PPP', { locale: ko })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">상태</p>
                                    {getStatusBadge(selectedProject.status)}
                                </div>
                            </div>

                            {selectedProject.status === 'pending' && (
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleApproval(selectedProject.id, 'approve')}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        승인
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleApproval(selectedProject.id, 'reject')}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        거절
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Platform Statistics Component
export const PlatformStatistics: React.FC = () => {
    const [stats, setStats] = useState<PlatformStats>({
        totalUsers: 1500,
        totalProjects: 89,
        totalFunding: 45000000,
        activeUsers: 1200,
        pendingProjects: 12,
        completedProjects: 67,
        monthlyGrowth: 15.5,
        userRetention: 78.3
    });

    const [timeRange, setTimeRange] = useState('month');

    return (
        <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">총 사용자</p>
                                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                            <span className="text-sm text-gray-500 ml-2">이번 달</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-gray-500">승인 대기: {stats.pendingProjects}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">총 펀딩</p>
                                <p className="text-2xl font-bold">{(stats.totalFunding / 1000000).toFixed(1)}M</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-gray-500">완료: {stats.completedProjects}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                                <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-gray-500">유지율: {stats.userRetention}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 차트 및 상세 통계 */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>사용자 성장 추이</span>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">주간</SelectItem>
                                    <SelectItem value="month">월간</SelectItem>
                                    <SelectItem value="year">연간</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">차트가 여기에 표시됩니다</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>프로젝트 카테고리별 분포</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">파이 차트가 여기에 표시됩니다</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 추가 통계 */}
            <Card>
                <CardHeader>
                    <CardTitle>상세 통계</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                            <p className="text-sm text-gray-600">총 사용자</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.totalProjects}</p>
                            <p className="text-sm text-gray-600">총 프로젝트</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {(stats.totalFunding / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-sm text-gray-600">총 펀딩 (원)</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats.userRetention}%</p>
                            <p className="text-sm text-gray-600">사용자 유지율</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Content Moderation Component
export const ContentModeration: React.FC = () => {
    // 신고된 콘텐츠 데이터 상태
    const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
    const [filteredContent, setFilteredContent] = useState<ReportedContent[]>([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [contentError, setContentError] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // 신고된 콘텐츠 데이터 로드
    useEffect(() => {
        const loadReportedContent = async () => {
            try {
                setContentLoading(true);
                setContentError(null);

                // 실제 API 호출로 변경
                const response = await fetch('/api/admin/reported-content');
                if (!response.ok) {
                    throw new Error('신고된 콘텐츠 데이터를 불러올 수 없습니다.');
                }

                const data = await response.json();
                if (data.success) {
                    setReportedContent(data.data);
                    setFilteredContent(data.data);
                } else {
                    throw new Error(data.message || '신고된 콘텐츠 데이터를 불러올 수 없습니다.');
                }
            } catch (error) {
                console.error('신고된 콘텐츠 데이터 로드 실패:', error);
                setContentError(error instanceof Error ? error.message : '신고된 콘텐츠 데이터를 불러올 수 없습니다.');
                setReportedContent([]);
                setFilteredContent([]);
            } finally {
                setContentLoading(false);
            }
        };

        loadReportedContent();
    }, []);

    useEffect(() => {
        let filtered = reportedContent;

        if (selectedSeverity) {
            filtered = filtered.filter(content => content.severity === selectedSeverity);
        }

        if (selectedStatus) {
            filtered = filtered.filter(content => content.status === selectedStatus);
        }

        setFilteredContent(filtered);
    }, [reportedContent, selectedSeverity, selectedStatus]);

    const handleModerationAction = async (contentId: string, action: 'approve' | 'remove' | 'warn', userId: string, reason: string = '') => {
        setReportedContent(prev => prev.map(content =>
            content.id === contentId ? { ...content, status: 'resolved' } : content
        ));
        // API 호출하여 조치 실행
        try {
            const response = await fetch(`/api/admin/users/${userId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ action, reason })
            });

            if (response.ok) {
                alert(`사용자에게 ${action} 조치가 실행되었습니다.`);
                // 사용자 목록 새로고침
                window.location.reload();
            } else {
                alert('사용자 조치 실행에 실패했습니다.');
            }
        } catch (error) {
            console.error('사용자 조치 실행 중 오류:', error);
            alert('사용자 조치 실행 중 오류가 발생했습니다.');
        }
    };

    const getSeverityBadge = (severity: string) => {
        const severityConfig = {
            low: { label: '낮음', variant: 'outline' as const },
            medium: { label: '보통', variant: 'secondary' as const },
            high: { label: '높음', variant: 'destructive' as const }
        };

        const config = severityConfig[severity as keyof typeof severityConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: '검토 대기', variant: 'secondary' as const },
            reviewed: { label: '검토됨', variant: 'outline' as const },
            resolved: { label: '해결됨', variant: 'default' as const }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            post: '게시글',
            comment: '댓글',
            project: '프로젝트'
        };
        return typeLabels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* 필터 */}
            <div className="flex gap-4">
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="심각도" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">전체</SelectItem>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">전체</SelectItem>
                        <SelectItem value="pending">검토 대기</SelectItem>
                        <SelectItem value="reviewed">검토됨</SelectItem>
                        <SelectItem value="resolved">해결됨</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 신고된 콘텐츠 목록 */}
            <Card>
                <CardHeader>
                    <CardTitle>콘텐츠 검토</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredContent.map(content => (
                            <div key={content.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                                            {getSeverityBadge(content.severity)}
                                            {getStatusBadge(content.status)}
                                        </div>

                                        <h3 className="font-semibold mb-2">{content.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            신고 사유: {content.reason}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>신고자: {content.reporter}</span>
                                            <span>신고일: {format(content.reportedAt, 'MM/dd/yyyy', { locale: ko })}</span>
                                        </div>
                                    </div>

                                    {content.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleModerationAction(content.id, 'approve', content.userId, '승인')}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                승인
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleModerationAction(content.id, 'remove', content.userId, '부적절한 콘텐츠')}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                삭제
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleModerationAction(content.id, 'warn', content.userId, '경고 조치')}
                                            >
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                경고
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main Admin Dashboard Component
export const AdminDashboardSystem: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
                <p className="text-gray-600">플랫폼을 관리하고 모니터링하세요</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">개요</TabsTrigger>
                    <TabsTrigger value="users">사용자 관리</TabsTrigger>
                    <TabsTrigger value="projects">프로젝트 승인</TabsTrigger>
                    <TabsTrigger value="moderation">콘텐츠 검토</TabsTrigger>
                    <TabsTrigger value="settings">설정</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <PlatformStatistics />
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                    <ProjectApproval />
                </TabsContent>

                <TabsContent value="moderation" className="mt-6">
                    <ContentModeration />
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <div className="text-center py-12">
                        <p className="text-gray-500">관리자 설정 기능은 곧 추가될 예정입니다.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboardSystem;
