import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import {
  User,
  Heart,
  Bookmark,
  DollarSign,
  Star,
  Eye,
  Settings
} from "lucide-react";

interface FanMyPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    following: number;
    totalPledges: number;
    totalAmount: number;
  };
  onEditProfile?: () => void;
  onViewProject?: (projectId: string) => void;
  onFollowArtist?: (artistId: string) => void;
}

const FanMyPage: React.FC<FanMyPageProps> = ({
  user,
  onEditProfile,
  onViewProject,
  onFollowArtist
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  // 임시 데이터
  const mockUser = user || {
    id: "1",
    name: "김팬",
    email: "fan@example.com",
    avatar: undefined,
    bio: "음악을 사랑하는 팬입니다. 다양한 아티스트들을 응원하고 있어요.",
    following: 15,
    totalPledges: 8,
    totalAmount: 1200000
  };

  const mockPledges = [
    {
      id: "1",
      projectTitle: "새로운 앨범 프로젝트",
      artistName: "김아티스트",
      amount: 50000,
      status: "completed",
      pledgeDate: "2024-01-15",
      rewardTitle: "디지털 앨범 + 스티커팩"
    },
    {
      id: "2",
      projectTitle: "콘서트 개최 프로젝트",
      artistName: "박뮤지션",
      amount: 100000,
      status: "completed",
      pledgeDate: "2024-01-10",
      rewardTitle: "콘서트 티켓 + 사인 CD"
    }
  ];

  const mockFollowing = [
    {
      id: "1",
      name: "김아티스트",
      avatar: undefined,
      followers: 1250,
      isFollowing: true
    },
    {
      id: "2",
      name: "박뮤지션",
      avatar: undefined,
      followers: 890,
      isFollowing: true
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
      case 'completed':
        return 'bg-success-100 text-success-700';
      case 'pending':
        return 'bg-warning-100 text-warning-700';
      case 'cancelled':
        return 'bg-danger-100 text-danger-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'pending':
        return '대기중';
      case 'cancelled':
        return '취소됨';
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
                    <Button onClick={onEditProfile} variant="outline" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>프로필 편집</span>
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mockUser.following}</div>
                    <div className="text-sm text-gray-600">팔로잉</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mockUser.totalPledges}</div>
                    <div className="text-sm text-gray-600">후원 횟수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockUser.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-600">총 후원액</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="pledges">후원 내역</TabsTrigger>
            <TabsTrigger value="following">팔로잉</TabsTrigger>
            <TabsTrigger value="favorites">즐겨찾기</TabsTrigger>
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
                        <DollarSign className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">새로운 프로젝트에 후원했습니다</p>
                        <p className="text-xs text-gray-500">1일 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">아티스트를 팔로우했습니다</p>
                        <p className="text-xs text-gray-500">3일 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">프로젝트를 즐겨찾기에 추가했습니다</p>
                        <p className="text-xs text-gray-500">1주일 전</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 통계 요약 */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">이번 달 활동</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">후원 횟수</span>
                      <span className="font-semibold">3회</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">후원 금액</span>
                      <span className="font-semibold">{formatCurrency(150000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">새로운 팔로우</span>
                      <span className="font-semibold text-green-600">+2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">즐겨찾기</span>
                      <span className="font-semibold text-blue-600">5개</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pledges" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">후원 내역</h3>
              {mockPledges.map((pledge) => (
                <Card key={pledge.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {pledge.projectTitle}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">by {pledge.artistName}</p>
                        <p className="text-sm text-gray-700 mb-2">{pledge.rewardTitle}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>후원일: {pledge.pledgeDate}</span>
                          <span>•</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(pledge.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pledge.status)}`}>
                          {getStatusText(pledge.status)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewProject?.(pledge.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">팔로잉 중인 아티스트</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockFollowing.map((artist) => (
                  <Card key={artist.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          {artist.avatar ? (
                            <img
                              src={artist.avatar}
                              alt={artist.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{artist.name}</h4>
                          <p className="text-sm text-gray-600">{artist.followers}명 팔로워</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFollowArtist?.(artist.id)}
                        >
                          팔로우
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">즐겨찾기</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">즐겨찾기한 프로젝트가 없습니다</p>
                  <Button className="mt-4" onClick={() => setActiveTab("overview")}>
                    프로젝트 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FanMyPage;