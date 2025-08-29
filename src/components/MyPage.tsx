import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { User, Edit, Heart, TrendingUp, Gift, Bell, Shield, CreditCard, Settings, Camera, BarChart3, Palette, Users, DollarSign, Calendar, Star } from "lucide-react";
import { userAPI } from '../services/api';
import { User as UserType, Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';

// 기본 사용자 데이터 (API에서 받아올 예정)
const defaultUserData = {
  name: "",
  email: "",
  username: "",
  bio: "",
  joinDate: "",
  location: "",
  website: "",
  avatar: ""
};

// 기본 투자 내역 데이터 (API에서 받아올 예정)
const defaultInvestmentHistory: any[] = [];

// 기본 팔로우 아티스트 데이터 (API에서 받아올 예정)
const defaultFollowingArtists: any[] = [];

// 포인트 데이터는 API에서 받아올 예정
const pointsData = {
  totalPoints: 0,
  availablePoints: 0,
  pendingPoints: 0,
  monthlyEarnings: 0
};

export function MyPage() {
  const { user } = useAuth();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // 타입 가드 함수
  const isAdmin = (role: string | undefined): role is 'admin' => role === 'admin';
  const isArtist = (role: string | undefined): role is 'artist' => role === 'artist';
  const isFan = (role: string | undefined): role is 'fan' => role === 'fan';

  // 상태 변수들
  const [userData, setUserData] = useState(defaultUserData);
  const [investmentHistory, setInvestmentHistory] = useState(defaultInvestmentHistory);
  const [followingArtists, setFollowingArtists] = useState(defaultFollowingArtists);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // API에서 사용자 프로필 로드
        const userResponse = await userAPI.getUserProfile('1'); // userId 1로 가정
        if ((userResponse as any).success && (userResponse as any).data) {
          const apiUser = ((userResponse as any).data as any).user;
          if (apiUser) {
            setUserData({
              ...defaultUserData,
              ...apiUser
            });
          }
        }

        // TODO: 투자 내역과 팔로우 아티스트 API 연동
        // const investmentsResponse = await apiService.getUserInvestments();
        // const followingResponse = await apiService.getUserFollowing();

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        // 에러 발생 시 기본 데이터 사용
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // AdminDashboard로 돌아가기
  const handleBackFromAdmin = () => {
    setShowAdminDashboard(false);
  };

  // AdminDashboard 표시
  if (showAdminDashboard) {
    return <AdminDashboard onBack={handleBackFromAdmin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 역할에 따른 탭 구성
  const getTabsForRole = () => {
    if (isAdmin(user?.role)) {
      return (
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="investments">투자 내역</TabsTrigger>
          <TabsTrigger value="following">팔로잉</TabsTrigger>
          <TabsTrigger value="points">포인트</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="admin">관리자</TabsTrigger>
        </TabsList>
      );
    } else if (isArtist(user?.role)) {
      return (
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
          <TabsTrigger value="earnings">수익 현황</TabsTrigger>
          <TabsTrigger value="fans">팬 관리</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>
      );
    } else {
      // fan 또는 undefined
      return (
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="investments">투자 내역</TabsTrigger>
          <TabsTrigger value="following">팔로잉</TabsTrigger>
          <TabsTrigger value="points">포인트</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>
      );
    }
  };

  // 사용자 역할에 따른 프로필 헤더
  const getProfileHeader = () => {
    const roleBadge = isAdmin(user?.role) ? '관리자' :
      isArtist(user?.role) ? '아티스트' : '팬';

    const roleColor = isAdmin(user?.role) ? 'bg-red-100 text-red-800' :
      isArtist(user?.role) ? 'bg-purple-100 text-purple-800' :
        'bg-pink-100 text-pink-800';

    return (
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <Badge className={roleColor}>{roleBadge}</Badge>
              </div>
              <p className="text-gray-600 mb-2">{userData.username}</p>
              <p className="text-gray-700 mb-4">{userData.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                <span>📍 {userData.location}</span>
                <span>📅 가입일: {userData.joinDate}</span>
                <span>🌐 <a href={userData.website} className="text-blue-600 hover:underline">블로그</a></span>
              </div>

              <div className="flex justify-center md:justify-start gap-3">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  프로필 수정
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        {getProfileHeader()}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          {getTabsForRole()}

          {/* Overview Tab - 모든 역할 공통 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">총 투자 금액</h3>
                  <p className="text-2xl font-bold text-blue-600">₩105,000</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">누적 수익</h3>
                  <p className="text-2xl font-bold text-green-600">+₩17,750</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-1">후원 프로젝트</h3>
                  <p className="text-2xl font-bold text-purple-600">3개</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">프로젝트 후원 활동</span>
                    <span className="text-xs text-gray-500 ml-auto">2일 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">포인트 수익 발생</span>
                    <span className="text-xs text-gray-500 ml-auto">1주 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">새 팔로우</span>
                    <span className="text-xs text-gray-500 ml-auto">2주 전</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab - 팬과 관리자용 */}
          {(isFan(user?.role) || isAdmin(user?.role)) && (
            <TabsContent value="investments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>투자 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investmentHistory.map((investment) => (
                      <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{investment.project}</h4>
                            <p className="text-sm text-gray-600">by {investment.artist}</p>
                          </div>
                          <Badge
                            className={
                              investment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {investment.status === 'completed' ? '완료' : '진행중'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">투자금:</span>
                            <p className="font-medium">₩{investment.invested?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">수익:</span>
                            <p className={`font-medium ${investment.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                              {investment.status === 'completed' ? '+' : '예상 '}
                              ₩{investment.returned?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">투자일:</span>
                            <p className="font-medium">{investment.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Portfolio Tab - 아티스트용 */}
          {user?.role === 'artist' && (
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>포트폴리오</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">포트폴리오 기능을 준비 중입니다...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Following Tab - 팬과 관리자용 */}
          {(isFan(user?.role) || isAdmin(user?.role)) && (
            <TabsContent value="following" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>팔로잉 아티스트 ({followingArtists.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {followingArtists.map((artist, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={artist.avatar} alt={artist.name} />
                            <AvatarFallback>{artist.name?.charAt(0) || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{artist.name}</h4>
                            <p className="text-sm text-gray-600">{artist.category}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          언팔로우
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Points Tab - 모든 역할 공통 */}
          <TabsContent value="points" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>포인트 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">사용 가능 포인트</p>
                    <p className="text-3xl font-bold text-blue-600">{pointsData.availablePoints.toLocaleString()}P</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-gray-600">총 적립</p>
                      <p className="font-bold">{pointsData.totalPoints.toLocaleString()}P</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-gray-600">대기 중</p>
                      <p className="font-bold">{pointsData.pendingPoints.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>포인트 활용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-3" />
                    새 프로젝트에 투자하기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="w-4 h-4 mr-3" />
                    굿즈샵에서 사용하기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-3" />
                    현금으로 전환하기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Tab - 관리자용 */}
          {isAdmin(user?.role) && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>관리자 기능</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">관리자 대시보드</h3>
                    <p className="text-gray-600 mb-6">플랫폼 운영 현황을 관리하고 모니터링하세요</p>
                    <Button
                      size="lg"
                      onClick={() => setShowAdminDashboard(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      관리자 대시보드 열기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab - 모든 역할 공통 */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="funding-notifications">펀딩 프로젝트 알림</Label>
                    <p className="text-sm text-gray-600">새로운 펀딩 프로젝트 소식을 받습니다</p>
                  </div>
                  <Switch id="funding-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="artist-notifications">팔로잉 아티스트 알림</Label>
                    <p className="text-sm text-gray-600">팔로잉 아티스트의 새 소식을 받습니다</p>
                  </div>
                  <Switch id="artist-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="point-notifications">포인트 적립 알림</Label>
                    <p className="text-sm text-gray-600">포인트 적립 시 알림을 받습니다</p>
                  </div>
                  <Switch id="point-notifications" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>계정 정보 수정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" defaultValue={userData.name} />
                  </div>
                  <div>
                    <Label htmlFor="username">사용자명</Label>
                    <Input id="username" defaultValue={userData.username} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" defaultValue={userData.email} />
                </div>

                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Textarea id="bio" defaultValue={userData.bio} rows={3} />
                </div>

                <Button>변경 사항 저장</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}