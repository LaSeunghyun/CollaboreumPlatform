import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import {
  User,
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  Edit,
  Eye,
  Heart,
  MessageCircle
} from "lucide-react";

interface ArtistMyPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    followers: number;
    following: number;
    totalProjects: number;
    totalEarnings: number;
  };
  onEditProfile?: () => void;
  onCreateProject?: () => void;
  onViewProject?: (projectId: string) => void;
  onEditProject?: (projectId: string) => void;
}

const ArtistMyPage: React.FC<ArtistMyPageProps> = ({
  user,
  onEditProfile,
  onCreateProject,
  onViewProject,
  onEditProject
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // 임시 데이터
  const mockUser = user || {
    id: "1",
    name: "김아티스트",
    email: "artist@example.com",
    avatar: undefined,
    bio: "음악을 사랑하는 아티스트입니다. 다양한 장르의 음악을 만들어가고 있어요.",
    followers: 1250,
    following: 340,
    totalProjects: 8,
    totalEarnings: 2500000
  };

  const mockProjects = [
    {
      id: "1",
      title: "새로운 앨범 프로젝트",
      status: "collecting",
      progress: 75,
      currentAmount: 7500000,
      targetAmount: 10000000,
      backerCount: 156,
      endDate: "2024-03-15",
      image: undefined
    },
    {
      id: "2",
      title: "콘서트 개최 프로젝트",
      status: "succeeded",
      progress: 100,
      currentAmount: 5000000,
      targetAmount: 5000000,
      backerCount: 89,
      endDate: "2024-01-20",
      image: undefined
    }
  ];

  const mockStats = {
    totalViews: 12500,
    totalLikes: 3400,
    totalComments: 890,
    monthlyEarnings: 450000,
    weeklyGrowth: 12.5
  };

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
      case 'collecting':
        return 'bg-primary-100 text-primary-700';
      case 'succeeded':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-danger-100 text-danger-700';
      case 'executing':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collecting':
        return '모금 중';
      case 'succeeded':
        return '성공';
      case 'failed':
        return '실패';
      case 'executing':
        return '집행 중';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 프로필 헤더 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                {mockUser.avatar ? (
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{mockUser.name}</h1>
                    <p className="text-gray-600">{mockUser.email}</p>
                    <p className="text-gray-700 mt-2">{mockUser.bio}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button onClick={onEditProfile} className="flex items-center space-x-2">
                      <Edit className="w-4 h-4" />
                      <span>프로필 편집</span>
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mockUser.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">팔로워</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mockUser.following.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">팔로잉</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mockUser.totalProjects}</div>
                    <div className="text-sm text-gray-600">프로젝트</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">총 수익</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(mockUser.totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">총 조회수</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockStats.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">총 좋아요</p>
                  <p className="text-xl font-bold text-gray-900">
                    {mockStats.totalLikes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">월간 성장률</p>
                  <p className="text-xl font-bold text-gray-900">
                    +{mockStats.weeklyGrowth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="projects">프로젝트</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 최근 활동 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">최근 활동</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">새 프로젝트를 시작했습니다</p>
                        <p className="text-xs text-gray-500">2시간 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">프로젝트가 목표 금액을 달성했습니다</p>
                        <p className="text-xs text-gray-500">1일 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">새로운 댓글이 달렸습니다</p>
                        <p className="text-xs text-gray-500">3일 전</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 성과 요약 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">이번 달 성과</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">월간 수익</span>
                      <span className="font-semibold">{formatCurrency(mockStats.monthlyEarnings)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">새로운 팔로워</span>
                      <span className="font-semibold text-green-600">+{Math.floor(mockUser.followers * 0.1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">프로젝트 조회수</span>
                      <span className="font-semibold">{Math.floor(mockStats.totalViews * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">참여율</span>
                      <span className="font-semibold text-blue-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">내 프로젝트</h3>
              <Button onClick={onCreateProject} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>새 프로젝트</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {project.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewProject?.(project.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProject?.(project.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">진행률</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">모금액</span>
                        <span className="font-medium">{formatCurrency(project.currentAmount)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">후원자</span>
                        <span className="font-medium">{project.backerCount}명</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">상세 분석</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">분석 데이터를 준비 중입니다</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">설정</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">설정 페이지를 준비 중입니다</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistMyPage;