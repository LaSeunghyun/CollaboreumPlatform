import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import {
  Users,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface AdminDashboardSystemProps {
  onUserAction?: (action: string, userId: string) => void;
  onProjectAction?: (action: string, projectId: string) => void;
}

const AdminDashboardSystem: React.FC<AdminDashboardSystemProps> = ({
  onUserAction,
  onProjectAction
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // 임시 데이터
  const mockStats = {
    totalUsers: 1250,
    totalProjects: 89,
    totalRevenue: 12500000,
    pendingApprovals: 12,
    activeUsers: 890,
    completedProjects: 67,
    monthlyGrowth: 15.2,
    systemHealth: 98.5
  };

  const mockUsers = [
    {
      id: "1",
      name: "김아티스트",
      email: "artist@example.com",
      role: "artist",
      status: "active",
      joinDate: "2024-01-15",
      projects: 3,
      lastActive: "2024-02-10"
    },
    {
      id: "2",
      name: "박팬",
      email: "fan@example.com",
      role: "fan",
      status: "active",
      joinDate: "2024-01-20",
      projects: 0,
      lastActive: "2024-02-09"
    }
  ];

  const mockProjects = [
    {
      id: "1",
      title: "새로운 앨범 프로젝트",
      artist: "김아티스트",
      status: "collecting",
      amount: 7500000,
      targetAmount: 10000000,
      backers: 156,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "콘서트 개최 프로젝트",
      artist: "박뮤지션",
      status: "succeeded",
      amount: 5000000,
      targetAmount: 5000000,
      backers: 89,
      createdAt: "2024-01-10"
    }
  ];

  const mockAlerts = [
    {
      id: "1",
      type: "warning",
      title: "시스템 리소스 사용량 높음",
      message: "CPU 사용률이 85%를 초과했습니다.",
      time: "5분 전"
    },
    {
      id: "2",
      type: "info",
      title: "새로운 프로젝트 승인 요청",
      message: "3개의 프로젝트가 승인을 기다리고 있습니다.",
      time: "1시간 전"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'suspended':
        return 'bg-danger-100 text-danger-700';
      case 'collecting':
        return 'bg-primary-100 text-primary-700';
      case 'succeeded':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'suspended':
        return '정지';
      case 'collecting':
        return '모금 중';
      case 'succeeded':
        return '성공';
      case 'failed':
        return '실패';
      default:
        return status;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1">시스템 전체 현황을 모니터링하고 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">총 수익</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockStats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">총 프로젝트</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-warning-600" />
                <div>
                  <p className="text-sm text-gray-600">승인 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.pendingApprovals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 알림 */}
        {mockAlerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">시스템 알림</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
            <TabsTrigger value="system">시스템 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 시스템 상태 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">시스템 상태</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">시스템 건강도</span>
                      <span className="font-semibold text-green-600">{mockStats.systemHealth}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${mockStats.systemHealth}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">활성 사용자</span>
                      <span className="font-semibold">{mockStats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">완료된 프로젝트</span>
                      <span className="font-semibold">{mockStats.completedProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">월간 성장률</span>
                      <span className="font-semibold text-green-600">+{mockStats.monthlyGrowth}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 최근 활동 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">최근 활동</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">새로운 사용자가 가입했습니다</p>
                        <p className="text-xs text-gray-500">10분 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">프로젝트가 승인되었습니다</p>
                        <p className="text-xs text-gray-500">1시간 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">새로운 후원이 발생했습니다</p>
                        <p className="text-xs text-gray-500">2시간 전</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">사용자 관리</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">가입일: {user.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => onUserAction?.('view', user.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onUserAction?.('edit', user.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onUserAction?.('suspend', user.id)}>
                            <Shield className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">프로젝트 관리</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">by {project.artist}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>목표: {formatCurrency(project.targetAmount)}</span>
                          <span>•</span>
                          <span>현재: {formatCurrency(project.amount)}</span>
                          <span>•</span>
                          <span>후원자: {project.backers}명</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => onProjectAction?.('view', project.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onProjectAction?.('approve', project.id)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onProjectAction?.('reject', project.id)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">시스템 설정</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">시스템 설정 페이지를 준비 중입니다</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardSystem;